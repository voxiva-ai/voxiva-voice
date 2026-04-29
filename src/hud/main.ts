import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import logoUrl from "@/assets/brand/voxiva-mark.svg";

const ru = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ru");

const copy = {
  micPtt: ru ? "Удерживай" : "Hold",
  micToggle: ru ? "Нажми" : "Click",
  recording: ru ? "Говори" : "Speak",
  typing: ru ? "Печатаю" : "Typing",
};

type HudPayload = { phase: string; level?: number };
type Settings = { recordingMode: "pushToTalk" | "toggle"; hudMode?: "full" | "iconOnly" };

document.body.style.cssText =
  "margin:0;background:#080b12;color:#e8ecf4;font-family:system-ui,sans-serif;user-select:none;overflow:hidden;width:100vw;height:100vh;display:flex;align-items:stretch;justify-content:stretch;";
document.documentElement.style.cssText = "background:#080b12;width:100vw;height:100vh;overflow:hidden;";

const pill = document.createElement("div");
pill.setAttribute("data-tauri-drag-region", "");
pill.style.cssText =
  [
    "-webkit-app-region:drag",
    "display:flex",
    "align-items:center",
    "gap:7px",
    "margin:0",
    "padding:5px 8px",
    "border-radius:12px",
    "border:1px solid rgba(122,139,185,0.22)",
    "background:linear-gradient(180deg,rgba(15,19,31,1),rgba(8,10,16,1))",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 10px 26px rgba(0,0,0,0.34)",
    "width:100%",
    "height:100%",
    "box-sizing:border-box",
    "overflow:hidden",
  ].join(";");

const logo = document.createElement("img");
logo.src = logoUrl;
logo.alt = "Voxiva";
logo.style.cssText =
  "width:24px;height:24px;flex:0 0 auto;filter:drop-shadow(0 5px 10px rgba(0,0,0,0.38));";

const center = document.createElement("div");
center.setAttribute("data-tauri-drag-region", "");
center.style.cssText =
  "display:flex;flex-direction:column;min-width:0;flex:1;gap:6px;justify-content:center;padding:0 2px;";

const status = document.createElement("div");
status.id = "vv-hud-status";
status.style.cssText =
  "display:none;";
status.textContent = "";

const meter = document.createElement("div");
meter.style.cssText =
  "display:flex;align-items:center;justify-content:center;gap:3px;height:18px;opacity:0.96;flex:1;min-width:0;";
const bars = Array.from({ length: 10 }).map(() => {
  const b = document.createElement("div");
  b.style.cssText =
    "width:5px;height:4px;border-radius:99px;background:rgba(98,128,220,0.42);transition:height 90ms linear, background 140ms ease, opacity 140ms ease, transform 120ms ease;";
  meter.appendChild(b);
  return b;
});

center.appendChild(status);
center.appendChild(meter);

const mic = document.createElement("button");
mic.type = "button";
mic.style.cssText =
  [
    "-webkit-app-region:no-drag",
    "width:26px",
    "height:26px",
    "border-radius:10px",
    "border:1px solid rgba(126,149,215,0.32)",
    "background:linear-gradient(180deg,rgba(51,69,118,0.86),rgba(30,41,78,0.94))",
    "color:#e8ecf4",
    "cursor:pointer",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "padding:0",
    "flex:0 0 auto",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,0.12)",
    "transition:transform 0.12s ease,background 0.15s ease,box-shadow 0.15s ease",
  ].join(";");
mic.setAttribute("aria-label", "microphone");
mic.innerHTML =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/></svg>';

pill.appendChild(logo);
pill.appendChild(center);
pill.appendChild(mic);
document.body.appendChild(pill);

let recordingMode: Settings["recordingMode"] = "pushToTalk";
let hudMode: NonNullable<Settings["hudMode"]> = "full";
let targetLevel = 0;
let displayLevel = 0;
let phase: "idle" | "recording" | "transcribing" | "error" = "idle";

