/** Mirrors `DictationLanguage` in Rust (`serde(rename_all = "lowercase")`). */
export type DictationLanguage = "auto" | "en" | "ru";

/** Matches Rust `RecordingMode`. */
export type RecordingMode = "pushToTalk" | "toggle";

/** Matches Rust `SttMode`. */
export type SttMode = "localStub" | "whisperCli";

export interface DictEntry {
  phrase: string;
  replacement: string;
}

export interface AppSettings {
  schemaVersion: number;
  dictationLanguage: DictationLanguage;
  uiLocale: string;
  pushToTalkHotkey: string;
  recordingMode: RecordingMode;
  sttMode: SttMode;
  whisperModelPath: string | null;
  whisperCliPath: string | null;
  privacyLocalOnly: boolean;
  dictReplacements: DictEntry[];
  voiceActivationEnabled: boolean;
}
