import { Card } from "@/components/ui/Card";
import logoUrl from "@/assets/brand/voxiva-mark.svg";
import lockupUrl from "@/assets/brand/voxiva-voice-lockup-horizontal.svg";

export function HomePage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <section className="vv-hero">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.15rem", alignItems: "center" }}>
          <img className="vv-heroMark" src={logoUrl} alt="Voxiva Voice" width={72} height={72} />
          <div style={{ flex: "1 1 360px", minWidth: 280 }}>
            <img
              src={lockupUrl}
              alt="Voxiva Voice"
              height={34}
              style={{ display: "block", opacity: 0.92, marginBottom: "0.35rem" }}
            />
            <h1 className="vv-glassTitle">Stop typing. Just speak.</h1>
            <p className="vv-heroTagline">
              Put the cursor in any app. Press your hotkey and speak — Voxiva Voice will type it for you.
            </p>
          </div>
        </div>
      </section>

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
