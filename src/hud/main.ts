import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import hudIconUrl from "@/assets/brand/voxiva-voice-logo.png";

type Settings = {
  recordingMode: "pushToTalk" | "toggle";
  hudMode?: "full" | "iconOnly";
  uiLocale?: string;
};

function hudCopy(uiLocale?: string) {
  const ru = (uiLocale ?? navigator.language).toLowerCase().startsWith("ru");
  return {
    micPtt: ru ? "Удерживай для диктовки" : "Hold to dictate",
    micToggle: ru ? "Нажми для диктовки" : "Click to dictate",
  };
}

type HudPayload = { phase: string; level?: number };

const HUD_H = 36;
const HUD_W_FULL = 128;
const HUD_ICON = 36;
const LOGO_RADIUS = "22.7%";

const ACCENT = "rgba(90,166,255,0.5)";
const ATTENTION = "rgba(239,195,90,0.95)";

document.documentElement.style.cssText =
  "margin:0;width:100%;height:100%;overflow:hidden;background:transparent;";
document.body.style.cssText =
  "margin:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:stretch;justify-content:stretch;background:transparent;font-family:DM Sans,Segoe UI,system-ui,sans-serif;user-select:none;";

const shell = document.createElement("div");
shell.setAttribute("data-tauri-drag-region", "");
shell.style.cssText = [
  "display:flex",
  "align-items:center",
  "justify-content:center",
  "width:100%",
  "height:100%",
  "box-sizing:border-box",
  "cursor:grab",
].join(";");

const pill = document.createElement("div");
pill.setAttribute("data-tauri-drag-region", "");
pill.style.cssText = [
  "display:inline-flex",
  "align-items:center",
  "justify-content:center",
  "gap:5px",
  "height:100%",
  "width:100%",
  "padding:0 5px",
  "border-radius:10px",
  "border:none",
  "background:rgba(7,9,14,0.92)",
  "box-sizing:border-box",
].join(";");

const logoWrap = document.createElement("button");
logoWrap.type = "button";
logoWrap.style.cssText = [
  "-webkit-app-region:no-drag",
  "-webkit-appearance:none",
  "appearance:none",
  "width:28px",
  "height:28px",
  "flex:0 0 28px",
  "padding:0",
  "margin:0",
  "border:none",
  "outline:none",
  "border-radius:8px",
  "background:transparent",
  "cursor:pointer",
  "display:inline-flex",
  "align-items:center",
  "justify-content:center",
  "overflow:hidden",
  "transition:transform 0.14s ease,filter 0.14s ease",
].join(";");

const logo = document.createElement("img");
logo.src = logoUrl;
logo.alt = "Voxiva";
logo.draggable = false;
logo.style.cssText = [
  "width:100%",
  "height:100%",
  "border-radius:8px",
  "display:block",
  "object-fit:contain",
  "pointer-events:none",
  "background:transparent",
].join(";");
logoWrap.appendChild(logo);

const meter = document.createElement("div");
meter.style.cssText =
  "display:flex;align-items:center;justify-content:center;gap:2px;width:48px;height:24px;flex:0 0 48px;";
const bars = Array.from({ length: 6 }).map(() => {
  const b = document.createElement("div");
  b.style.cssText =
    "width:3px;height:4px;border-radius:99px;background:rgba(90,166,255,0.35);transition:height 90ms linear,background 140ms ease;";
  meter.appendChild(b);
  return b;
});

const mic = document.createElement("button");
mic.type = "button";
mic.style.cssText = [
  "-webkit-app-region:no-drag",
  "width:24px",
  "height:24px",
  "flex:0 0 24px",
  "border-radius:7px",
  "border:none",
  "background:rgba(90,166,255,0.14)",
  "color:#eef2f8",
  "cursor:pointer",
  "display:inline-flex",
  "align-items:center",
  "justify-content:center",
  "padding:0",
  "margin:0",
  "line-height:0",
].join(";");
mic.setAttribute("aria-label", "microphone");
mic.innerHTML =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v3"/><path d="M8 21h8"/></svg>';

pill.appendChild(logoWrap);
pill.appendChild(meter);
pill.appendChild(mic);
shell.appendChild(pill);
document.body.appendChild(shell);

