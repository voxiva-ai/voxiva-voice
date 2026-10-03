export type MessageKey =
  | "nav.overview"
  | "nav.history"
  | "nav.dictionary"
  | "nav.instructions"
  | "nav.shortcuts"
  | "nav.settings"
  | "nav.phone"
  | "nav.account"
  | "nav.tagline"
  | "nav.language"
  | "onboarding.title"
  | "onboarding.subtitle"
  | "onboarding.heroBody"
  | "onboarding.setupLead"
  | "onboarding.ctaStart"
  | "onboarding.ctaContinue"
  | "onboarding.ctaOffline"
  | "onboarding.back"
  | "onboarding.note"
  | "onboarding.modeLabel"
  | "onboarding.pttHint"
  | "onboarding.toggleHint"
  | "onboarding.pointFast"
  | "onboarding.pointFree"
  | "onboarding.pointLocal"
  | "phone.title"
  | "phone.body"
  | "phone.step1"
  | "phone.step2"
  | "phone.step3"
  | "phone.step4"
  | "phone.tip"
  | "auth.waitTitle"
  | "auth.waitBody"
  | "auth.continue"
  | "auth.openBrowser"
  | "overview.heroTitle"
  | "overview.heroBody"
  | "overview.openSettings"
  | "overview.openHistory"
  | "overview.openShortcuts"
  | "overview.howTitle"
  | "overview.tipsTitle"
  | "overview.step1"
  | "overview.step2"
  | "overview.step3"
  | "overview.tip1"
  | "overview.tip2"
  | "overview.tip3"
  | "overview.cardHotkey"
  | "overview.cardMode"
  | "overview.cardPrivacy"
  | "overview.cardPrivacyBody"
  | "preview.idle"
  | "preview.listening"
  | "preview.processing"
  | "preview.ready"
  | "preview.caption"
  | "settings.title"
  | "settings.intro"
  | "settings.dictationLang"
  | "settings.uiLang"
  | "settings.uiLocaleEn"
  | "settings.uiLocaleRu"
  | "settings.hotkey"
  | "settings.recordingMode"
  | "settings.recordingModePtt"
  | "settings.recordingModeToggle"
  | "settings.sttMode"
  | "settings.whisperPath"
  | "settings.privacy"
  | "settings.dictJson"
  | "overview.minimizeHud"
  | "overview.hudHint"
  | "overview.setupTitle"
  | "overview.statsTitle"
  | "splash.line1"
  | "splash.line2"
  | "settings.helpPaste"
  | "settings.helpSpace"
  | "settings.historyHint"
  | "settings.historySoon"
  | "settings.aboutHint"
  | "settings.aboutBody"
  | "settings.section.look"
  | "settings.section.voice"
  | "settings.section.input"
  | "settings.section.phone"
  | "settings.section.help"
  | "settings.section.history"
  | "settings.section.about"
  | "settings.section.advanced"
  | "settings.lookHint"
  | "welcome.hint"
  | "settings.save"
  | "settings.saved"
  | "settings.loading"
  | "settings.saving"
  | "common.busy"
  | "brand.voxiva"
  | "brand.voice"
  | "settings.kicker"
  | "settings.voiceSectionTitle"
  | "settings.voiceSectionSub"
  | "settings.whisperEngine"
  | "settings.whisperEngineCap"
  | "settings.whisperSectionTitle"
  | "settings.whisperSectionSub"
  | "settings.whisperLocalHint"
  | "settings.whisperReady"
  | "settings.whisperChecking"
  | "settings.whisperDownloading"
  | "settings.whisperNotReady"
  | "settings.download"
  | "settings.refresh"
  | "settings.preparing"
  | "settings.inputSectionTitle"
  | "settings.inputSectionSub"
  | "settings.dictSectionTitle"
  | "settings.dictSectionSub"
  | "settings.pasteMethod"
  | "settings.pasteCtrlV"
  | "settings.pasteCtrlVCap"
  | "settings.pasteShiftInsert"
  | "settings.pasteShiftInsertCap"
  | "settings.pasteCtrlShiftV"
  | "settings.pasteCtrlShiftVCap"
  | "settings.voiceActivation"
  | "settings.voiceActivationDesc"
  | "settings.humanize"
  | "settings.humanizeDesc"
  | "settings.themesSectionTitle"
  | "settings.themesSectionSub"
  | "settings.widgetSectionTitle"
  | "settings.widgetSectionSub"
  | "settings.advancedSectionTitle"
  | "settings.advancedSectionSub"
  | "settings.showPaths"
  | "settings.hidePaths"
  | "settings.whisperCliLabel"
  | "settings.whisperModelLabel"
  | "settings.langAuto"
  | "settings.langEn"
  | "settings.langRu"
  | "settings.hudFull"
  | "settings.hudFullCap"
  | "settings.hudIcon"
  | "settings.hudIconCap"
  | "settings.themeVoxiva"
  | "settings.themeVoxivaCap"
  | "settings.themeBlack"
  | "settings.themeBlackCap"
  | "settings.themeLight"
  | "settings.themeLightCap"
  | "settings.hotkeyDefault"
  | "settings.hotkeyCtrlSpace"
  | "settings.hotkeyAltSpace"
  | "settings.hotkeyCtrlAltSpace"
  | "settings.hotkeyCustom"
  | "settings.hotkeyExample"
  | "settings.hotkeyInvalid"
  | "settings.dictInvalid"
  | "settings.helpSectionSub"
  | "settings.alwaysLocal"
  | "settings.alwaysLocalHint"
  | "settings.uiLangSub"
  | "settings.tagFree"
  | "settings.tagLocal"
  | "settings.tagFast"
  | "win.minimize"
  | "win.maximize"
  | "win.restore"
  | "win.close"
  | "preview.stepHold"
  | "preview.stepSpeak"
  | "preview.stepRelease"
  | "preview.stepLand"
  | "preview.holdSpeakLand"
  | "preview.live"
  | "preview.hud"
  | "preview.anyApp"
  | "preview.demoText"
  | "preview.cursorLine"
  | "stats.words"
  | "stats.dictationTime"
  | "stats.appTime"
  | "stats.sessions"
  | "stats.recentTitle"
  | "stats.empty"
  | "stats.wordsUnit"
  | "settings.updateTitle"
  | "settings.updateCheck"
  | "settings.updateChecking"
  | "settings.updateAvailable"
  | "settings.updateCurrent"
  | "settings.updateDownload"
  | "settings.updateUpToDate"
  | "settings.updateFailed"
  | "settings.updateOpenPage";

