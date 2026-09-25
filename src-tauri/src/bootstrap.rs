//! Tray, HUD webview, and global shortcut registration.

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::webview::WebviewWindowBuilder;
use tauri::WebviewUrl;
use tauri::{AppHandle, Manager};

use crate::config::AppSettings;

fn register_hotkey(
    app: &AppHandle,
    hotkey: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_global_shortcut::GlobalShortcutExt;

    app.global_shortcut().on_shortcut(hotkey, |app, _, event| {
        crate::services::dictation::on_global_shortcut(app, event.state);
    })?;

    Ok(())
}

pub fn reregister_hotkey_for_settings(
    app: &AppHandle,
    previous: &AppSettings,
    next: &AppSettings,
) -> Result<(), String> {
    use tauri_plugin_global_shortcut::GlobalShortcutExt;

    let old_hotkey = previous.push_to_talk_hotkey.trim();
    let new_hotkey = next.push_to_talk_hotkey.trim();

    if new_hotkey.is_empty() {
        return Err("hotkey cannot be empty".to_string());
    }

    if old_hotkey.eq_ignore_ascii_case(new_hotkey) {
        return Ok(());
    }

    let gs = app.global_shortcut();
    if !old_hotkey.is_empty() {
        let _ = gs.unregister(old_hotkey);
    }

    if let Err(e) = register_hotkey(app, new_hotkey) {
        if !old_hotkey.is_empty() {
            let _ = register_hotkey(app, old_hotkey);
        }
        return Err(e.to_string());
    }

    Ok(())
}

fn register_hotkey_inner(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_global_shortcut::GlobalShortcutExt;

    let gs = app.global_shortcut();
    let _ = gs.unregister_all();

    let settings = crate::settings_store::load(app)?;
    let hk = settings.push_to_talk_hotkey.clone();

    register_hotkey(app, hk.as_str())?;

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
        .shadow(false)
        .always_on_top(true)
        .focusable(false)
        .skip_taskbar(true)
        .position(32.0, 32.0)
        .inner_size(132.0, 40.0)
        .visible(false)
        .resizable(false)
        .build()?;

    Ok(())
}

fn start_usage_ticker(app: AppHandle) {
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(30));
            if let Err(e) = crate::stats_store::tick_app_seconds(&app, 30) {
                tracing::warn!("usage tick: {e}");
            }
        }
    });
}

pub fn init(handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    create_hud_window(handle)?;
    install_tray(handle)?;
    register_hotkey_inner(handle)?;
    start_usage_ticker(handle.clone());
    // Prepare Whisper in the background so dictation works without manual setup.
    let bg = handle.clone();
    std::thread::spawn(move || {
        if let Ok(s) = crate::settings_store::load(&bg) {
            let needs = s.whisper_cli_path.as_ref().is_none_or(|p| !std::path::Path::new(p).exists())
                || s
                    .whisper_model_path
                    .as_ref()
                    .is_none_or(|p| !std::path::Path::new(p).exists());
            if needs {
                tracing::info!("whisper assets missing — preparing offline STT in background");
                if let Err(e) = crate::services::stt::bootstrap_whisper::ensure_whisper_assets(&bg) {
                    tracing::warn!("whisper bootstrap failed: {e:?}");
                }
            }
        }
    });
    #[cfg(windows)]
    {
        crate::services::focus::start_focus_watcher(handle.clone());
        crate::services::focus::note_external_foreground();
    }
    Ok(())
}