function beginHudDrag(event: PointerEvent) {
  if (event.button !== 0) return;
  if ((event.target as HTMLElement).closest("button")) return;
  shell.style.cursor = "grabbing";
  void getCurrentWindow()
    .startDragging()
    .catch(() => undefined)
    .finally(() => {
      shell.style.cursor = "grab";
    });
}

shell.addEventListener("pointerdown", beginHudDrag);
pill.addEventListener("pointerdown", beginHudDrag);

let recordingMode: Settings["recordingMode"] = "pushToTalk";
let hudMode: NonNullable<Settings["hudMode"]> = "full";
let targetLevel = 0;
let displayLevel = 0;
let phase: "idle" | "recording" | "transcribing" | "error" = "idle";

async function syncHudShape(mode: NonNullable<Settings["hudMode"]>) {
  const iconOnly = mode === "iconOnly";
  const w = iconOnly ? HUD_ICON : HUD_W_FULL;
  const h = iconOnly ? HUD_ICON : HUD_H;
  try {
    const win = getCurrentWindow();
    await win.setBackgroundColor([0, 0, 0, 0]);
    await invoke("clip_hud_window", { width: w, height: h, iconOnly });
  } catch {
    /* ignore */
  }
}

async function resizeHud(mode: NonNullable<Settings["hudMode"]>) {
  try {
    const win = getCurrentWindow();
    const w = mode === "iconOnly" ? HUD_ICON : HUD_W_FULL;
    const h = mode === "iconOnly" ? HUD_ICON : HUD_H;
    await win.setSize(new LogicalSize(w, h));
    await syncHudShape(mode);
  } catch {
    /* ignore */
  }
}

function styleLogo(rec: boolean, typing: boolean, err: boolean) {
  logoWrap.style.transform = "scale(1)";
  logoWrap.style.boxShadow = "none";
  logoWrap.style.opacity = "1";
  pill.style.boxShadow = "none";
  pill.style.border = "none";
  logo.style.filter = "none";

  if (rec) {
    logoWrap.style.opacity = "0.92";
    return;
  }
  if (typing) {
    logoWrap.style.opacity = "0.78";
    return;
  }
  if (err) {
    logoWrap.style.opacity = "0.65";
  }
}

function renderBars(level: number) {
  if (hudMode === "iconOnly") return;
  const l = Math.max(0, Math.min(1, level));
  const n = bars.length;
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const dist = Math.abs(i - mid) / Math.max(mid, 1);
    const centerBias = 1 - dist;
    const v = Math.max(0, Math.min(1, l * (0.35 + centerBias * 0.9)));
    bars[i].style.height = `${Math.round(4 + 14 * v)}px`;
    bars[i].style.background = phase === "recording" ? ATTENTION : ACCENT;
  }
}

function setPhase(next: "idle" | "recording" | "transcribing" | "error") {
  phase = next;
  const rec = next === "recording";
  styleLogo(rec, next === "transcribing", next === "error");
  mic.style.background = rec ? "rgba(239,195,90,0.24)" : "rgba(90,166,255,0.14)";
  renderBars(displayLevel);
}

void listen<HudPayload>("vv:hud", (e) => {
  if (typeof e.payload.level === "number") targetLevel = e.payload.level;
  if (e.payload.phase === "recording") setPhase("recording");
  if (e.payload.phase === "transcribing") setPhase("transcribing");
  if (e.payload.phase === "error") setPhase("error");
  if (e.payload.phase === "idle") setPhase("idle");
});

function applyHudSettings(s: Settings) {
  recordingMode = s.recordingMode ?? "pushToTalk";
  hudMode = s.hudMode ?? "full";
  const copy = hudCopy(s.uiLocale);
  const title = recordingMode === "toggle" ? copy.micToggle : copy.micPtt;
  mic.title = title;
  logoWrap.title = title;
  const iconOnly = hudMode === "iconOnly";
  meter.style.display = iconOnly ? "none" : "flex";
  mic.style.display = iconOnly ? "none" : "inline-flex";

  if (iconOnly) {
    pill.style.background = "transparent";
    pill.style.padding = "0";
    pill.style.gap = "0";
    pill.style.borderRadius = "0";
    pill.style.boxShadow = "none";
    shell.style.padding = "0";
    shell.style.cursor = "grab";
    shell.style.clipPath = `inset(0 round ${LOGO_RADIUS})`;
    shell.style.overflow = "hidden";
    logoWrap.style.width = "100%";
    logoWrap.style.height = "100%";
    logoWrap.style.flex = "1 1 auto";
    logoWrap.style.borderRadius = LOGO_RADIUS;
    logo.style.borderRadius = LOGO_RADIUS;
    logo.src = hudIconUrl;
  } else {
    shell.style.clipPath = "none";
    shell.style.overflow = "visible";
    pill.style.background = "rgba(7,9,14,0.92)";
    pill.style.padding = "0 5px";
    pill.style.gap = "5px";
    pill.style.borderRadius = "10px";
    pill.style.boxShadow = "none";
    shell.style.padding = "0";
    logoWrap.style.width = "28px";
    logoWrap.style.height = "28px";
    logoWrap.style.flex = "0 0 28px";
    logoWrap.style.borderRadius = "8px";
    logo.style.borderRadius = "8px";
    logo.src = logoUrl;
  }

  void resizeHud(hudMode);
}

