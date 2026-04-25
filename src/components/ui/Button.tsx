import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
>;

export function Button({ variant = "primary", style, ...rest }: Props) {
  const base: CSSProperties = {
    borderRadius: "var(--vv-radius-sm)",
    padding: "0.55rem 1rem",
    fontWeight: 600,
    cursor: rest.disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
    opacity: rest.disabled ? 0.55 : 1,
  };

  const themed: CSSProperties =
    variant === "primary"
      ? {
          background: "var(--vv-accent)",
          color: "#0a0e16",
          borderColor: "rgba(255,255,255,0.12)",
        }
      : {
          background: "transparent",
          color: "var(--vv-text)",
          borderColor: "var(--vv-border)",
        };

  return <button type="button" style={{ ...base, ...themed, ...style }} {...rest} />;
}