const en: Record<MessageKey, string> = {
  "nav.overview": "Overview",
  "nav.history": "History",
  "nav.dictionary": "Dictionary",
  "nav.instructions": "Instructions",
  "nav.shortcuts": "Shortcuts",
  "nav.settings": "Settings",
  "nav.phone": "Phone",
  "nav.account": "Account",
  "nav.tagline": "Dictation for any app",
  "nav.language": "Language",
  "onboarding.title": "Voxiva Voice",
  "onboarding.subtitle": "Hold. Speak. Land.",
  "onboarding.heroBody": "Speak — text lands in any app.",
  "onboarding.setupLead": "Recording mode",
  "onboarding.ctaStart": "Start",
  "onboarding.ctaContinue": "Continue",
  "onboarding.ctaOffline": "Skip",
  "onboarding.back": "Back",
  "onboarding.note": "",
  "onboarding.modeLabel": "Mode",
  "onboarding.pttHint": "Hold hotkey to speak",
  "onboarding.toggleHint": "Press to start / stop",
  "onboarding.pointFast": "Low-latency dictation — text appears as soon as you finish",
  "onboarding.pointFree": "Fully free core — no paywall for day-to-day use",
  "onboarding.pointLocal": "Private by default — speech stays on your machine",
  "phone.title": "Phone",
  "phone.body": "Scan once on the same Wi‑Fi. Opens Voxiva Voice on your phone — dictate or type, text pastes on this PC.",
  "phone.step1": "Open Camera and scan the QR.",
  "phone.step2": "If the phone asks to open a local link — allow it. It’s your PC, not a random site.",
  "phone.step3": "Click a text field on the PC, then Record or Type on the phone.",
  "phone.step4": "Optional: Add to Home Screen — next time it opens like an app.",
  "phone.tip": "Keep Voice running. Phone and PC must share the same Wi‑Fi.",
  "auth.waitTitle": "Waiting for sign in…",
  "auth.waitBody": "Browser sign-in will plug in later. Continue offline for now.",
  "auth.continue": "Continue",
  "auth.openBrowser": "Open Browser Again",
  "overview.heroTitle": "Stop typing. Just speak.",
  "overview.heroBody": "Put the cursor anywhere. Hold your hotkey, speak, release — text lands in the focused app.",
  "overview.openSettings": "Open Settings",
  "overview.minimizeHud": "Minimize",
  "overview.hudHint": "Floating icon stays on screen",
  "overview.setupTitle": "Setup",
  "overview.statsTitle": "Your dictation",
  "splash.line1": "Stop typing.",
  "splash.line2": "Just speak.",
  "settings.helpPaste": "If paste fails, try another paste method in Settings → Input.",
  "settings.helpSpace": "In Voxiva Space terminals and agent chats: click the input first so the caret blinks, then dictate.",
  "settings.historyHint": "Recent dictation sessions.",
  "settings.historySoon": "History is coming soon. Dictation already works in every app.",
  "settings.aboutHint": "No account required.",
  "settings.aboutBody": "Free local dictation for any text field. Same Voxiva design family as Space.",
  "settings.section.look": "Appearance",
  "settings.section.voice": "Voice",
  "settings.section.input": "Input",
  "settings.section.phone": "Phone",
  "settings.section.help": "Help",
  "settings.section.history": "History",
  "settings.section.about": "About",
  "settings.section.advanced": "Advanced",
  "settings.lookHint": "Language and theme — same look family as Space.",
  "welcome.hint": "Hold your hotkey, speak, release — text lands where the cursor is.",
  "overview.openHistory": "History",
  "overview.openShortcuts": "Hotkey",
  "overview.howTitle": "How to use",
  "overview.tipsTitle": "Tips",
  "overview.step1": "Open Settings and choose a hotkey.",
  "overview.step2": "Pick Push-to-talk or Toggle.",
  "overview.step3": "Click a text field and dictate.",
  "overview.tip1": "Speak clearly with the mic nearby.",
  "overview.tip2": "If paste fails, change Paste method in Settings.",
  "overview.tip3": "English and Russian are supported.",
  "overview.cardHotkey": "Global hotkey",
  "overview.cardMode": "Recording mode",
  "overview.cardPrivacy": "Privacy",
  "overview.cardPrivacyBody": "On-device Whisper. Audio stays on this PC.",
  "settings.title": "Settings",
  "settings.intro": "Language, hotkey, Whisper, and the floating HUD — same look family as Space.",
  "settings.dictationLang": "Dictation language",
  "settings.uiLang": "Interface language",
  "settings.uiLocaleEn": "English",
  "settings.uiLocaleRu": "Русский",
  "settings.hotkey": "Hotkey",
  "settings.recordingMode": "Recording mode",
  "settings.recordingModePtt": "Push-to-talk",
  "settings.recordingModeToggle": "Toggle",
  "settings.sttMode": "STT engine",
  "settings.whisperPath": "Whisper model file",
  "settings.privacy": "Local-only (no cloud)",
  "settings.dictJson": "Dictionary (optional)",
  "settings.save": "Save",
  "settings.saved": "Saved locally.",
  "settings.loading": "Loading settings…",
  "settings.saving": "Saving…",
  "common.busy": "…",
  "brand.voxiva": "Voxiva",
  "brand.voice": "Voice",
  "settings.kicker": "Voxiva Voice",
  "settings.voiceSectionTitle": "Transcription",
  "settings.voiceSectionSub": "Whisper is free, local, and tuned for English & Russian with low latency.",
  "settings.whisperEngine": "Whisper",
  "settings.whisperEngineCap": "Free offline recognition — English & Russian.",
  "settings.whisperSectionTitle": "Local model",
  "settings.whisperSectionSub": "Download once — then dictation stays offline and fast.",
  "settings.whisperLocalHint": "Runs on this computer. No cloud round-trip.",
  "settings.whisperReady": "Ready",
  "settings.whisperChecking": "Checking…",
  "settings.whisperDownloading": "Downloading and preparing Whisper… (this can take a while)",
  "settings.whisperNotReady": "Not ready (will download to: {dir})",
  "settings.download": "Download",
  "settings.refresh": "Refresh",
  "settings.preparing": "Preparing…",
  "settings.inputSectionTitle": "Input & recording",
  "settings.inputSectionSub": "Language, shortcut, and paste behavior for any text field.",
  "settings.dictSectionTitle": "Dictionary",
  "settings.dictSectionSub": "Automatic phrase replacements for names, products, and repeated fixes.",
  "settings.pasteMethod": "Paste method",
  "settings.pasteCtrlV": "Ctrl+V",
  "settings.pasteCtrlVCap": "Default.",
  "settings.pasteShiftInsert": "Shift+Insert",
  "settings.pasteShiftInsertCap": "Alternative.",
  "settings.pasteCtrlShiftV": "Ctrl+Shift+V",
  "settings.pasteCtrlShiftVCap": "Alternative.",
  "settings.voiceActivation": "Voice activation",
  "settings.voiceActivationDesc": "Start automatically when you speak.",
  "settings.humanize": "Punctuation & cleanup",
  "settings.humanizeDesc": "Add commas, periods, and capitals after dictation. Local rules only — no cloud.",
  "settings.themesSectionTitle": "Themes",
  "settings.themesSectionSub": "Same palette family as Voxiva Space.",
  "settings.widgetSectionTitle": "Widget",
  "settings.widgetSectionSub": "Compact HUD while the main window is minimized.",
  "settings.advancedSectionTitle": "Advanced",
  "settings.advancedSectionSub": "Optional paths. Leave blank to use bundled defaults.",
  "settings.showPaths": "Show model paths",
  "settings.hidePaths": "Hide paths",
  "settings.whisperCliLabel": "whisper-cli.exe",
  "settings.whisperModelLabel": "model (.bin)",
  "settings.langAuto": "Auto",
  "settings.langEn": "English",
  "settings.langRu": "Русский",
  "settings.hudFull": "Logo + wave",
  "settings.hudFullCap": "Logo, level meter, and mic control.",
  "settings.hudIcon": "Icon only",
  "settings.hudIconCap": "Compact logo — hold or click the icon to dictate.",
  "settings.themeVoxiva": "Voxiva",
  "settings.themeVoxivaCap": "Same base as Space.",
  "settings.themeBlack": "Black",
  "settings.themeBlackCap": "Pure OLED.",
  "settings.themeLight": "Light",
  "settings.themeLightCap": "Bright mode.",
  "settings.hotkeyDefault": "Ctrl + Shift + Space (default)",
  "settings.hotkeyCtrlSpace": "Ctrl + Space",
  "settings.hotkeyAltSpace": "Alt + Space",
  "settings.hotkeyCtrlAltSpace": "Ctrl + Alt + Space",
  "settings.hotkeyCustom": "Custom…",
  "settings.hotkeyExample": "Example: ctrl+shift+space",
  "settings.hotkeyInvalid": "Hotkey must look like ctrl+shift+space",
  "settings.dictInvalid": "Dictionary must be a JSON array",
  "settings.helpSectionSub": "Works in any app — VS Code, browser, Voxiva Space terminals, Notepad.",
  "settings.alwaysLocal": "Always local",
  "settings.alwaysLocalHint": "Speech and transcription stay on this PC. No cloud upload.",
  "settings.uiLangSub": "English or Russian for the whole app.",
  "settings.tagFree": "Free",
  "settings.tagLocal": "Local",
  "settings.tagFast": "Fast",
  "win.minimize": "Minimize",
  "win.maximize": "Maximize",
  "win.restore": "Restore",
  "win.close": "Close",
  "preview.idle": "Ready",
  "preview.listening": "Listening",
  "preview.processing": "…",
  "preview.ready": "Done",
  "preview.caption": "",
  "preview.stepHold": "Hold",
  "preview.stepSpeak": "Speak",
  "preview.stepRelease": "Release",
  "preview.stepLand": "Land",
  "preview.holdSpeakLand": "Voxiva Voice",
  "preview.live": "Live",
  "preview.hud": "Mic",
  "preview.anyApp": "Editor",
  "preview.demoText": "Ship pricing with local voice dictation.",
  "preview.cursorLine": "Notes",
  "stats.words": "Words dictated",
  "stats.dictationTime": "Speaking time",
  "stats.appTime": "Time in app",
  "stats.sessions": "Dictation sessions",
  "stats.recentTitle": "Recent phrases",
  "stats.empty": "Start dictating — your words and time will appear here.",
  "stats.wordsUnit": "words",
  "settings.updateTitle": "Updates",
  "settings.updateCheck": "Check for updates",
  "settings.updateChecking": "Checking…",
  "settings.updateAvailable": "Update available: v{latest} (you have v{current})",
  "settings.updateCurrent": "Current version: v{version}",
  "settings.updateDownload": "Download update",
  "settings.updateUpToDate": "You're on the latest version.",
  "settings.updateFailed": "Could not check for updates. Try again or open Downloads.",
  "settings.updateOpenPage": "Open downloads page",
};