void listen<Settings>("vv:hud-settings", (e) => {
  applyHudSettings(e.payload);
});

function tick() {
  if (phase === "recording") {
    targetLevel *= 0.92;
    displayLevel = displayLevel * 0.75 + targetLevel * 0.25;
    renderBars(displayLevel);
    window.setTimeout(tick, 40);
  } else {
    displayLevel *= 0.8;
    renderBars(displayLevel);
    window.setTimeout(tick, 200);
  }
}
tick();

void (async () => {
  try {
    await syncHudShape("full");
    const s = await invoke<Settings>("get_settings");
    applyHudSettings(s);
  } catch {
    logoWrap.title = hudCopy().micPtt;
    void resizeHud("full");
  }
})();

function micDown() {
  void invoke("hud_ptt_pointer_down").catch(() => {});
}
function micUp() {
  void invoke("hud_ptt_pointer_up").catch(() => {});
}
function micToggle() {
  void invoke("hud_toggle_click").catch(() => {});
}

function bindMic(el: HTMLElement, opts?: { dragOrPtt?: boolean }) {
  let downX = 0;
  let downY = 0;
  let dragging = false;
  let pttActive = false;
  let pttTimer: ReturnType<typeof setTimeout> | undefined;

  function clearPttTimer() {
    if (pttTimer !== undefined) {
      clearTimeout(pttTimer);
      pttTimer = undefined;
    }
  }

  function wantsDragOrPtt() {
    return opts?.dragOrPtt === true && hudMode === "iconOnly";
  }

  el.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    ev.preventDefault();
    downX = ev.clientX;
    downY = ev.clientY;
    dragging = false;
    pttActive = false;
    clearPttTimer();
    el.setPointerCapture(ev.pointerId);

    if (recordingMode !== "pushToTalk") return;

    if (wantsDragOrPtt()) {
      pttTimer = setTimeout(() => {
        pttTimer = undefined;
        if (dragging) return;
        pttActive = true;
        micDown();
      }, 120);
      return;
    }

    pttActive = true;
    micDown();
  });

  el.addEventListener("pointermove", (ev) => {
    if (!wantsDragOrPtt() || !el.hasPointerCapture(ev.pointerId) || dragging) return;
    const dx = ev.clientX - downX;
    const dy = ev.clientY - downY;
    if (dx * dx + dy * dy < 36) return;
    dragging = true;
    clearPttTimer();
    if (pttActive) {
      pttActive = false;
      micUp();
    }
    shell.style.cursor = "grabbing";
    void getCurrentWindow()
      .startDragging()
      .catch(() => undefined)
      .finally(() => {
        shell.style.cursor = "grab";
      });
  });

  el.addEventListener("pointerup", (ev) => {
    ev.preventDefault();
    clearPttTimer();
    try {
      el.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    if (dragging) {
      dragging = false;
      return;
    }
    if (recordingMode === "pushToTalk" && pttActive) micUp();
    pttActive = false;
  });

  el.addEventListener("pointercancel", () => {
    clearPttTimer();
    if (dragging) {
      dragging = false;
      return;
    }
    if (recordingMode === "pushToTalk" && pttActive) micUp();
    pttActive = false;
  });

  el.addEventListener("click", (ev) => {
    if (dragging) {
      ev.preventDefault();
      dragging = false;
      return;
    }
    if (recordingMode === "toggle") {
      ev.preventDefault();
      micToggle();
    }
  });
}

bindMic(mic);
bindMic(logoWrap, { dragOrPtt: true });
