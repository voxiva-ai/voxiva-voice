//! Orchestrates PTT / toggle capture → STT → dictionary → paste.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;

use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;

use crate::config::{AppSettings, RecordingMode};
use crate::services::{audio, dictionary, focus, injection, stt};

/// Tracks an active capture session (`stop` flag for cpal loop).
pub struct DictationGate {
    pub inner: Mutex<GateInner>,
}

#[derive(Default)]
pub struct GateInner {
    pub stop: Option<Arc<AtomicBool>>,
}

/// Background voice-activation loop (no hotkey).
#[derive(Default)]
pub struct VoiceActivationGate {
    pub running: Arc<AtomicBool>,
}

impl Default for DictationGate {
    fn default() -> Self {
        Self {
            inner: Mutex::new(GateInner::default()),
        }
    }
}

impl DictationGate {
    pub fn clear_stop(&self) {
        self.inner.lock().unwrap().stop = None;
    }
}

fn set_hud_visible(app: &AppHandle, visible: bool) {
    if let Some(w) = app.get_webview_window("hud") {
        let _ = if visible { w.show() } else { w.hide() };
    }
}

fn emit_hud(app: &AppHandle, phase: &str, target: Option<String>) {
    let _ = app.emit_to(
        "hud",
        "vv:hud",
        serde_json::json!({
            "phase": phase,
            "target": target.unwrap_or_default(),
        }),
    );
}

fn emit_hud_level(app: &AppHandle, level: f32) {
    let _ = app.emit_to(
        "hud",
        "vv:hud",
        serde_json::json!({ "phase": "recording", "level": level }),
    );
}

fn emit_hud_phase(app: &AppHandle, phase: &str) {
    let _ = app.emit_to("hud", "vv:hud", serde_json::json!({ "phase": phase }));
}

fn emit_hud_error(app: &AppHandle, message: &str) {
    let _ = app.emit_to(
        "hud",
        "vv:hud",
        serde_json::json!({ "phase": "error", "message": message }),
    );
}

fn clear_dictation_gate(app: &AppHandle) {
    if let Some(g) = app.try_state::<DictationGate>() {
        g.clear_stop();
    }
}

fn has_enough_audio(audio: &audio::CapturedAudio) -> bool {
    if audio.sample_rate_hz == 0 || audio.samples.is_empty() {
        return false;
    }

    let duration_ms = (audio.samples.len() as f64 / audio.sample_rate_hz as f64) * 1000.0;
    if duration_ms < 180.0 {
        return false;
    }

    let sum = audio.samples.iter().map(|s| s * s).sum::<f32>();
    let rms = (sum / audio.samples.len() as f32).sqrt();
    rms >= 0.002
}

