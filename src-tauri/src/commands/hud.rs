//! HUD window shape + transparency helpers (Windows corner cleanup).

use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn clip_hud_window(
    app: AppHandle,
    width: u32,
    height: u32,
    icon_only: bool,
) -> Result<(), String> {
    let hud = app
        .get_webview_window("hud")
        .ok_or("hud window not found")?;
    clip_hud_round(&hud, width, height, icon_only)
}

#[cfg(windows)]
fn clip_hud_round(
    window: &tauri::WebviewWindow,
    width: u32,
    height: u32,
    icon_only: bool,
) -> Result<(), String> {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Graphics::Gdi::{CreateRoundRectRgn, SetWindowRgn};

    let hwnd = window.hwnd().map_err(|e| e.to_string())?;
    let w = width.max(1) as i32;
    let h = height.max(1) as i32;
    let radius = if icon_only {
        (w.min(h) / 4).max(6)
    } else {
        (h / 2).max(8)
    };

    unsafe {
        let rgn = CreateRoundRectRgn(0, 0, w + 1, h + 1, radius, radius);
        if rgn.is_invalid() {
            return Err("CreateRoundRectRgn failed".into());
        }
        SetWindowRgn(HWND(hwnd.0 as _), Some(rgn), true);
    }
    Ok(())
}

#[cfg(not(windows))]
fn clip_hud_round(
    _window: &tauri::WebviewWindow,
    _width: u32,
    _height: u32,
    _icon_only: bool,
) -> Result<(), String> {
    Ok(())
}
