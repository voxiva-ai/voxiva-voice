import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export function beginWindowDrag(event: { button: number }) {
  if (event.button !== 0) return;
  try {
    void getCurrentWindow().startDragging();
  } catch {
    // web preview
  }
}

export function toggleMaximize() {
  try {
    void getCurrentWindow().toggleMaximize().catch(() => undefined);
  } catch {
    // web preview
  }
}

/** Compact app window — tall enough for full Settings nav. */
export async function ensureAppWindowSize() {
  try {
    const win = getCurrentWindow();
    await win.setSize(new LogicalSize(520, 900));
    await win.center();
  } catch {
    // web preview
  }
}

/** @deprecated use ensureAppWindowSize */
export const ensureWelcomeWindowSize = ensureAppWindowSize;
