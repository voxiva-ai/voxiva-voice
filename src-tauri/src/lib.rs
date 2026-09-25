//! Voxiva Voice — native shell (Tauri). Domain logic grows in `commands/`, `services/`, `bootstrap/`.

mod bootstrap;
mod commands;
mod config;
mod error;
mod logging;
mod paths;
mod services;
mod settings_store;
mod stats_store;

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
            commands::stt::get_whisper_assets_status,
            commands::stt::download_whisper_assets,
            commands::dictation::hud_ptt_pointer_down,
            commands::dictation::hud_ptt_pointer_up,
            commands::dictation::hud_toggle_click,
            commands::hud::clip_hud_window,
            commands::stats::get_usage_stats,
            commands::updates::check_for_updates,
            commands::phone::get_phone_pair_info,
        ])
        .on_window_event(|window, event| {
            if window.label() != "main" {
                return;
            }
            // When user closes the main window, we want to exit fully (not just hide to tray)
            // and ensure the HUD is not left visible.
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                if let Some(hud) = window.app_handle().get_webview_window("hud") {
                    let _ = hud.hide();
                    let _ = hud.close();
                }
                window.app_handle().exit(0);
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
                } else if let Some(hud) = window.app_handle().get_webview_window("hud") {
                    let _ = hud.hide();
                }
            }
        })
        .setup(|app| {
            // Ensure Windows taskbar/title icon is always set (dev + release).
            if let Some(window) = app.get_webview_window("main") {
                let base = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("icons");
                let ico = base.join("icon.ico");
                let png = base.join("icon.png");
                let path = if ico.exists() { ico } else { png };
                if path.exists() {
                    if let Ok(icon) = tauri::image::Image::from_path(&path) {
                        let _ = window.set_icon(icon);
                    }
                }
            }

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
