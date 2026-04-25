//! Application metadata exposed to the UI (version, bundle id).

use serde::Serialize;
use tauri::AppHandle;

/// Matches `identifier` in `tauri.conf.json` (used for support / updates).
pub const BUNDLE_IDENTIFIER: &str = "ai.voxiva.voice";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppMetadata {
    pub name: String,
    pub version: String,
    pub bundle_identifier: String,
}

/// Returns non-sensitive build-time metadata for About / diagnostics.
#[tauri::command]
pub fn get_app_metadata(app: AppHandle) -> Result<AppMetadata, String> {
    let pkg = app.package_info();
    Ok(AppMetadata {
        name: pkg.name.to_string(),
        version: pkg.version.to_string(),
        bundle_identifier: BUNDLE_IDENTIFIER.to_owned(),
    })
}
