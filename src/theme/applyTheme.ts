import type { UiTheme } from "@/types/settings";

export function applyTheme(theme: UiTheme | null | undefined) {
  const t: UiTheme = theme ?? "bridgemind";
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t === "light" ? "light" : "dark";
}

