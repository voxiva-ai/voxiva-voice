import { Card } from "@/components/ui/Card";
import logoUrl from "@/assets/brand/voxiva-mark.svg";

export function HomePage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.1rem",
          alignItems: "center",
          padding: "1.1rem 1.15rem",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "radial-gradient(1200px 380px at 30% 0%, rgba(91,140,255,0.16), transparent), linear-gradient(135deg, rgba(18,22,34,0.92), rgba(10,12,18,0.92))",
          boxShadow: "0 22px 50px rgba(0,0,0,0.35)",
        }}
      >
        <img
          src={logoUrl}
          alt="Voxiva Voice"
          width={62}
          height={62}
          style={{
            borderRadius: 18,
            flex: "0 0 auto",
            filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.35))",
          }}
        />
        <div style={{ flex: "1 1 340px", minWidth: 260 }}>
          <h1 style={{ margin: "0 0 0.35rem", fontSize: "2.05rem", letterSpacing: "-0.04em" }}>
            Stop typing. Just speak.
          </h1>
          <p style={{ margin: 0, color: "var(--vv-muted)", lineHeight: 1.55 }}>
            Put the cursor in any app. Press your hotkey and speak — Voxiva Voice will type it for you.
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
