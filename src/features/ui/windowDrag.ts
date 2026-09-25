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

/** Open welcome / first-run at compact phone-PC size. */
export async function ensureWelcomeWindowSize() {
  try {
    const win = getCurrentWindow();
    await win.setSize(new LogicalSize(440, 780));
    await win.center();
  } catch {
    // web preview
  }
}
