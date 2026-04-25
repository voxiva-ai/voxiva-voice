//! Post-processing: phrase → replacement (developer dictionary).

use crate::config::DictEntry;

pub fn apply(text: &str, entries: &[DictEntry]) -> String {
    let mut out = text.to_string();
    for e in entries {
        if e.phrase.is_empty() {
            continue;
        }
        out = out.replace(&e.phrase, &e.replacement);
    }
    out
}