const ru: Record<MessageKey, string> = {
  "nav.overview": "Обзор",
  "nav.history": "История",
  "nav.dictionary": "Словарь",
  "nav.instructions": "Инструкция",
  "nav.shortcuts": "Хоткеи",
  "nav.settings": "Настройки",
  "nav.phone": "Телефон",
  "nav.account": "Аккаунт",
  "nav.tagline": "Диктовка для любых приложений",
  "nav.language": "Язык",
  "onboarding.title": "Voxiva Voice",
  "onboarding.subtitle": "Удержи. Говори. Готово.",
  "onboarding.heroBody": "Сказал — текст в любом приложении.",
  "onboarding.setupLead": "Режим записи",
  "onboarding.ctaStart": "Старт",
  "onboarding.ctaContinue": "Продолжить",
  "onboarding.ctaOffline": "Пропустить",
  "onboarding.back": "Назад",
  "onboarding.note": "",
  "onboarding.modeLabel": "Режим",
  "onboarding.pttHint": "Удерживай хоткей",
  "onboarding.toggleHint": "Нажми — старт / стоп",
  "onboarding.pointFast": "Низкая задержка — текст появляется сразу после речи",
  "onboarding.pointFree": "Базовый режим бесплатный — без paywall на каждый день",
  "onboarding.pointLocal": "Приватно по умолчанию — речь остаётся на устройстве",
  "phone.title": "Телефон",
  "phone.body": "Сканируй QR в той же Wi‑Fi. Откроется Voxiva Voice на телефоне — диктуй или печатай, текст вставится на этот ПК.",
  "phone.step1": "Открой камеру и сканируй код.",
  "phone.step2": "Если телефон спрашивает доступ к локальной ссылке — разреши. Это твой ПК, не чужой сайт.",
  "phone.step3": "Кликни поле на ПК, потом Запись или Печать на телефоне.",
  "phone.step4": "По желанию: «На экран Домой» — в следующий раз откроется как приложение.",
  "phone.tip": "Voice должен быть запущен. Телефон и ПК — в одной Wi‑Fi.",
  "auth.waitTitle": "Ожидание входа…",
  "auth.waitBody": "Вход через браузер подключим позже. Сейчас можно продолжить офлайн.",
  "auth.continue": "Продолжить",
  "auth.openBrowser": "Открыть браузер ещё раз",
  "overview.heroTitle": "Хватит печатать. Просто говори.",
  "overview.heroBody": "Поставь курсор куда угодно. Удержи хоткей, говори, отпусти — текст появится в активном приложении.",
  "overview.openSettings": "Открыть настройки",
  "overview.minimizeHud": "Свернуть",
  "overview.hudHint": "Иконка останется на экране",
  "overview.setupTitle": "Настройка",
  "overview.statsTitle": "Твоя диктовка",
  "splash.line1": "Хватит печатать.",
  "splash.line2": "Просто говори.",
  "settings.helpPaste": "Если текст не вставляется — смени способ вставки в Настройки → Ввод.",
  "settings.helpSpace": "В терминалах Voxiva Space и чатах агентов: сначала кликни в поле ввода, чтобы мигал курсор, потом диктуй.",
  "settings.historyHint": "Недавние сессии диктовки.",
  "settings.historySoon": "История скоро появится. Диктовка уже работает в любом приложении.",
  "settings.aboutHint": "Аккаунт не нужен.",
  "settings.aboutBody": "Бесплатная локальная диктовка в любое поле. Тот же стиль Voxiva, что и Space.",
  "settings.section.look": "Внешний вид",
  "settings.section.voice": "Голос",
  "settings.section.input": "Ввод",
  "settings.section.phone": "Телефон",
  "settings.section.help": "Справка",
  "settings.section.history": "История",
  "settings.section.about": "О приложении",
  "settings.section.advanced": "Дополнительно",
  "settings.lookHint": "Язык и тема — в той же палитре, что и Space.",
  "welcome.hint": "Удержи хоткей, говори, отпусти — текст появится там, где курсор.",
  "overview.openHistory": "История",
  "overview.openShortcuts": "Хоткей",
  "overview.howTitle": "Как пользоваться",
  "overview.tipsTitle": "Подсказки",
  "overview.step1": "Открой настройки и выбери хоткей.",
  "overview.step2": "Выбери: удерживать или вкл/выкл.",
  "overview.step3": "Кликни в поле ввода и диктуй.",
  "overview.tip1": "Говори чётко, микрофон ближе.",
  "overview.tip2": "Если не вставляется — смени Paste в настройках.",
  "overview.tip3": "Поддерживаются русский и английский.",
  "overview.cardHotkey": "Глобальный хоткей",
  "overview.cardMode": "Режим записи",
  "overview.cardPrivacy": "Приватность",
  "overview.cardPrivacyBody": "Whisper на устройстве. Аудио не уходит в облако.",
  "preview.idle": "Готов",
  "preview.listening": "Слушаю",
  "preview.processing": "…",
  "preview.ready": "Готово",
  "preview.caption": "",
  "settings.title": "Настройки",
  "settings.intro": "Язык, хоткей, Whisper и HUD — в той же палитре, что и Space.",
  "settings.dictationLang": "Язык диктовки",
  "settings.uiLang": "Язык интерфейса",
  "settings.uiLocaleEn": "English",
  "settings.uiLocaleRu": "Русский",
  "settings.hotkey": "Хоткей",
  "settings.recordingMode": "Режим записи",
  "settings.recordingModePtt": "Удерживать",
  "settings.recordingModeToggle": "Вкл/выкл",
  "settings.sttMode": "Движок STT",
  "settings.whisperPath": "Файл модели Whisper",
  "settings.privacy": "Только локально (без облака)",
  "settings.dictJson": "Словарь (опционально)",
  "settings.save": "Сохранить",
  "settings.saved": "Сохранено локально.",
  "settings.loading": "Загрузка…",
  "settings.saving": "Сохранение…",
  "common.busy": "…",
  "brand.voxiva": "Voxiva",
  "brand.voice": "Voice",
  "settings.kicker": "Voxiva Voice",
  "settings.voiceSectionTitle": "Распознавание",
  "settings.voiceSectionSub": "Whisper бесплатный, локальный, быстрый на английском и русском.",
  "settings.whisperEngine": "Whisper",
  "settings.whisperEngineCap": "Бесплатное офлайн-распознавание — EN и RU.",
  "settings.whisperSectionTitle": "Локальная модель",
  "settings.whisperSectionSub": "Скачай один раз — диктовка остаётся офлайн и быстрой.",
  "settings.whisperLocalHint": "Работает на этом компьютере. Без облака.",
  "settings.whisperReady": "Готово",
  "settings.whisperChecking": "Проверка…",
  "settings.whisperDownloading": "Скачивание и подготовка Whisper… (может занять время)",
  "settings.whisperNotReady": "Не готово (скачивание в: {dir})",
  "settings.download": "Скачать",
  "settings.refresh": "Обновить",
  "settings.preparing": "Подготовка…",
  "settings.inputSectionTitle": "Ввод и запись",
  "settings.inputSectionSub": "Язык, хоткей и способ вставки для любого поля.",
  "settings.dictSectionTitle": "Словарь",
  "settings.dictSectionSub": "Автозамены для имён, продуктов и частых исправлений.",
  "settings.pasteMethod": "Способ вставки",
  "settings.pasteCtrlV": "Ctrl+V",
  "settings.pasteCtrlVCap": "По умолчанию.",
  "settings.pasteShiftInsert": "Shift+Insert",
  "settings.pasteShiftInsertCap": "Альтернатива.",
  "settings.pasteCtrlShiftV": "Ctrl+Shift+V",
  "settings.pasteCtrlShiftVCap": "Альтернатива.",
  "settings.voiceActivation": "Голосовая активация",
  "settings.voiceActivationDesc": "Запуск автоматически, когда говоришь.",
  "settings.humanize": "Знаки и оформление",
  "settings.humanizeDesc": "Запятые, точки и заглавные после диктовки. Только локальные правила — без облака.",
  "settings.themesSectionTitle": "Темы",
  "settings.themesSectionSub": "Та же палитра, что у Voxiva Space.",
  "settings.widgetSectionTitle": "Виджет",
  "settings.widgetSectionSub": "Компактный HUD, когда окно свёрнуто.",
  "settings.advancedSectionTitle": "Дополнительно",
  "settings.advancedSectionSub": "Необязательные пути. Пусто — встроенные значения.",
  "settings.showPaths": "Показать пути модели",
  "settings.hidePaths": "Скрыть пути",
  "settings.whisperCliLabel": "whisper-cli.exe",
  "settings.whisperModelLabel": "модель (.bin)",
  "settings.langAuto": "Авто",
  "settings.langEn": "English",
  "settings.langRu": "Русский",
  "settings.hudFull": "Лого + волна",
  "settings.hudFullCap": "Лого, индикатор уровня и микрофон.",
  "settings.hudIcon": "Только иконка",
  "settings.hudIconCap": "Компактное лого — удерживай или кликай для диктовки.",
  "settings.themeVoxiva": "Voxiva",
  "settings.themeVoxivaCap": "Как в Space.",
  "settings.themeBlack": "Чёрная",
  "settings.themeBlackCap": "Чистый OLED.",
  "settings.themeLight": "Светлая",
  "settings.themeLightCap": "Светлый режим.",
  "settings.hotkeyDefault": "Ctrl + Shift + Space (по умолчанию)",
  "settings.hotkeyCtrlSpace": "Ctrl + Space",
  "settings.hotkeyAltSpace": "Alt + Space",
  "settings.hotkeyCtrlAltSpace": "Ctrl + Alt + Space",
  "settings.hotkeyCustom": "Свой…",
  "settings.hotkeyExample": "Пример: ctrl+shift+space",
  "settings.hotkeyInvalid": "Хоткей должен быть вида ctrl+shift+space",
  "settings.dictInvalid": "Словарь должен быть JSON-массивом",
  "settings.helpSectionSub": "Работает в любом приложении — VS Code, браузер, терминалы Space, Блокнот.",
  "settings.alwaysLocal": "Всегда локально",
  "settings.alwaysLocalHint": "Речь и распознавание остаются на этом ПК. Без облака.",
  "settings.uiLangSub": "English или русский для всего приложения.",
  "settings.tagFree": "Free",
  "settings.tagLocal": "Local",
  "settings.tagFast": "Fast",
  "win.minimize": "Свернуть",
  "win.maximize": "Развернуть",
  "win.restore": "Восстановить",
  "win.close": "Закрыть",
  "preview.stepHold": "Удержи",
  "preview.stepSpeak": "Говори",
  "preview.stepRelease": "Отпусти",
  "preview.stepLand": "Готово",
  "preview.holdSpeakLand": "Voxiva Voice",
  "preview.live": "Live",
  "preview.hud": "Микрофон",
  "preview.anyApp": "Редактор",
  "preview.demoText": "Локальная голосовая диктовка.",
  "preview.cursorLine": "Заметки",
  "stats.words": "Слов продиктовано",
  "stats.dictationTime": "Время речи",
  "stats.appTime": "Время в приложении",
  "stats.sessions": "Сессий диктовки",
  "stats.recentTitle": "Недавние фразы",
  "stats.empty": "Начни диктовать — здесь появятся слова и время.",
  "stats.wordsUnit": "слов",
  "settings.updateTitle": "Обновления",
  "settings.updateCheck": "Проверить обновления",
  "settings.updateChecking": "Проверка…",
  "settings.updateAvailable": "Доступно обновление: v{latest} (у вас v{current})",
  "settings.updateCurrent": "Текущая версия: v{version}",
  "settings.updateDownload": "Скачать обновление",
  "settings.updateUpToDate": "У вас актуальная версия.",
  "settings.updateFailed": "Не удалось проверить обновления. Попробуй ещё раз или открой Downloads.",
  "settings.updateOpenPage": "Открыть страницу загрузок",
};

export function translate(locale: string, key: MessageKey): string {
  const pack = locale.startsWith("ru") ? ru : en;
  return pack[key] ?? en[key] ?? key;
}
