/**
 * Placeholder HUD inspired by compact dictation indicators (logo + level bars).
 * Wire-up to real audio levels when capture + STT land in the Rust core.
 */
export function ListeningPill({ active = false }: { active?: boolean }) {
  const heights = [6, 12, 18, 10, 22, 14, 20, 9, 16, 11];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid var(--vv-border)",
        background: "linear-gradient(90deg, rgba(18,24,38,0.95), rgba(12,16,26,0.92))",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        opacity: active ? 1 : 0.55,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 28,
          height: 28,
          clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
          background: "linear-gradient(90deg, #f0c14b, #5b8cff)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 6,
            background: "#0a0e16",
            clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 22 }}>
        {heights.map((h, i) => (
          <span
            key={`vv-bar-${i}`}
            style={{
              width: 3,
              height: active ? h : 4,
              borderRadius: 2,
              background: "var(--vv-accent)",
              opacity: 0.85,
              transition: "height 0.2s ease",
              animation: active ? `vv-pulse 0.9s ease-in-out ${i * 0.06}s infinite` : undefined,
            }}
          />
        ))}
      </div>
      <style>
        {`
          @keyframes vv-pulse {
            0% { transform: translateY(0); opacity: 0.55; }
            50% { transform: translateY(-2px); opacity: 1; }
            100% { transform: translateY(0); opacity: 0.55; }
          }
        `}
      </style>
    </div>
  );
}
