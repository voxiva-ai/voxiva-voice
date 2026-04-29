import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        background: "var(--vv-elevated)",
        border: "1px solid var(--vv-border)",
        borderRadius: "var(--vv-radius-lg)",
        boxShadow: "var(--vv-shadow)",
        padding: "1.1rem 1.2rem",
      }}
    >
      {children}
    </div>
  );
}
