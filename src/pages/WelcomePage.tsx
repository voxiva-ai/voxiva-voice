import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import logoUrl from "@/assets/brand/voxiva-mark.svg";
import type { AppSettings } from "@/types/settings";
import { getSettings, saveSettings } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import { openUrl } from "@tauri-apps/plugin-opener";

export function WelcomePage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) setSettings(s);
      } catch {
        // ignore: still show welcome
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nav]);

  async function onContinueOffline() {
    if (!settings) {
      nav("/overview", { replace: true });
      return;
    }
    const next: AppSettings = { ...settings, onboardingCompleted: true };
    try {
      await saveSettings(next);
    } finally {
      nav("/overview", { replace: true });
    }
  }

  async function onStart() {
    setBusy(true);
    try {
      await openUrl("https://voxiva.ai");
    } catch {
      // ignore
    } finally {
      setBusy(false);
      nav("/auth/wait");
    }
  }

  return (
    <div
      className="vv-onboard"
      style={{
        minHeight: "100%",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1.25rem",
        overflow: "hidden",
      }}
    >
      <div className="vv-bubbles" aria-hidden />
      <div className="vv-welcomePanel">
        <div className="vv-welcomeBrand">
          <img src={logoUrl} alt={t("onboarding.title")} className="vv-welcomeLogo" />
          <div className="vv-brandTitle">
            Voxiva <span>Voice</span>
          </div>
        </div>

        <div className="vv-welcomeLine" aria-hidden />

        <div className="vv-welcomeHeadline">{t("onboarding.subtitle")}</div>
        <div className="vv-welcomeCopy">{t("overview.heroBody")}</div>

        <div style={{ marginTop: "2rem", display: "grid", gap: "0.75rem", justifyItems: "center" }}>
          <Button onClick={() => void onStart()} disabled={busy} style={{ width: 320, maxWidth: "100%" }}>
            {busy ? "…" : t("onboarding.ctaStart")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void onContinueOffline()}
            disabled={busy}
            style={{ width: 320, maxWidth: "100%" }}
          >
            {t("onboarding.ctaOffline")}
          </Button>
        </div>

        <div className="vv-welcomeNote">{t("onboarding.note")}</div>
        <div className="vv-welcomeBadge">
          <span />
          VOXIVA ECOSYSTEM
        </div>
      </div>
    </div>
  );
}

