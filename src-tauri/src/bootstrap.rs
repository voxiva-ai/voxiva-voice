//! Tray, HUD webview, and global shortcut registration.

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::webview::WebviewWindowBuilder;
use tauri::WebviewUrl;
use tauri::{AppHandle, Manager};

pub fn reregister_hotkey(app: &AppHandle) -> Result<(), String> {
    register_hotkey_inner(app).map_err(|e| e.to_string())
}

fn register_hotkey_inner(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_global_shortcut::GlobalShortcutExt;

    let gs = app.global_shortcut();
    let _ = gs.unregister_all();

    let settings = crate::settings_store::load(app)?;
    let hk = settings.push_to_talk_hotkey.clone();

    gs.on_shortcut(hk.as_str(), |app, _, event| {
        crate::services::dictation::on_global_shortcut(app, event.state);
    })?;

    Ok(())
}

pub fn install_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let icon = app
        .default_window_icon()
        .ok_or("missing default window icon")?
        .clone();

    let open = MenuItem::with_id(app, "vv_open", "Open Voxiva Voice", true, None::<&str>)?;
    let va = MenuItem::with_id(app, "vv_va", "Toggle voice activation", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "vv_quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &va, &quit])?;

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .tooltip("Voxiva Voice")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| {
            if event.id == "vv_open" {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
                if let Some(h) = app.get_webview_window("hud") {
                    let _ = h.hide();
                }
            } else if event.id == "vv_va" {
                let enabled = crate::settings_store::load(app)
                    .map(|s| s.voice_activation_enabled)
                    .unwrap_or(false);
                let next = !enabled;
                crate::services::dictation::set_voice_activation_enabled(app, next);
            } else if event.id == "vv_quit" {
                app.exit(0);
            }
        })
        .build(app)?;

    Ok(())
}

pub fn create_hud_window(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let url = WebviewUrl::App("hud.html".into());

    let _hud = WebviewWindowBuilder::new(app, "hud", url)
        .title("Voxiva HUD")
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .focusable(false)
        .skip_taskbar(true)
        .position(32.0, 32.0)
        .inner_size(268.0, 44.0)
        .visible(false)
        .resizable(false)
        .build()?;

    Ok(())
}

pub fn init(handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    create_hud_window(handle)?;
    install_tray(handle)?;
    register_hotkey_inner(handle)?;
    // Free, offline STT bootstrap: download whisper-cli + model into app config dir.
    // End-users should not need to install anything manually.
    if let Err(e) = crate::services::stt::bootstrap_whisper::ensure_whisper_assets(handle) {
        tracing::warn!("whisper bootstrap failed (falling back): {e:?}");
    }
    #[cfg(windows)]
    crate::services::focus::start_focus_watcher(handle.clone());
    Ok(())
}
