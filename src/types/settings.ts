/** Mirrors `DictationLanguage` in Rust (`serde(rename_all = "lowercase")`). */
export type DictationLanguage = "auto" | "en" | "ru";

/** Matches Rust `RecordingMode`. */
export type RecordingMode = "pushToTalk" | "toggle";

/** Matches Rust `SttMode`. */
export type SttMode = "localStub" | "whisperCli";

/** Matches Rust `PasteMethod`. */
export type PasteMethod = "ctrlV" | "shiftInsert" | "ctrlShiftV";

/** Matches Rust `HudMode`. */
export type HudMode = "full" | "iconOnly";

/** Matches Rust `UiTheme` (`serde(rename_all = "lowercase")`). */
export type UiTheme = "bridgemind" | "black" | "light";

export interface DictEntry {
  phrase: string;
  replacement: string;
}

export interface AppSettings {
  schemaVersion: number;
  dictationLanguage: DictationLanguage;
  uiLocale: string;
  uiTheme: UiTheme;
  pushToTalkHotkey: string;
  recordingMode: RecordingMode;
  sttMode: SttMode;
  whisperModelPath: string | null;
  whisperCliPath: string | null;
  privacyLocalOnly: boolean;
  dictReplacements: DictEntry[];
  voiceActivationEnabled: boolean;
  pasteMethod: PasteMethod;
  onboardingCompleted: boolean;
  hudMode: HudMode;
  /** Local punctuation / capitalization after STT. */
  humanizeText: boolean;
}
