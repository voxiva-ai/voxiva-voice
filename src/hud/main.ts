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
type Settings = { recordingMode: "pushToTalk" | "toggle" };

document.body.style.cssText =
  "margin:0;background:transparent;color:#e8ecf4;font-family:system-ui,sans-serif;user-select:none;overflow:hidden;width:100vw;height:100vh;display:flex;align-items:stretch;justify-content:stretch;";
document.documentElement.style.cssText = "background:transparent;width:100vw;height:100vh;overflow:hidden;";

const pill = document.createElement("div");
pill.setAttribute("data-tauri-drag-region", "");
pill.style.cssText =
  [
    "-webkit-app-region:drag",
    "display:flex",
    "align-items:center",
    "gap:10px",
    "margin:0",
    "padding:6px 8px",
    "border-radius:999px",
    "border:1px solid rgba(255,255,255,0.14)",
    "background:linear-gradient(135deg,rgba(18,22,34,0.98),rgba(10,12,18,0.98))",
    "width:100%",
    "height:100%",
    "box-sizing:border-box",
    "overflow:hidden",
  ].join(";");

const logo = document.createElement("img");
logo.src = logoUrl;
logo.alt = "Voxiva";
logo.style.cssText =
  "width:28px;height:28px;flex:0 0 auto;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));";

const center = document.createElement("div");
center.setAttribute("data-tauri-drag-region", "");
center.style.cssText = "display:flex;flex-direction:column;min-width:0;flex:1;gap:6px;";

const status = document.createElement("div");
status.id = "vv-hud-status";
status.style.cssText =
  "display:none;";
status.textContent = "";

const meter = document.createElement("div");
meter.style.cssText =
  "display:flex;align-items:center;gap:3px;height:16px;opacity:0.95;flex:1;min-width:0;";
const bars = Array.from({ length: 10 }).map(() => {
  const b = document.createElement("div");
  b.style.cssText =
    "width:6px;height:3px;border-radius:99px;background:rgba(91,140,255,0.32);transition:height 90ms linear, background 140ms ease, opacity 140ms ease;";
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
    "width:30px",
    "height:30px",
    "border-radius:50%",
    "border:1px solid rgba(255,255,255,0.18)",
    "background:linear-gradient(180deg,rgba(60,90,160,0.55),rgba(35,50,90,0.75))",
    "color:#e8ecf4",
    "cursor:pointer",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "padding:0",
    "flex:0 0 auto",
    "transition:transform 0.12s ease,background 0.15s ease,box-shadow 0.15s ease",
  ].join(";");
mic.setAttribute("aria-label", "microphone");
mic.innerHTML =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/></svg>';

pill.appendChild(logo);
pill.appendChild(center);
pill.appendChild(mic);
document.body.appendChild(pill);

let recordingMode: Settings["recordingMode"] = "pushToTalk";
let targetLevel = 0;
let displayLevel = 0;
let phase: "idle" | "recording" | "transcribing" = "idle";

function renderBars(level: number) {
  const l = Math.max(0, Math.min(1, level));
  for (let i = 0; i < bars.length; i++) {
    const x = i / (bars.length - 1);
    const base = 0.12 + x * 0.88;
    const v = Math.max(0, l - x * 0.08) / base;
    const h = Math.round(3 + 13 * Math.max(0, Math.min(1, v)));
    bars[i].style.height = `${h}px`;
    const active = phase === "recording";
    bars[i].style.background = active ? "rgba(240,193,75,0.88)" : "rgba(91,140,255,0.32)";
    bars[i].style.opacity = phase === "transcribing" ? "0.35" : "1";
  }
}

function setPhase(next: "idle" | "recording" | "transcribing") {
  phase = next;
  const rec = next === "recording";
  const typing = next === "transcribing";
  // keep HUD minimal: no text, only colors + meter
  mic.style.transform = rec ? "scale(1.05)" : typing ? "scale(0.98)" : "scale(1)";
  mic.style.background = rec
    ? "linear-gradient(180deg,rgba(200,150,60,0.70),rgba(120,85,30,0.90))"
    : typing
      ? "linear-gradient(180deg,rgba(70,90,120,0.40),rgba(35,45,70,0.70))"
      : "linear-gradient(180deg,rgba(60,90,160,0.55),rgba(35,50,90,0.75))";
  renderBars(displayLevel);
}

void listen<HudPayload>("vv:hud", (e) => {
  if (typeof e.payload.level === "number") {
    targetLevel = e.payload.level;
  }
  if (e.payload.phase === "recording") setPhase("recording");
  if (e.payload.phase === "transcribing") setPhase("transcribing");
  if (e.payload.phase === "idle") setPhase("idle");
});

function tick() {
  // smooth level animation + quick decay
  const decay = phase === "recording" ? 0.92 : 0.86;
  targetLevel *= decay;
  displayLevel = displayLevel * 0.75 + targetLevel * 0.25;
  renderBars(displayLevel);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

void (async () => {
  try {
    const s = await invoke<Settings>("get_settings");
    recordingMode = s.recordingMode ?? "pushToTalk";
    mic.title = recordingMode === "toggle" ? copy.micToggle : copy.micPtt;
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
