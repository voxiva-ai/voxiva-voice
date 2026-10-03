/** Help docs — parallel locales like Voxiva CLI READMEs. */

export type HelpLocale = "en" | "ru" | "zh";

export const HELP_LOCALES: { id: HelpLocale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ru", label: "Русский" },
  { id: "zh", label: "简体中文" },
];

export type HelpDoc = {
  title: string;
  lead: string;
  steps: string[];
};

export const HELP_DOCS: Record<HelpLocale, HelpDoc> = {
  en: {
    title: "How to use",
    lead: "Cursor anywhere. Hold hotkey, speak, release — text lands in the focused app.",
    steps: [
      "Open Settings → Input and pick a hotkey (default Ctrl+Shift+Space).",
      "Choose Push-to-talk (hold) or Toggle (press on / off).",
      "Click a text field, hold the hotkey, speak, release.",
      "Minimize the app — a small icon stays on screen and pulses while you dictate.",
      "If paste fails, try another Paste method in Settings → Input.",
      "In Voxiva Space terminals: click the input first so the caret blinks, then dictate.",
    ],
  },
  ru: {
    title: "Как пользоваться",
    lead: "Курсор куда угодно. Удержи хоткей, говори, отпусти — текст появится в активном приложении.",
    steps: [
      "Открой Настройки → Ввод и выбери хоткей (по умолчанию Ctrl+Shift+Space).",
      "Выбери «Удерживать» или «Вкл/выкл».",
      "Кликни в поле ввода, удержи хоткей, говори, отпусти.",
      "Сверни приложение — маленькая иконка останется на экране и будет пульсировать при диктовке.",
      "Если текст не вставляется — смени способ вставки в Настройки → Ввод.",
      "В терминалах Voxiva Space: сначала кликни в поле, чтобы мигал курсор, потом диктуй.",
    ],
  },
  zh: {
    title: "使用方法",
    lead: "把光标放在任意输入框。按住快捷键说话，松开后文字会出现在当前应用中。",
    steps: [
      "打开设置 → 输入，选择快捷键（默认 Ctrl+Shift+Space）。",
      "选择按住说话，或开关模式。",
      "点击输入框，按住快捷键说话，松开。",
      "最小化应用后，屏幕上会保留小图标；听写时图标会轻微闪动。",
      "如果无法粘贴，请在 设置 → 输入 中更换粘贴方式。",
      "在 Voxiva Space 终端中：先点击输入框让光标闪烁，再开始听写。",
    ],
  },
};
