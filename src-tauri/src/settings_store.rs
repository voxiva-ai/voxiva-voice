//! Read/write `AppSettings` JSON (shared by IPC commands and native bootstrap).

use std::fs;

use tauri::AppHandle;

use crate::config::AppSettings;
use crate::error::Result;
use crate::paths;

pub fn load(app: &AppHandle) -> Result<AppSettings> {
    let path = paths::settings_file(app)?;
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    let raw = fs::read_to_string(&path)?;
    let parsed: AppSettings = serde_json::from_str(&raw)?;
    Ok(parsed.migrate_if_needed())
}

pub fn save(app: &AppHandle, settings: &AppSettings) -> Result<()> {
    let path = paths::settings_file(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let raw = serde_json::to_string_pretty(settings)?;
    fs::write(path, raw)?;
    Ok(())
}
