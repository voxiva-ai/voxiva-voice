use std::io::Read;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use crate::config::{AppSettings, DictationLanguage};
use crate::services::audio::CapturedAudio;

fn resolve_cli_path(settings: &AppSettings) -> Result<PathBuf, String> {
    let Some(p) = settings.whisper_cli_path.as_ref() else {
        return Err("whisperCliPath is not set (point to whisper-cli.exe)".to_string());
    };
    Ok(PathBuf::from(p))
}

fn resolve_model_path(settings: &AppSettings) -> Result<PathBuf, String> {
    let Some(p) = settings.whisper_model_path.as_ref() else {
        return Err("whisperModelPath is not set (point to ggml-*.bin model)".to_string());
    };
    Ok(PathBuf::from(p))
}

fn resample_linear_mono(input: &[f32], from_hz: u32, to_hz: u32) -> Vec<f32> {
    if from_hz == 0 || to_hz == 0 || input.is_empty() {
        return Vec::new();
    }
    if from_hz == to_hz {
        return input.to_vec();
    }
    let ratio = to_hz as f64 / from_hz as f64;
    let out_len = (input.len() as f64 * ratio).round().max(1.0) as usize;
    let mut out = Vec::with_capacity(out_len);

    for i in 0..out_len {
        let src = i as f64 / ratio;
        let idx = src.floor() as usize;
        let frac = (src - idx as f64) as f32;
        let a = input.get(idx).copied().unwrap_or(0.0);
        let b = input.get(idx.saturating_add(1)).copied().unwrap_or(a);
        out.push(a + (b - a) * frac);
    }

    out
}

fn write_temp_wav_16k(audio: &CapturedAudio) -> Result<tempfile::TempPath, String> {
    let tmp = tempfile::Builder::new()
        .prefix("voxiva-voice-")
        .suffix(".wav")
        .tempfile()
        .map_err(|e| e.to_string())?;
    let path = tmp.into_temp_path();

    let samples_16k = resample_linear_mono(&audio.samples, audio.sample_rate_hz, 16_000);

    let spec = hound::WavSpec {
        channels: 1,
        sample_rate: 16_000,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    let mut writer = hound::WavWriter::create(&path, spec).map_err(|e| e.to_string())?;

    for s in samples_16k {
        let clamped = s.clamp(-1.0, 1.0);
        let v = (clamped * i16::MAX as f32) as i16;
        writer.write_sample(v).map_err(|e| e.to_string())?;
    }

    writer.finalize().map_err(|e| e.to_string())?;
    Ok(path)
}

fn whisper_lang_arg(lang: DictationLanguage) -> Option<&'static str> {
    match lang {
        DictationLanguage::Auto => None,
        DictationLanguage::En => Some("en"),
        DictationLanguage::Ru => Some("ru"),
    }
}

fn whisper_lang_arg_with_locale(settings: &AppSettings) -> Option<&'static str> {
    // Whisper's auto language detection can be flaky on short utterances, especially RU/EN.
    // If user didn't choose an explicit dictation language, we "soft-pin" it to UI locale.
    if let Some(l) = whisper_lang_arg(settings.dictation_language) {
        return Some(l);
    }
    let loc = settings.ui_locale.to_lowercase();
    if loc.starts_with("ru") {
        Some("ru")
    } else if loc.starts_with("en") {
        Some("en")
    } else {
        None
    }
}

fn parse_whisper_cli_output(s: &str) -> String {
    // whisper-cli prints segments like:
    // [00:00.000 --> 00:02.000]  hello world
    // We'll keep only the text parts, join with spaces.
    let mut parts: Vec<String> = Vec::new();
    for line in s.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Some(idx) = line.find(']') {
            let tail = line[idx + 1..].trim();
            if !tail.is_empty() {
                parts.push(tail.to_string());
            }
        }
    }
    if parts.is_empty() {
        s.trim().to_string()
    } else {
        parts.join(" ")
    }
}

pub fn transcribe_whisper_cli(audio: &CapturedAudio, settings: &AppSettings) -> Result<String, String> {
    let cli = resolve_cli_path(settings)?;
    let model = resolve_model_path(settings)?;
    if !cli.exists() {
        return Err(format!("whisper-cli not found at {}", cli.display()));
    }
    if !model.exists() {
        return Err(format!("model not found at {}", model.display()));
    }

    let wav_path = write_temp_wav_16k(audio)?;
    let wav_fs_path: &std::path::Path = wav_path.as_ref();
    let wav_len = std::fs::metadata(wav_fs_path)
        .map(|m| m.len())
        .unwrap_or_default();
    if wav_len < 64 {
        return Err(format!("generated WAV looks too small ({wav_len} bytes)"));
    }

    let mut cmd = Command::new(cli);
    cmd.arg("-m").arg(&model);
    cmd.arg("-f").arg(wav_fs_path);
    // Speed tweaks:
    // - balanced decoding: small beam improves accuracy a lot on short phrases
    // - auto threads based on CPU count
    cmd.args(["-nt", "-np"]);
    cmd.args(["-bs", "5", "-bo", "5"]);
    let threads = std::thread::available_parallelism()
        .map(|n| n.get().to_string())
        .unwrap_or_else(|_| "4".to_string());
    cmd.args(["-t", threads.as_str()]);

    if let Some(l) = whisper_lang_arg_with_locale(settings) {
        cmd.arg("-l").arg(l);
    }

    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| e.to_string())?;
    let mut stdout = String::new();
    let mut stderr = String::new();

    if let Some(mut out) = child.stdout.take() {
        let _ = out.read_to_string(&mut stdout);
    }
    if let Some(mut err) = child.stderr.take() {
        let _ = err.read_to_string(&mut stderr);
    }

    let status = child.wait().map_err(|e| e.to_string())?;
    if !status.success() {
        let msg = if stderr.trim().is_empty() {
            format!("whisper-cli exited with {status}")
        } else {
            stderr.trim().to_string()
        };
        return Err(msg);
    }

    let mut text = parse_whisper_cli_output(&stdout);
    if text.trim().is_empty() {
        // Some builds print segments to stderr; fall back if needed.
        text = parse_whisper_cli_output(&stderr);
    }
    Ok(text)
}

