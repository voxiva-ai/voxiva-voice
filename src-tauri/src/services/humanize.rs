//! Local post-process for dictation: punctuation, capitalization, light cleanup.
//! No cloud — rules only (RU/EN).

/// Soften raw Whisper output into readable typed text.
pub fn humanize(input: &str) -> String {
    let mut s = input.trim().to_string();
    if s.is_empty() {
        return s;
    }

    s = s.replace('\u{00a0}', " ");
    while s.contains("  ") {
        s = s.replace("  ", " ");
    }
    s = s
        .replace(" ,", ",")
        .replace(" .", ".")
        .replace(" ?", "?")
        .replace(" !", "!")
        .replace("« ", "«")
        .replace(" »", "»");

    for filler in [" э ", " ээ ", " эм ", " мм ", " uh ", " um ", " er "] {
        while s.to_lowercase().contains(filler.trim()) {
            // Case-insensitive replace of filler as whole token-ish span.
            if let Some(idx) = find_ci(&s, filler) {
                s.replace_range(idx..idx + filler.len(), " ");
            } else {
                break;
            }
        }
    }
    while s.contains("  ") {
        s = s.replace("  ", " ");
    }
    s = s.trim().to_string();

    s = insert_commas(&s);
    s = capitalize_sentences(&s);
    s = ensure_terminal_punct(&s);
    s
}

fn find_ci(hay: &str, needle: &str) -> Option<usize> {
    let h = hay.to_lowercase();
    let n = needle.to_lowercase();
    // Lowercase byte index matches original for ASCII fillers we use.
    h.find(&n)
}

fn insert_commas(text: &str) -> String {
    let words = text.split_whitespace().count();
    let punct_count = text
        .chars()
        .filter(|c| matches!(c, ',' | '.' | '!' | '?' | ';' | ':'))
        .count();
    // Already punctuated enough — leave alone.
    if words > 0 && punct_count * 8 >= words {
        return text.to_string();
    }

    let mut out = text.to_string();
    for word in [
        " но ",
        " а ",
        " однако ",
        " поэтому ",
        " значит ",
        " например ",
        " кстати ",
        " впрочем ",
        " то есть ",
        " потому что ",
        " так что ",
        " хотя ",
        " чтобы ",
        " but ",
        " however ",
        " therefore ",
        " for example ",
        " because ",
        " although ",
    ] {
        out = soft_comma_before(&out, word);
    }
    out
}

fn soft_comma_before(text: &str, needle: &str) -> String {
    let lower = text.to_lowercase();
    let needle_l = needle.to_lowercase();
    let mut out = String::with_capacity(text.len() + 4);
    let mut rest = text;
    let mut rest_l = lower.as_str();

    while let Some(pos) = rest_l.find(&needle_l) {
        let (before, after) = rest.split_at(pos);
        out.push_str(before);
        let needs_comma = !before.is_empty()
            && !before
                .chars()
                .rev()
                .find(|c| !c.is_whitespace())
                .is_some_and(|c| {
                    matches!(
                        c,
                        ',' | '.' | '!' | '?' | ';' | ':' | '(' | '[' | '{' | '«' | '"' | '\''
                    )
                });
        if needs_comma {
            out.push(',');
        }
        let (matched, next) = after.split_at(needle.len());
        out.push_str(matched);
        rest = next;
        rest_l = &rest_l[pos + needle_l.len()..];
    }
    out.push_str(rest);
    out
}

fn capitalize_sentences(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut cap_next = true;
    for ch in text.chars() {
        if cap_next && ch.is_alphabetic() {
            for c in ch.to_uppercase() {
                out.push(c);
            }
            cap_next = false;
            continue;
        }
        out.push(ch);
        if matches!(ch, '.' | '!' | '?' | '\n') {
            cap_next = true;
        }
    }
    out
}

fn ensure_terminal_punct(text: &str) -> String {
    let t = text.trim();
    if t.is_empty() {
        return String::new();
    }
    let last = t.chars().last().unwrap();
    if matches!(
        last,
        '.' | '!' | '?' | '…' | ':' | ';' | ',' | ')' | ']' | '"' | '\'' | '»'
    ) {
        return t.to_string();
    }
    let lower = t.to_lowercase();
    let is_q = [
        "что ",
        "как ",
        "где ",
        "когда ",
        "почему ",
        "зачем ",
        "кто ",
        "какой ",
        "какая ",
        "какие ",
        "what ",
        "how ",
        "where ",
        "when ",
        "why ",
        "who ",
        "which ",
    ]
    .iter()
    .any(|p| lower.starts_with(p));
    if is_q {
        format!("{t}?")
    } else {
        format!("{t}.")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_period_and_capital() {
        let out = humanize("привет мир");
        assert!(out.chars().next().unwrap().is_uppercase() || out.starts_with('П'));
        assert!(out.ends_with('.'));
    }

    #[test]
    fn inserts_comma_before_but() {
        let out = humanize("я хотел пойти но было поздно");
        assert!(out.contains(", но "));
    }
}
