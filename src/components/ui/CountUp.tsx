import { useEffect, useState } from "react";

type CountUpProps = {
  value: number;
  durationMs?: number;
  className?: string;
};

/** Simple ease-out count-up for overview stats. */
export function CountUp({ value, durationMs = 900, className }: CountUpProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Math.round(value));
    if (target === 0) {
      setDisplay(0);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return (
    <span className={className} aria-label={String(Math.max(0, Math.round(value)))}>
      {display.toLocaleString()}
    </span>
  );
}