pub fn begin_session(app: AppHandle, settings: AppSettings) {
    let gate = match app.try_state::<DictationGate>() {
        Some(g) => g,
        None => return,
    };
    {
        let mut g = gate.inner.lock().unwrap();
        if g.stop.is_some() {
            return;
        }
        let stop = Arc::new(AtomicBool::new(false));
        g.stop = Some(stop.clone());
    }

    set_hud_visible(&app, true);
    let title = focus::foreground_window_title();
    emit_hud(&app, "recording", title);

    let app_th = app.clone();
    let settings_th = settings;
    thread::spawn(move || {
        let stop = {
            let gate = match app_th.try_state::<DictationGate>() {
                Some(g) => g,
                None => return,
            };
            let g = gate.inner.lock().unwrap();
            g.stop
                .clone()
                .unwrap_or_else(|| Arc::new(AtomicBool::new(true)))
        };

        let app_levels = app_th.clone();
        let mut last_emit = std::time::Instant::now();
        let audio = match audio::record_while_stopped(
            &stop,
            Some(move |rms: f32, _frames: usize| {
                // throttle ~20fps
                if last_emit.elapsed().as_millis() < 50 {
                    return;
                }
                last_emit = std::time::Instant::now();
                // normalize to 0..1 (roughly)
                let level: f32 = (rms * 3.5f32).min(1.0f32);
                let _ = app_levels.emit_to(
                    "hud",
                    "vv:hud",
                    serde_json::json!({ "phase": "recording", "level": level }),
                );
            }),
        ) {
            Ok(a) => a,
            Err(e) => {
                tracing::warn!("audio capture: {e}");
                emit_hud_error(
                    &app_th,
                    "Microphone is busy or blocked. Close apps using mic (Discord/Zoom) or allow microphone access in Windows Settings.",
                );
                clear_dictation_gate(&app_th);
                return;
            }
        };

        if !has_enough_audio(&audio) {
            tracing::info!("skipping dictation paste: captured audio was empty or too quiet");
            emit_hud(&app_th, "idle", focus::foreground_window_title());
            clear_dictation_gate(&app_th);
            return;
        }

        // show "typing…" while we run STT
        emit_hud_phase(&app_th, "transcribing");

        let text = match stt::transcribe(&audio, &settings_th) {
            Ok(text) => text,
            Err(e) => {
                tracing::warn!("transcription failed: {e}");
                emit_hud_error(&app_th, &format!("Transcription failed: {e}"));
                clear_dictation_gate(&app_th);
                return;
            }
        };
        let text = dictionary::apply(&text, &settings_th.dict_replacements);
        if text.trim().is_empty() {
            tracing::info!("skipping dictation paste: transcription returned empty text");
            emit_hud(&app_th, "idle", focus::foreground_window_title());
            clear_dictation_gate(&app_th);
            return;
        }
        let paste_method = settings_th.paste_method;

        let h = app_th.clone();
        if let Err(e) = app_th.run_on_main_thread(move || {
            if let Err(e) = injection::paste_text_with_method(&text, paste_method) {
                tracing::warn!("paste: {e}");
            }
            let idle_target = focus::foreground_window_title();
            emit_hud(&h, "idle", idle_target);
            clear_dictation_gate(&h);
        }) {
            tracing::warn!("run_on_main_thread: {e}");
        }
    });
}

pub fn set_voice_activation_enabled(app: &AppHandle, enabled: bool) {
    // persist setting
    if let Ok(mut s) = crate::settings_store::load(app) {
        s.voice_activation_enabled = enabled;
        let _ = crate::settings_store::save(app, &s);
    }

    if enabled {
        start_voice_activation_loop(app.clone());
    } else {
        stop_voice_activation_loop(app);
    }
}

pub fn start_voice_activation_loop(app: AppHandle) {
    let gate = app.state::<VoiceActivationGate>();
    if gate.running.swap(true, Ordering::Relaxed) {
        return; // already running
    }

    std::thread::spawn(move || loop {
        let gate = app.state::<VoiceActivationGate>();
        if !gate.running.load(Ordering::Relaxed) {
            break;
        }
        let Ok(settings) = crate::settings_store::load(&app) else {
            std::thread::sleep(std::time::Duration::from_millis(250));
            continue;
        };
        if !settings.voice_activation_enabled {
            std::thread::sleep(std::time::Duration::from_millis(250));
            continue;
        }

        // Record one segment based on RMS threshold + silence duration.
        let stop = Arc::new(AtomicBool::new(false));
        let start_idx = Arc::new(Mutex::new(None::<usize>));
        let last_voice = Arc::new(Mutex::new(None::<std::time::Instant>));
        let samples_seen = Arc::new(Mutex::new(0usize));

        let app_lv = app.clone();
        let stop_lv = stop.clone();
        let start_idx_lv = start_idx.clone();
        let last_voice_lv = last_voice.clone();
        let samples_seen_lv = samples_seen.clone();

        // Tuneable thresholds (simple, good enough for MVP)
        let voice_th: f32 = 0.03;
        let silence_ms: u64 = 650;
        let min_speech_ms: u64 = 350;

        let captured = audio::record_while_stopped(
            &stop,
            Some(move |rms: f32, frames: usize| {
                // normalize to 0..1
                let level: f32 = (rms * 3.5f32).min(1.0f32);
                emit_hud_level(&app_lv, level);

                // track sample index to trim pre-roll later
                let mut seen = samples_seen_lv.lock().unwrap();
                *seen = seen.saturating_add(frames);

                if level >= voice_th {
                    *last_voice_lv.lock().unwrap() = Some(std::time::Instant::now());
                    if start_idx_lv.lock().unwrap().is_none() {
                        *start_idx_lv.lock().unwrap() = Some(seen.saturating_sub(frames));
                    }
                }

                // If we have started, stop after silence.
                if start_idx_lv.lock().unwrap().is_some() {
                    let last = *last_voice_lv.lock().unwrap();
                    if let Some(t) = last {
                        if t.elapsed().as_millis() as u64 > silence_ms {
                            stop_lv.store(true, Ordering::Relaxed);
                        }
                    }
                }
            }),
        );

        let Ok(mut captured) = captured else {
            std::thread::sleep(std::time::Duration::from_millis(120));
            continue;
        };

        // Trim leading silence if we have a start point.
        let start = start_idx.lock().unwrap().unwrap_or(0);
        if start > 0 && start < captured.samples.len() {
            captured.samples = captured.samples[start..].to_vec();
        }

        // Reject too-short segments.
        if captured.sample_rate_hz > 0 {
            let ms = (captured.samples.len() as f64 / captured.sample_rate_hz as f64) * 1000.0;
            if ms < min_speech_ms as f64 {
                continue;
            }
        }

        if !has_enough_audio(&captured) {
            continue;
        }

        let text = match stt::transcribe(&captured, &settings) {
            Ok(text) => text,
            Err(e) => {
                tracing::warn!("voice activation transcription failed: {e}");
                continue;
            }
        };
        let text = dictionary::apply(&text, &settings.dict_replacements);
        if text.trim().is_empty() {
            continue;
        }
        let paste_method = settings.paste_method;
        let h = app.clone();
        if let Err(e) = app.run_on_main_thread(move || {
            if let Err(e) = injection::paste_text_with_method(&text, paste_method) {
                tracing::warn!("voice activation paste: {e}");
            }
            emit_hud(&h, "idle", focus::foreground_window_title());
        }) {
            tracing::warn!("voice activation run_on_main_thread: {e}");
        }
    });
}

