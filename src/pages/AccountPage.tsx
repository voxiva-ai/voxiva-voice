import { Card } from "@/components/ui/Card";
import { useAppMetadata } from "@/hooks/useAppMetadata";

export function AccountPage() {
  const { meta } = useAppMetadata();
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <Card>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem" }}>Account</h1>
        <p style={{ margin: "0 0 0.85rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>
          Voxiva Voice works without an account. No subscriptions.
        </p>
        <div style={{ color: "var(--vv-muted)", fontSize: "0.9rem" }}>
          {meta ? `${meta.name} v${meta.version}` : "App info loading…"}
        </div>
      </Card>
    </div>
  );
}

