//! Insert transcribed text into the focused app (clipboard + paste / terminal typing).

use std::thread;
use std::time::Duration;

use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

fn combo(enigo: &mut Enigo, mods: &[Key], key: Key) -> Result<(), String> {
    for m in mods {
        enigo.key(*m, Direction::Press).map_err(|e| e.to_string())?;
    }
    enigo
        .key(key, Direction::Click)
        .map_err(|e| e.to_string())?;
    for m in mods.iter().rev() {
        enigo
            .key(*m, Direction::Release)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Bracketed paste for xterm.js / TUIs (OpenCode CLI, Windows Terminal, etc.).
fn paste_terminal(enigo: &mut Enigo, text: &str) -> Result<(), String> {
    let payload = format!("\x1b[200~{text}\x1b[201~");
    for ch in payload.chars() {
        enigo
            .key(Key::Unicode(ch), Direction::Click)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn paste_with_method(enigo: &mut Enigo, method: crate::config::PasteMethod) -> Result<(), String> {
    match method {
        crate::config::PasteMethod::CtrlV => combo(enigo, &[Key::Control], Key::Unicode('v'))?,
        crate::config::PasteMethod::ShiftInsert => combo(enigo, &[Key::Shift], Key::Insert)?,
        crate::config::PasteMethod::CtrlShiftV => {
            combo(enigo, &[Key::Control, Key::Shift], Key::Unicode('v'))?
        }
    }
    Ok(())
}

fn prepare_focus(target: Option<&crate::services::focus::PasteTarget>) {
    if let Some(t) = target {
        crate::services::focus::restore_paste_target(t);
        thread::sleep(Duration::from_millis(90));
        crate::services::focus::restore_paste_target(t);
        thread::sleep(Duration::from_millis(60));
    }
}

pub fn paste_text_with_method(
    text: &str,
    method: crate::config::PasteMethod,
    target: Option<&crate::services::focus::PasteTarget>,
) -> Result<(), String> {
    if text.trim().is_empty() {
        return Ok(());
    }

    prepare_focus(target);

    let mut clip = Clipboard::new().map_err(|e| e.to_string())?;
    clip.set_text(text).map_err(|e| e.to_string())?;
    thread::sleep(Duration::from_millis(45));

    prepare_focus(target);

    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    let title = target.and_then(|t| t.title.as_deref());
    if crate::services::focus::prefers_terminal_paste(title) {
        return paste_terminal(&mut enigo, text);
    }

    paste_with_method(&mut enigo, method)
}
