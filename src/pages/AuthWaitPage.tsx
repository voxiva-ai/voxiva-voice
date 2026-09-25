import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { AppSettings } from "@/types/settings";
import { getSettings, saveSettings } from "@/lib/commands";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

export function AuthWaitPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) setSettings(s);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openBrowser() {
    try {
      await openUrl("https://voxiva.ai/login");
    } catch {
      try {
        await openUrl("https://voxiva.ai");
      } catch {
        // ignore
      }
    }
  }

  async function finish() {
    if (!settings) {
      nav("/overview", { replace: true });
      return;
    }
    try {
      await saveSettings({ ...settings, onboardingCompleted: true });
    } catch {
      // ignore
    }
    nav("/overview", { replace: true });
  }

  return (
    <div className="vv-welcome">
      <div className="vv-welcomeStage" style={{ gridTemplateColumns: "1fr", maxWidth: 520 }}>
        <div className="vv-welcomeCopy" style={{ width: "100%" }}>
          <img src={logoUrl} alt="" className="vv-welcomeLogo" />
          <h1 className="vv-welcomeBrand">
            Voxiva <span>Voice</span>
          </h1>
          <p className="vv-welcomeLead">{t("auth.waitTitle")}</p>
          <p className="vv-welcomeNote" style={{ fontSize: "0.95rem", maxWidth: "30rem" }}>
            {t("auth.waitBody")}
          </p>
          <div className="vv-welcomeForm">
            <Button className="vv-welcomeCta" onClick={() => void finish()}>
              {t("auth.continue")}
            </Button>
            <Button variant="ghost" onClick={() => void openBrowser()}>
              {t("auth.openBrowser")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
