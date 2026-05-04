//! Load / persist `AppSettings` under the OS app config directory.

use tauri::AppHandle;
use tauri::Emitter;

use crate::config::AppSettings;
use crate::settings_store;

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    settings_store::load(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let previous = settings_store::load(&app).map_err(|e| e.to_string())?;
    crate::bootstrap::reregister_hotkey_for_settings(&app, &previous, &settings)
        .map_err(|e| e.to_string())?;
    settings_store::save(&app, &settings).map_err(|e| e.to_string())?;
    // Apply voice-activation immediately when toggled in Settings UI.
    crate::services::dictation::set_voice_activation_enabled(
        &app,
        settings.voice_activation_enabled,
    );
    let _ = app.emit_to("hud", "vv:hud-settings", &settings);
    Ok(())
}
