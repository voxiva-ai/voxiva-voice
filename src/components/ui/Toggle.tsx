import type { InputHTMLAttributes } from "react";

export function Toggle({
  label,
  description,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return (
    <label className="vv-toggle">
      <div style={{ minWidth: 0 }}>
        <div className="vv-toggleLabel">{label}</div>
        {description && <div className="vv-toggleDesc">{description}</div>}
      </div>
      <input className="vv-toggleInput" type="checkbox" {...rest} />
      <span className="vv-toggleTrack" aria-hidden />
    </label>
  );
}

