//! User preferences persisted on disk (local-only, no cloud).

use serde::{Deserialize, Serialize};

/// High-level dictation language preference (STT wiring comes later).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum DictationLanguage {
    #[default]
    Auto,
    En,
    Ru,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum RecordingMode {
    #[default]
    PushToTalk,
    Toggle,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum SttMode {
    /// No cloud; placeholder text until whisper.cpp is wired.
    #[default]
    LocalStub,
    /// Run local whisper.cpp via `whisper-cli` executable (free, offline).
    WhisperCli,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum UiTheme {
    /// Default Voxiva look (dark, accent gradients).
    #[default]
    Bridgemind,
    /// Pure OLED black.
    Black,
    /// Light theme.
    Light,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum PasteMethod {
    /// Standard paste (most apps).
    #[default]
    CtrlV,
    /// Legacy Win32 paste (works in some apps where Ctrl+V is intercepted).
    ShiftInsert,
    /// Paste-plain in some editors (VS Code / JetBrains when configured).
    CtrlShiftV,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum HudMode {
    /// Logo + voice wave + mic button.
    #[default]
    Full,
    /// Logo + mic button only.
    IconOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DictEntry {
    pub phrase: String,
    pub replacement: String,
}

fn default_hotkey() -> String {
    "ctrl+shift+space".to_string()
}

fn default_privacy() -> bool {
    true
}

/// Serializable app settings. Version field supports future migrations.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub schema_version: u32,
    pub dictation_language: DictationLanguage,
    pub ui_locale: String,
    #[serde(default)]
    pub ui_theme: UiTheme,
    #[serde(default = "default_hotkey")]
    pub push_to_talk_hotkey: String,
    #[serde(default)]
    pub recording_mode: RecordingMode,
    #[serde(default)]
    pub stt_mode: SttMode,
    #[serde(default)]
    pub whisper_model_path: Option<String>,
    #[serde(default)]
    pub whisper_cli_path: Option<String>,
    #[serde(default = "default_privacy")]
    pub privacy_local_only: bool,
    #[serde(default)]
    pub dict_replacements: Vec<DictEntry>,
    #[serde(default)]
    pub voice_activation_enabled: bool,
    #[serde(default)]
    pub paste_method: PasteMethod,
    #[serde(default)]
    pub onboarding_completed: bool,
    #[serde(default)]
    pub hud_mode: HudMode,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            schema_version: 6,
            dictation_language: DictationLanguage::default(),
            ui_locale: "en".to_owned(),
            ui_theme: UiTheme::default(),
            push_to_talk_hotkey: default_hotkey(),
            recording_mode: RecordingMode::default(),
            stt_mode: SttMode::default(),
            whisper_model_path: None,
            whisper_cli_path: None,
            privacy_local_only: default_privacy(),
            dict_replacements: Vec::new(),
            voice_activation_enabled: false,
            paste_method: PasteMethod::default(),
            onboarding_completed: false,
            hud_mode: HudMode::default(),
        }
    }
}

impl AppSettings {
    pub fn migrate_if_needed(mut self) -> Self {
        if self.schema_version < 1 {
            self.schema_version = 1;
        }
        if self.schema_version < 2 {
            if self.push_to_talk_hotkey.is_empty() {
                self.push_to_talk_hotkey = default_hotkey();
            }
            self.schema_version = 2;
        }
        if self.schema_version < 3 {
            self.ui_theme = UiTheme::default();
            self.schema_version = 3;
        }
        if self.schema_version < 4 {
            self.paste_method = PasteMethod::default();
            self.schema_version = 4;
        }
        if self.schema_version < 5 {
            self.onboarding_completed = false;
            self.schema_version = 5;
        }
        if self.schema_version < 6 {
            self.hud_mode = HudMode::default();
            self.schema_version = 6;
        }
        self
    }
}
