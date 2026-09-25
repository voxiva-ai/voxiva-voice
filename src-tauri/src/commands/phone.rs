use tauri::AppHandle;

use crate::services::companion::{self, PhonePairInfo};

#[tauri::command]
pub fn get_phone_pair_info(app: AppHandle) -> Result<PhonePairInfo, String> {
    companion::ensure_running(app)
}