function renderBars(level: number) {
  const l = Math.max(0, Math.min(1, level));
  const n = bars.length;
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const dist = Math.abs(i - mid) / mid;
    const centerBias = 1 - dist;
    const idlePulse = phase === "idle" ? 0.1 + centerBias * 0.15 : 0;
    const v = Math.max(0, Math.min(1, l * (0.35 + centerBias * 0.9) + idlePulse));
    const h = Math.round(3 + 14 * v);
    bars[i].style.height = `${h}px`;
    const active = phase === "recording";
    bars[i].style.background = active ? "rgba(245,199,74,0.9)" : "rgba(98,128,220,0.45)";
    bars[i].style.opacity = phase === "transcribing" ? "0.38" : active ? "1" : "0.72";
    bars[i].style.transform = `scaleY(${active ? 1 : 0.92})`;
  }
}

function setPhase(next: "idle" | "recording" | "transcribing" | "error") {
  phase = next;
  const rec = next === "recording";
  const typing = next === "transcribing";
  const err = next === "error";
  // keep HUD minimal: no text, only colors + meter
  mic.style.transform = rec ? "scale(1.05)" : typing ? "scale(0.98)" : "scale(1)";
  mic.style.boxShadow = rec
    ? "0 0 0 2px rgba(245,199,74,0.18),inset 0 1px 0 rgba(255,255,255,0.16)"
    : "inset 0 1px 0 rgba(255,255,255,0.12)";
  mic.style.background = rec
    ? "linear-gradient(180deg,rgba(218,171,57,0.95),rgba(134,92,22,0.98))"
    : typing
      ? "linear-gradient(180deg,rgba(70,90,120,0.40),rgba(35,45,70,0.70))"
      : err
        ? "linear-gradient(180deg,rgba(200,70,70,0.55),rgba(110,30,30,0.85))"
      : "linear-gradient(180deg,rgba(51,69,118,0.86),rgba(30,41,78,0.94))";
  renderBars(displayLevel);
}

void listen<HudPayload>("vv:hud", (e) => {
  if (typeof e.payload.level === "number") {
    targetLevel = e.payload.level;
  }
  if (e.payload.phase === "recording") setPhase("recording");
  if (e.payload.phase === "transcribing") setPhase("transcribing");
  if (e.payload.phase === "error") setPhase("error");
  if (e.payload.phase === "idle") setPhase("idle");
});

function applyHudSettings(s: Settings) {
  recordingMode = s.recordingMode ?? "pushToTalk";
  hudMode = s.hudMode ?? "full";
  mic.title = recordingMode === "toggle" ? copy.micToggle : copy.micPtt;
  meter.style.display = hudMode === "iconOnly" ? "none" : "flex";
  center.style.display = hudMode === "iconOnly" ? "none" : "flex";
  pill.style.justifyContent = hudMode === "iconOnly" ? "center" : "stretch";
  pill.style.gap = hudMode === "iconOnly" ? "0" : "7px";
}

void listen<Settings>("vv:hud-settings", (e) => {
  applyHudSettings(e.payload);
});

function tick() {
  // Smooth level animation + quick decay.
  // Use a lightweight timer instead of rAF to avoid burning cycles while the HUD is idle.
  const decay = phase === "recording" ? 0.92 : 0.86;
  targetLevel *= decay;
  displayLevel = displayLevel * 0.75 + targetLevel * 0.25;
  renderBars(displayLevel);
  window.setTimeout(tick, phase === "recording" ? 33 : 66);
}
tick();

void (async () => {
  try {
    const s = await invoke<Settings>("get_settings");
    applyHudSettings(s);
  } catch {
    mic.title = copy.micPtt;
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

mic.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  mic.setPointerCapture(ev.pointerId);
  if (recordingMode === "pushToTalk") micDown();
});

mic.addEventListener("pointerup", (ev) => {
  ev.preventDefault();
  try {
    mic.releasePointerCapture(ev.pointerId);
  } catch {
    /* ignore */
  }
  if (recordingMode === "pushToTalk") micUp();
});

// Fallback for environments where pointer events are flaky.
mic.addEventListener("mousedown", (ev) => {
  ev.preventDefault();
  if (recordingMode === "pushToTalk") micDown();
});

mic.addEventListener("mouseup", (ev) => {
  ev.preventDefault();
  if (recordingMode === "pushToTalk") micUp();
});

mic.addEventListener("pointercancel", () => {
  if (recordingMode === "pushToTalk") micUp();
});

mic.addEventListener("click", (ev) => {
  if (recordingMode === "toggle") {
    ev.preventDefault();
    micToggle();
  }
});
