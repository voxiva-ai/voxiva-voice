export type MessageKey =
  | "nav.overview"
  | "nav.settings"
  | "nav.tagline"
  | "settings.title"
  | "settings.intro"
  | "settings.dictationLang"
  | "settings.uiLang"
  | "settings.hotkey"
  | "settings.recordingMode"
  | "settings.recordingModePtt"
  | "settings.recordingModeToggle"
  | "settings.sttMode"
  | "settings.whisperPath"
  | "settings.privacy"
  | "settings.dictJson"
  | "settings.save"
  | "settings.saved"
  | "settings.loading";

const en: Record<MessageKey, string> = {
  "nav.overview": "Overview",
  "nav.settings": "Settings",
  "nav.tagline": "Dictation for any app",
  "settings.title": "Settings",
  "settings.intro":
    "Choose a hotkey and a recording mode. Put the cursor in any app and speak — Voxiva Voice will type for you.",
  "settings.dictationLang": "Dictation language",
  "settings.uiLang": "Interface language",
  "settings.hotkey": "Hotkey (e.g. ctrl+shift+space)",
  "settings.recordingMode": "Recording mode",
  "settings.recordingModePtt": "Push-to-talk",
  "settings.recordingModeToggle": "Toggle",
  "settings.sttMode": "STT engine",
  "settings.whisperPath": "Whisper model file",
  "settings.privacy": "Privacy: local-only (no cloud)",
  "settings.dictJson": "Dictionary (optional)",
  "settings.save": "Save",
  "settings.saved": "Saved locally.",
  "settings.loading": "Loading settings…",
};

const ru: Record<MessageKey, string> = {
  "nav.overview": "Обзор",
  "nav.settings": "Настройки",
  "nav.tagline": "Диктовка для любых приложений",
  "settings.title": "Настройки",
  "settings.intro":
    "Выберите хоткей и режим записи. Поставьте курсор в любом приложении и говорите — Voxiva Voice напечатает текст.",
  "settings.dictationLang": "Язык диктовки",
  "settings.uiLang": "Язык интерфейса",
  "settings.hotkey": "Хоткей (напр. ctrl+shift+space)",
  "settings.recordingMode": "Режим записи",
  "settings.recordingModePtt": "Удерживать для записи",
  "settings.recordingModeToggle": "Вкл/выкл одним нажатием",
  "settings.sttMode": "Движок STT",
  "settings.whisperPath": "Файл модели Whisper",
  "settings.privacy": "Только локально (без облака)",
  "settings.dictJson": "Словарь (опционально)",
  "settings.save": "Сохранить",
  "settings.saved": "Сохранено локально.",
  "settings.loading": "Загрузка…",
};

export function translate(locale: string, key: MessageKey): string {
  const pack = locale.startsWith("ru") ? ru : en;
  return pack[key] ?? en[key] ?? key;
}
