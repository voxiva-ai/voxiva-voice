//! Foreground window title — used by the HUD to show where text will be pasted (Windows).

use tauri::{AppHandle, Emitter, Manager};

#[cfg(windows)]
pub fn foreground_window_title() -> Option<String> {
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW};

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_invalid() {
            return None;
        }
        let mut buf = [0u16; 512];
        let n = GetWindowTextW(hwnd, &mut buf);
        if n <= 0 {
            return None;
        }
        let s = String::from_utf16_lossy(&buf[..n as usize]);
        let t = s.trim();
        if t.is_empty() {
            None
        } else {
            Some(t.to_owned())
        }
    }
}

#[cfg(not(windows))]
pub fn foreground_window_title() -> Option<String> {
    None
}

#[cfg(windows)]
pub fn start_focus_watcher(app: AppHandle) {
    use std::sync::OnceLock;
    use std::thread;

    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Accessibility::{SetWinEventHook, UnhookWinEvent, HWINEVENTHOOK};
    use windows::Win32::UI::WindowsAndMessaging::{
        DispatchMessageW, GetMessageW, TranslateMessage, EVENT_SYSTEM_FOREGROUND, MSG,
        WINEVENT_OUTOFCONTEXT, WINEVENT_SKIPOWNPROCESS,
    };

    static APP: OnceLock<AppHandle> = OnceLock::new();
    let _ = APP.set(app);

    unsafe extern "system" fn callback(
        _hook: HWINEVENTHOOK,
        event: u32,
        hwnd: HWND,
        _id_object: i32,
        _id_child: i32,
        _dw_event_thread: u32,
        _dwms_event_time: u32,
    ) {
        if event != EVENT_SYSTEM_FOREGROUND {
            return;
        }
        let Some(app) = APP.get() else { return };
        let title = super::focus::foreground_window_title().unwrap_or_default();
        let _ = app.emit_to("hud", "vv:hud", serde_json::json!({ "phase": "idle", "target": title }));
        // Only show HUD when main window is minimized.
        let show_hud = app
            .get_webview_window("main")
            .and_then(|m| m.is_minimized().ok())
            .unwrap_or(false);
        if show_hud {
            if let Some(hud) = app.get_webview_window("hud") {
                let _ = hud.show();
                let _ = hud.set_always_on_top(true);
            }
        }
        let _ = hwnd;
    }

    thread::spawn(move || unsafe {
        let hook = SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_SYSTEM_FOREGROUND,
            None,
            Some(callback),
            0,
            0,
            WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS,
        );

        // Message loop required for WinEvent hooks.
        let mut msg = MSG::default();
        while GetMessageW(&mut msg, None, 0, 0).into() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        let _ = UnhookWinEvent(hook);
    });
}

#[cfg(not(windows))]
pub fn start_focus_watcher(_app: AppHandle) {}
