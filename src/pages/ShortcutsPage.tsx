import { Card } from "@/components/ui/Card";

export function ShortcutsPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <Card>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem" }}>Shortcuts</h1>
        <p style={{ margin: 0, color: "var(--vv-muted)", lineHeight: 1.5 }}>
          Configure your global hotkey in Settings. More shortcuts coming soon.
        </p>
      </Card>
    </div>
  );
}

