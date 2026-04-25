//! HUD-only controls (mouse / touch) mirroring global shortcut behavior.

use tauri::AppHandle;

#[tauri::command]
pub fn hud_ptt_pointer_down(app: AppHandle) {
    crate::services::dictation::hud_pointer_down(app);
}

#[tauri::command]
pub fn hud_ptt_pointer_up(app: AppHandle) {
    crate::services::dictation::hud_pointer_up(app);
}

#[tauri::command]
pub fn hud_toggle_click(app: AppHandle) {
    crate::services::dictation::hud_toggle_click(app);
}
