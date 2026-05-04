//! Speech-to-text backends.
//!
//! - `LocalStub`: deterministic placeholder text.
//! - `WhisperCli`: runs `whisper-cli` (whisper.cpp) on a temporary WAV file.

use crate::config::{AppSettings, DictationLanguage, SttMode};
use crate::services::audio::CapturedAudio;

pub mod bootstrap_whisper;
mod whisper_cli;

pub fn transcribe(audio: &CapturedAudio, settings: &AppSettings) -> Result<String, String> {
    match settings.stt_mode {
        SttMode::LocalStub => Ok(stub_text(settings.dictation_language, audio.samples.len())),
        SttMode::WhisperCli => whisper_cli::transcribe_whisper_cli(audio, settings),
    }
}

fn stub_text(lang: DictationLanguage, sample_count: usize) -> String {
    let base = match lang {
        DictationLanguage::Ru => format!(
            "[Voxiva Voice] Заглушка STT (локально). Сэмплов с микрофона: {sample_count}. Подключите whisper.cpp или облако в следующих версиях."
        ),
        DictationLanguage::En | DictationLanguage::Auto => format!(
            "[Voxiva Voice] Local STT stub. Captured {sample_count} float samples. Wire whisper.cpp or a cloud engine next."
        ),
    };
    base
}
