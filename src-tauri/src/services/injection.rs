//! Insert transcribed text into the focused app (clipboard + Ctrl+V).

use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

pub fn paste_text(text: &str) -> Result<(), String> {
    let mut clip = Clipboard::new().map_err(|e| e.to_string())?;
    clip.set_text(text).map_err(|e| e.to_string())?;

    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    enigo
        .key(Key::Control, Direction::Press)
        .map_err(|e| e.to_string())?;
    enigo
        .key(Key::Unicode('v'), Direction::Click)
        .map_err(|e| e.to_string())?;
    enigo
        .key(Key::Control, Direction::Release)
        .map_err(|e| e.to_string())?;
    Ok(())
}
