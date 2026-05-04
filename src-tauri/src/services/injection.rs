//! Insert transcribed text into the focused app (clipboard + Ctrl+V).

use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

pub fn paste_text_with_method(
    text: &str,
    method: crate::config::PasteMethod,
) -> Result<(), String> {
    let mut clip = Clipboard::new().map_err(|e| e.to_string())?;
    clip.set_text(text).map_err(|e| e.to_string())?;

    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    // We intentionally send a *single* paste combo.
    //
    // Previous versions tried multiple paste combos as fallbacks, but many apps accept more than
    // one of them, which results in duplicated text (user says one phrase, app pastes it 2–3x).
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

    match method {
        crate::config::PasteMethod::CtrlV => combo(&mut enigo, &[Key::Control], Key::Unicode('v'))?,
        crate::config::PasteMethod::ShiftInsert => combo(&mut enigo, &[Key::Shift], Key::Insert)?,
        crate::config::PasteMethod::CtrlShiftV => {
            combo(&mut enigo, &[Key::Control, Key::Shift], Key::Unicode('v'))?
        }
    }

    Ok(())
}

// Keep `paste_text_with_method` as the single implementation to avoid duplicated paste logic.
