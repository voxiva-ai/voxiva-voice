import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import { getSettings, saveSettings } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import { ensureWelcomeWindowSize } from "@/features/ui/windowDrag";

/** Brief logo + name splash, then overview. No onboarding form. */
export function SplashPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    void ensureWelcomeWindowSize();
    let cancelled = false;

    void (async () => {
      try {
        const s = await getSettings();
        if (!s.onboardingCompleted) {
          await saveSettings({ ...s, onboardingCompleted: true, privacyLocalOnly: true });
        }
      } catch {
        // continue to app anyway
      }

      window.setTimeout(() => {
        if (!cancelled) setPhase("out");
      }, 1400);
      window.setTimeout(() => {
        if (!cancelled) nav("/overview", { replace: true });
      }, 1750);
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  return (
    <div className={`vv-splash${phase === "out" ? " is-out" : ""}`}>
      <img src={logoUrl} alt="" className="vv-splashLogo" />
      <h1 className="vv-splashBrand">
        {t("brand.voxiva")} <span>{t("brand.voice")}</span>
      </h1>
    </div>
  );
}
