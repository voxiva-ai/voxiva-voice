//! Voxiva Voice — native shell (Tauri). Domain logic grows in `commands/`, `services/`, `bootstrap/`.

mod bootstrap;
mod commands;
mod config;
mod error;
mod logging;
mod paths;
mod services;
mod settings_store;

use tauri::Manager;
use tauri::WindowEvent;

use services::dictation::{DictationGate, VoiceActivationGate};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    logging::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(DictationGate::default())
        .manage(VoiceActivationGate::default())
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_metadata,
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::dictation::hud_ptt_pointer_down,
            commands::dictation::hud_ptt_pointer_up,
            commands::dictation::hud_toggle_click,
        ])
        .on_window_event(|window, event| {
            if window.label() != "main" {
                return;
            }
            if matches!(
                event,
                WindowEvent::Resized(_) | WindowEvent::Focused(_) | WindowEvent::Moved(_)
            ) {
                if let Ok(true) = window.is_minimized() {
                    if let Some(hud) = window.app_handle().get_webview_window("hud") {
                        let _ = hud.show();
                        let _ = hud.set_always_on_top(true);
                    }
                } else {
                    if let Some(hud) = window.app_handle().get_webview_window("hud") {
                        let _ = hud.hide();
                    }
                }
            }
        })
        .setup(|app| {
            if let Err(e) = bootstrap::init(app.handle()) {
                tracing::error!("bootstrap failed: {e:?}");
            } else {
                tracing::info!("voxiva voice ready (tray + HUD + global shortcut)");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to start Voxiva Voice");
}
