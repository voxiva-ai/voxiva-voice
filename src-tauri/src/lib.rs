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
use tauri_plugin_updater::UpdaterExt;

use services::dictation::{DictationGate, VoiceActivationGate};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    logging::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
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

            // Background auto-update (no user commands).
            // If an update is available, download + install it, then exit.
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let updater = match handle.updater_builder().build() {
                        Ok(u) => u,
                        Err(e) => {
                            tracing::warn!("updater builder failed: {e}");
                            return;
                        }
                    };

                    let update = match updater.check().await {
                        Ok(u) => u,
                        Err(e) => {
                            tracing::warn!("update check failed: {e}");
                            return;
                        }
                    };

                    let Some(update) = update else { return };
                    tracing::info!("update found: {}", update.version);

                    if let Err(e) = update
                        .download_and_install(|_chunk, _total| {}, || {})
                        .await
                    {
                        tracing::warn!("update install failed: {e}");
                        return;
                    }

                    handle.exit(0);
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to start Voxiva Voice");
}
