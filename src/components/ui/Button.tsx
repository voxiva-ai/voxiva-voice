import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }
>;

export function Button({ variant = "primary", style, ...rest }: Props) {
  const base: CSSProperties = {
    borderRadius: 12,
    padding: "0.68rem 1.05rem",
    fontWeight: 750,
    cursor: rest.disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition:
      "background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease",
    opacity: rest.disabled ? 0.55 : 1,
    boxShadow: "none",
  };

  const themed: CSSProperties = (() => {
    if (variant === "primary") {
      return {
        background: "linear-gradient(90deg, var(--vv-accent), color-mix(in srgb, var(--vv-accent) 70%, var(--vv-warn)))",
        color: "#070a10",
        borderColor: "color-mix(in srgb, var(--vv-accent) 35%, transparent)",
        boxShadow: "0 18px 40px color-mix(in srgb, var(--vv-accent) 18%, transparent)",
      };
    }
    if (variant === "secondary") {
      return {
        background: "color-mix(in srgb, var(--vv-elevated) 72%, transparent)",
        color: "var(--vv-text)",
        borderColor: "var(--vv-border)",
      };
    }
    return {
      background: "transparent",
      color: "var(--vv-text)",
      borderColor: "color-mix(in srgb, var(--vv-text) 14%, transparent)",
    };
  })();

  return <button type="button" style={{ ...base, ...themed, ...style }} {...rest} />;
}
