import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }
>;

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  const variantClass =
    variant === "primary" ? " vv-btnPrimary" : variant === "ghost" ? " vv-btnGhost" : "";
  return <button type="button" className={`vv-btn${variantClass} ${className}`.trim()} {...rest} />;
}
