export type MessageKey =
  | "nav.overview"
  | "nav.history"
  | "nav.dictionary"
  | "nav.instructions"
  | "nav.shortcuts"
  | "nav.settings"
  | "nav.account"
  | "nav.tagline"
  | "onboarding.title"
  | "onboarding.subtitle"
  | "onboarding.ctaStart"
  | "onboarding.ctaOffline"
  | "onboarding.note"
  | "auth.waitTitle"
  | "auth.waitBody"
  | "auth.continue"
  | "auth.openBrowser"
  | "overview.heroTitle"
  | "overview.heroBody"
  | "overview.openSettings"
  | "overview.howTitle"
  | "overview.tipsTitle"
  | "overview.step1"
  | "overview.step2"
  | "overview.step3"
  | "overview.tip1"
  | "overview.tip2"
  | "overview.tip3"
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
  "nav.history": "History",
  "nav.dictionary": "Dictionary",
  "nav.instructions": "Instructions",
  "nav.shortcuts": "Shortcuts",
  "nav.settings": "Settings",
  "nav.account": "Account",
  "nav.tagline": "Dictation for any app",
  "onboarding.title": "Voxiva Voice",
  "onboarding.subtitle": "Stop typing. Just speak.",
  "onboarding.ctaStart": "Get Started",
  "onboarding.ctaOffline": "Continue offline",
  "onboarding.note": "No subscription. Local-first.",
  "auth.waitTitle": "Waiting for sign in…",
  "auth.waitBody": "We’ll use the browser for registration when the website is ready. For now you can continue offline.",
  "auth.continue": "Continue",
  "auth.openBrowser": "Open Browser Again",
  "overview.heroTitle": "Stop typing. Just speak.",
  "overview.heroBody": "Put the cursor in any app. Press your hotkey and speak — Voxiva Voice will type for you.",
  "overview.openSettings": "Open Settings",
  "overview.howTitle": "How to use",
  "overview.tipsTitle": "Tips",
  "overview.step1": "Open Settings and choose a hotkey.",
  "overview.step2": "Choose Push-to-talk (hold) or Toggle (press to start/stop).",
  "overview.step3": "Place the cursor where you want text and speak.",
  "overview.tip1": "Speak clearly and keep the microphone close.",
  "overview.tip2": "If paste doesn’t work in an app, change “Paste” in Settings.",
  "overview.tip3": "English and Russian are supported.",
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
  "nav.history": "История",
  "nav.dictionary": "Словарь",
  "nav.instructions": "Инструкция",
  "nav.shortcuts": "Хоткеи",
  "nav.settings": "Настройки",
  "nav.account": "Аккаунт",
  "nav.tagline": "Диктовка для любых приложений",
  "onboarding.title": "Voxiva Voice",
  "onboarding.subtitle": "Хватит печатать. Просто говори.",
  "onboarding.ctaStart": "Начать",
  "onboarding.ctaOffline": "Продолжить офлайн",
  "onboarding.note": "Без подписки. Сначала — локально.",
  "auth.waitTitle": "Ожидание входа…",
  "auth.waitBody": "Позже подключим регистрацию через браузер. Сейчас можно продолжить офлайн.",
  "auth.continue": "Продолжить",
  "auth.openBrowser": "Открыть браузер ещё раз",
  "overview.heroTitle": "Хватит печатать. Просто говори.",
  "overview.heroBody": "Поставь курсор в любом приложении, нажми хоткей и говори — Voxiva Voice напечатает текст.",
  "overview.openSettings": "Открыть настройки",
  "overview.howTitle": "Как пользоваться",
  "overview.tipsTitle": "Подсказки",
  "overview.step1": "Открой настройки и выбери хоткей.",
  "overview.step2": "Выбери режим: удерживать или вкл/выкл.",
  "overview.step3": "Поставь курсор в поле ввода и диктуй.",
  "overview.tip1": "Говори чётко и держи микрофон ближе.",
  "overview.tip2": "Если не вставляется — поменяй “Paste” в настройках.",
  "overview.tip3": "Поддерживаются русский и английский.",
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
