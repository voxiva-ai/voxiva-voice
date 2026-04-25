import { Card } from "@/components/ui/Card";

export function HomePage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.85rem", letterSpacing: "-0.03em" }}>
            Speak. We type.
          </h1>
          <p style={{ margin: 0, color: "var(--vv-muted)", lineHeight: 1.55 }}>
            Put the cursor in any app (Notepad, VS Code, browser). Press your hotkey and speak — Voxiva Voice
            will insert the text into the active window.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
        <Card>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>How to use</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>
            <li>Open Settings and choose a hotkey.</li>
            <li>Choose Push-to-talk (hold) or Toggle (press to start/stop).</li>
            <li>Place the cursor where you want text and speak.</li>
          </ul>
        </Card>
        <Card>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>Tips</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>
            <li>Speak clearly and keep the microphone close.</li>
            <li>Use the Dictionary in Settings to fix frequent words.</li>
            <li>English and Russian are supported.</li>
          </ul>
        </Card>
      </div>

    </div>
  );
}
