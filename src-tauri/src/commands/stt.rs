//! Commands related to speech-to-text engines (Whisper assets).

use tauri::AppHandle;

use crate::services::stt::bootstrap_whisper::{self, WhisperAssetsStatus};

#[tauri::command]
pub fn get_whisper_assets_status(app: AppHandle) -> Result<WhisperAssetsStatus, String> {
    bootstrap_whisper::whisper_assets_status(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn download_whisper_assets(app: AppHandle) -> Result<(), String> {
    // Run in background thread so we don't block the UI.
    std::thread::spawn(move || {
        if let Err(e) = bootstrap_whisper::ensure_whisper_assets(&app) {
            tracing::warn!("whisper download failed: {e:?}");
        }
    });
    Ok(())
}
