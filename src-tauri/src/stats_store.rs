//! Local usage counters — words dictated, time spent, recent phrases.

use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::error::Result;
use crate::paths;

const RECENT_MAX: usize = 30;
const SNIPPET_MAX: usize = 120;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RecentDictation {
    pub text: String,
    pub words: u32,
    pub at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UsageStats {
    pub total_words: u64,
    pub total_dictation_seconds: f64,
    pub total_app_seconds: f64,
    pub dictation_count: u64,
    #[serde(default)]
    pub recent: Vec<RecentDictation>,
}

fn stats_file(app: &AppHandle) -> Result<PathBuf> {
    let settings = paths::settings_file(app)?;
    let dir = settings
        .parent()
        .ok_or_else(|| crate::error::AppError::Config("no config dir".into()))?;
    Ok(dir.join("usage-stats.json"))
}

pub fn load(app: &AppHandle) -> Result<UsageStats> {
    let path = stats_file(app)?;
    if !path.exists() {
        return Ok(UsageStats::default());
    }
    let raw = fs::read_to_string(&path).map_err(|e| crate::error::AppError::Config(e.to_string()))?;
    serde_json::from_str(&raw).map_err(|e| crate::error::AppError::Config(e.to_string()))
}

fn save(app: &AppHandle, stats: &UsageStats) -> Result<()> {
    let path = stats_file(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| crate::error::AppError::Config(e.to_string()))?;
    }
    let raw =
        serde_json::to_string_pretty(stats).map_err(|e| crate::error::AppError::Config(e.to_string()))?;
    fs::write(path, raw).map_err(|e| crate::error::AppError::Config(e.to_string()))
}

fn word_count(text: &str) -> u32 {
    text.split_whitespace().count() as u32
}

fn now_unix() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub fn record_dictation(app: &AppHandle, text: &str, duration_seconds: f64) -> Result<()> {
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return Ok(());
    }
    let words = word_count(trimmed);
    if words == 0 {
        return Ok(());
    }

    let mut stats = load(app)?;
    stats.total_words = stats.total_words.saturating_add(words as u64);
    stats.total_dictation_seconds += duration_seconds.max(0.0);
    stats.dictation_count = stats.dictation_count.saturating_add(1);

    let snippet = if trimmed.chars().count() > SNIPPET_MAX {
        format!("{}…", trimmed.chars().take(SNIPPET_MAX).collect::<String>())
    } else {
        trimmed.to_owned()
    };

    stats.recent.insert(
        0,
        RecentDictation {
            text: snippet,
            words,
            at: now_unix(),
        },
    );
    stats.recent.truncate(RECENT_MAX);

    save(app, &stats)
}

pub fn tick_app_seconds(app: &AppHandle, seconds: u64) -> Result<()> {
    let mut stats = load(app)?;
    stats.total_app_seconds += seconds as f64;
    save(app, &stats)
}
