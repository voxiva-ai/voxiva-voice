//! Central place for resolved filesystem paths (app config dir, etc.).

use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};

pub fn settings_file(app: &AppHandle) -> Result<PathBuf> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| AppError::Config(e.to_string()))?;
    Ok(dir.join("settings.json"))
}

pub fn tools_dir(app: &AppHandle) -> Result<PathBuf> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| AppError::Config(e.to_string()))?;
    Ok(dir.join("tools"))
}

pub fn whisper_dir(app: &AppHandle) -> Result<PathBuf> {
    Ok(tools_dir(app)?.join("whisper"))
}
