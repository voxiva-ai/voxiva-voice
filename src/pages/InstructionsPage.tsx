import { Card } from "@/components/ui/Card";

export function InstructionsPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <Card>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem" }}>Instructions</h1>
        <ul style={{ margin: 0, paddingLeft: "1.15rem", color: "var(--vv-muted)", lineHeight: 1.6 }}>
          <li>Open Settings and choose a hotkey.</li>
          <li>Minimize the app — the HUD stays on screen.</li>
          <li>Click into any text field (caret must blink).</li>
          <li>Hold (or toggle) your hotkey and speak.</li>
          <li>If paste does not work in an app, change “Paste” in Settings.</li>
        </ul>
      </Card>
    </div>
  );
}

