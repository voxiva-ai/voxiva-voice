//! Foreground window — HUD target hint + paste focus restore (Windows).

use std::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone)]
pub struct PasteTarget {
    #[cfg(windows)]
    pub hwnd: isize,
    pub title: Option<String>,
}

static LAST_EXTERNAL: Mutex<Option<PasteTarget>> = Mutex::new(None);

pub fn is_own_window_title(title: &str) -> bool {
    let t = title.trim().to_lowercase();
    t.contains("voxiva voice")
        || t.contains("voxiva hud")
        || t == "voxiva hud"
        || t.is_empty()
}

#[cfg(windows)]
pub fn capture_paste_target() -> Option<PasteTarget> {
    use windows::Win32::UI::WindowsAndMessaging::GetForegroundWindow;

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_invalid() {
            return None;
        }
        Some(PasteTarget {
            hwnd: hwnd.0 as isize,
            title: foreground_window_title(),
        })
    }
}

#[cfg(not(windows))]
pub fn capture_paste_target() -> Option<PasteTarget> {
    None
}

/// Remember the last focused app that is not Voxiva Voice/HUD.
pub fn note_external_foreground() {
    let Some(title) = foreground_window_title() else {
        return;
    };
    if is_own_window_title(&title) {
        return;
    }
    if let Some(target) = capture_paste_target() {
        if let Ok(mut slot) = LAST_EXTERNAL.lock() {
            *slot = Some(target);
        }
    }
}

/// Target for paste — skip our own HUD/main when the mic was clicked there.
pub fn paste_target_for_session() -> Option<PasteTarget> {
    if let Some(title) = foreground_window_title() {
        if !is_own_window_title(&title) {
            if let Some(target) = capture_paste_target() {
                if let Ok(mut slot) = LAST_EXTERNAL.lock() {
                    *slot = Some(target.clone());
                }
                return Some(target);
            }
        }
    }
    LAST_EXTERNAL.lock().ok().and_then(|g| g.clone())
}

#[cfg(windows)]
pub fn restore_paste_target(target: &PasteTarget) {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::Threading::{AttachThreadInput, GetCurrentThreadId};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetWindowThreadProcessId, SetForegroundWindow, ShowWindow, SW_RESTORE,
    };

    unsafe {
        let hwnd = HWND(target.hwnd as *mut _);
        if hwnd.is_invalid() {
            return;
        }
        let _ = ShowWindow(hwnd, SW_RESTORE);
        let fg_thread = GetWindowThreadProcessId(hwnd, None);
        let cur_thread = GetCurrentThreadId();
        let attached = if fg_thread != 0 && fg_thread != cur_thread {
            AttachThreadInput(cur_thread, fg_thread, true.into()).as_bool()
        } else {
            false
        };
        let _ = SetForegroundWindow(hwnd);
        if attached {
            let _ = AttachThreadInput(cur_thread, fg_thread, false.into());
        }
    }
}

#[cfg(not(windows))]
pub fn restore_paste_target(_target: &PasteTarget) {}

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

/// Bracketed paste for standalone terminals / TUIs — not regular apps (Space, browsers, editors).
pub fn prefers_terminal_paste(title: Option<&str>) -> bool {
    let t = title.unwrap_or("").to_lowercase();
    t.contains("windows terminal")
        || t.contains("wezterm")
        || t.contains("alacritty")
        || t.contains("hyper")
        || t.contains("tabby")
        || t.contains("kitty")
        || t.contains("iterm")
        || t.contains("command prompt")
        || t.contains("cmd.exe")
        || t.contains("powershell")
        || t.contains("pwsh")
        || t.contains("opencode")
        || t.contains("codex")
        || t.contains("claude code")
        || t.contains("lazygit")
        || t.contains("vim")
        || t.contains("nvim")
        || t.contains("tmux")
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
        note_external_foreground();
        let title = foreground_window_title().unwrap_or_default();
        let _ = app.emit_to(
            "hud",
            "vv:hud",
            serde_json::json!({ "phase": "idle", "target": title }),
        );
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