pub fn stop_voice_activation_loop(app: &AppHandle) {
    let gate = app.state::<VoiceActivationGate>();
    gate.running.store(false, Ordering::Relaxed);
}

pub fn end_session(app: AppHandle) {
    let Some(gate) = app.try_state::<DictationGate>() else {
        return;
    };
    let stop = gate.inner.lock().unwrap().stop.clone();
    if let Some(s) = stop {
        s.store(true, Ordering::Relaxed);
    }
}

pub fn toggle_session(app: AppHandle, settings: AppSettings) {
    let Some(gate) = app.try_state::<DictationGate>() else {
        return;
    };
    let active = gate.inner.lock().unwrap().stop.is_some();
    if active {
        end_session(app);
    } else {
        begin_session(app, settings);
    }
}

pub fn on_global_shortcut(app: &AppHandle, state: tauri_plugin_global_shortcut::ShortcutState) {
    let Ok(settings) = crate::settings_store::load(app) else {
        return;
    };
    match settings.recording_mode {
        RecordingMode::PushToTalk => match state {
            tauri_plugin_global_shortcut::ShortcutState::Pressed => {
                begin_session(app.clone(), settings);
            }
            tauri_plugin_global_shortcut::ShortcutState::Released => {
                end_session(app.clone());
            }
        },
        RecordingMode::Toggle => {
            if state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                toggle_session(app.clone(), settings);
            }
        }
    }
}

/// HUD mic: hold for push-to-talk.
pub fn hud_pointer_down(app: AppHandle) {
    let Ok(settings) = crate::settings_store::load(&app) else {
        return;
    };
    if settings.recording_mode == RecordingMode::PushToTalk {
        begin_session(app, settings);
    }
}

/// HUD mic: release for push-to-talk.
pub fn hud_pointer_up(app: AppHandle) {
    let Ok(settings) = crate::settings_store::load(&app) else {
        return;
    };
    if settings.recording_mode == RecordingMode::PushToTalk {
        end_session(app);
    }
}

/// HUD mic: single click for toggle mode.
pub fn hud_toggle_click(app: AppHandle) {
    let Ok(settings) = crate::settings_store::load(&app) else {
        return;
    };
    if settings.recording_mode == RecordingMode::Toggle {
        toggle_session(app, settings);
    }
}
