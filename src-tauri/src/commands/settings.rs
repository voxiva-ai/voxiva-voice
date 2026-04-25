//! Load / persist `AppSettings` under the OS app config directory.

use tauri::AppHandle;

use crate::config::AppSettings;
use crate::settings_store;

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    settings_store::load(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    settings_store::save(&app, &settings).map_err(|e| e.to_string())?;
    crate::bootstrap::reregister_hotkey(&app).map_err(|e| e.to_string())
}
