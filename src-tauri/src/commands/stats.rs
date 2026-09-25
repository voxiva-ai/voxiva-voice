use tauri::AppHandle;

use crate::stats_store::UsageStats;

#[tauri::command]
pub fn get_usage_stats(app: AppHandle) -> Result<UsageStats, String> {
    crate::stats_store::load(&app).map_err(|e| e.to_string())
}
