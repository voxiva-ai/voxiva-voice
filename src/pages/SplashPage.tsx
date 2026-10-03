import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import { getSettings, saveSettings } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import { ensureAppWindowSize } from "@/features/ui/windowDrag";

function Letters({ text, className, delayMs = 0 }: { text: string; className?: string; delayMs?: number }) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="vv-splashLetter"
          style={{ animationDelay: `${delayMs + i * 38}ms` }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

type Phase = "anim" | "ready" | "out";

/**
 * Welcome gate (no app chrome): brand animation, then Start → Overview.
 * Returning users get a short auto splash.
 */
export function SplashPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("anim");
  const [needsStart, setNeedsStart] = useState(true);
  const [booted, setBooted] = useState(false);

  const line1 = useMemo(() => t("splash.line1"), [t]);
  const line2 = useMemo(() => t("splash.line2"), [t]);

  useEffect(() => {
    void ensureAppWindowSize();
    let cancelled = false;

    void (async () => {
      let firstRun = true;
      try {
        const s = await getSettings();
        firstRun = !s.onboardingCompleted;
        if (!cancelled) setNeedsStart(firstRun);
      } catch {
        firstRun = true;
        if (!cancelled) setNeedsStart(true);
      }
      if (!cancelled) setBooted(true);

      const animMs = firstRun ? 2200 : 1600;
      window.setTimeout(() => {
        if (cancelled) return;
        if (firstRun) setPhase("ready");
        else {
          setPhase("out");
          window.setTimeout(() => {
            if (!cancelled) nav("/overview", { replace: true });
          }, 380);
        }
      }, animMs);
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  async function onStart() {
    try {
      const s = await getSettings();
      await saveSettings({ ...s, onboardingCompleted: true, privacyLocalOnly: true });
    } catch {
      /* continue */
    }
    setPhase("out");
    window.setTimeout(() => nav("/overview", { replace: true }), 380);
  }

  return (
    <div className={`vv-splash vv-welcome${phase === "out" ? " is-out" : ""}${phase === "ready" ? " is-ready" : ""}`}>
      <img src={logoUrl} alt="" className="vv-splashLogo" />
      <h1 className="vv-splashBrand">
        <Letters text={t("brand.voxiva")} delayMs={180} />{" "}
        <Letters text={t("brand.voice")} className="is-accent" delayMs={420} />
      </h1>
      <p className="vv-splashTag">
        <span className="vv-splashTagLine is-a">{line1}</span>
        <span className="vv-splashTagLine is-b">{line2}</span>
      </p>

      {booted && needsStart && phase === "ready" ? (
        <div className="vv-welcomeGate">
          <p className="vv-welcomeHint">{t("welcome.hint")}</p>
          <button type="button" className="vv-welcomeStart" onClick={() => void onStart()}>
            {t("onboarding.ctaStart")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
