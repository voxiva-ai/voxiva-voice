//! Check for newer desktop builds via voxiva.ai release API.

use serde::{Deserialize, Serialize};
use tauri::AppHandle;

const RELEASE_URL: &str = "https://voxiva.ai/api/releases/voxiva-voice";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheckResult {
    pub current_version: String,
    pub latest_version: String,
    pub update_available: bool,
    pub notes: String,
    pub download_url: String,
    pub downloads_page: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RemoteRelease {
    version: String,
    #[serde(default)]
    notes: String,
    download_url: String,
    #[serde(default)]
    downloads_page: String,
}

fn parse_semver(v: &str) -> Option<(u64, u64, u64)> {
    let clean = v.trim().trim_start_matches('v');
    let mut parts = clean.split('.');
    let major = parts.next()?.parse().ok()?;
    let minor = parts.next().unwrap_or("0").parse().ok()?;
    let patch = parts
        .next()
        .unwrap_or("0")
        .split(|c: char| !c.is_ascii_digit())
        .next()?
        .parse()
        .ok()?;
    Some((major, minor, patch))
}

fn is_newer(remote: &str, local: &str) -> bool {
    match (parse_semver(remote), parse_semver(local)) {
        (Some(r), Some(l)) => r > l,
        _ => remote.trim() != local.trim(),
    }
}

#[tauri::command]
pub fn check_for_updates(app: AppHandle) -> Result<UpdateCheckResult, String> {
    let current = app.package_info().version.to_string();
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(12))
        .user_agent(format!("VoxivaVoice/{}", current))
        .build()
        .map_err(|e| e.to_string())?;

    let text = client
        .get(RELEASE_URL)
        .send()
        .map_err(|e| format!("Could not reach update server: {e}"))?
        .error_for_status()
        .map_err(|e| format!("Update server error: {e}"))?
        .text()
        .map_err(|e| format!("Update body error: {e}"))?;

    let remote: RemoteRelease =
        serde_json::from_str(&text).map_err(|e| format!("Invalid update response: {e}"))?;

    Ok(UpdateCheckResult {
        current_version: current.clone(),
        latest_version: remote.version.clone(),
        update_available: is_newer(&remote.version, &current),
        notes: remote.notes,
        download_url: remote.download_url,
        downloads_page: if remote.downloads_page.is_empty() {
            "https://voxiva.ai/downloads".into()
        } else {
            remote.downloads_page
        },
    })
}
