//! Insert transcribed text into the focused app (clipboard + Ctrl+V).

use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use std::thread;
use std::time::Duration;

pub fn paste_text(text: &str) -> Result<(), String> {
    let mut clip = Clipboard::new().map_err(|e| e.to_string())?;
    clip.set_text(text).map_err(|e| e.to_string())?;

    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    // Some apps (especially editors) can ignore a single paste keystroke depending on
    // focus timing, keyboard hooks, or IME state. Try a couple of common paste combos.
    //
    // 1) Ctrl+V (standard)
    // 2) Shift+Insert (Win32 legacy paste; often works where Ctrl+V is intercepted)
    // 3) Ctrl+Shift+V (paste-plain in some apps; harmless if unsupported)
    fn combo(enigo: &mut Enigo, mods: &[Key], key: Key) -> Result<(), String> {
        for m in mods {
            enigo.key(*m, Direction::Press).map_err(|e| e.to_string())?;
        }
        enigo.key(key, Direction::Click).map_err(|e| e.to_string())?;
        for m in mods.iter().rev() {
            enigo.key(*m, Direction::Release).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    combo(&mut enigo, &[Key::Control], Key::Unicode('v'))?;
    thread::sleep(Duration::from_millis(25));

    // If Ctrl+V didn't work (Cursor sometimes), this often will.
    let _ = combo(&mut enigo, &[Key::Shift], Key::Insert);
    thread::sleep(Duration::from_millis(25));

    // Optional extra fallback for apps that bind paste differently.
    let _ = combo(&mut enigo, &[Key::Control, Key::Shift], Key::Unicode('v'));

    Ok(())
}
