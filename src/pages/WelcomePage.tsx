import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import type { AppSettings, RecordingMode } from "@/types/settings";
import { getSettings, saveSettings } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LiveSpeakPreview } from "@/components/welcome/LiveSpeakPreview";
import { WindowControls } from "@/components/shell/WindowControls";
import { beginWindowDrag, ensureWelcomeWindowSize, toggleMaximize } from "@/features/ui/windowDrag";

type Step = "hero" | "setup";

export function WelcomePage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [mode, setMode] = useState<RecordingMode>("pushToTalk");
  const [step, setStep] = useState<Step>("hero");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureWelcomeWindowSize();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) {
          if (s.onboardingCompleted) {
            nav("/overview", { replace: true });
            return;
          }
          setSettings(s);
          setMode(s.recordingMode ?? "pushToTalk");
        }
      } catch {
        // still show welcome
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nav]);

  async function finish() {
    setBusy(true);
    try {
      if (settings) {
        await saveSettings({
          ...settings,
          onboardingCompleted: true,
          recordingMode: mode,
          privacyLocalOnly: true,
        });
      }
      nav("/overview", { replace: true });
    } catch {
      nav("/overview", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vv-welcome">
      <div className="vv-welcomeChrome">
        <div className="vv-welcomeLang">
          <LanguageSwitcher compact />
        </div>
        <div
          className="vv-titleDrag"
          data-tauri-drag-region
          onPointerDown={beginWindowDrag}
          onDoubleClick={toggleMaximize}
        />
        <div className="vv-welcomeWin">
          <WindowControls />
        </div>
      </div>

      <div className="vv-welcomeStage">
        <div className="vv-welcomeCopy">
          <img src={logoUrl} alt="" className="vv-welcomeLogo" />
          <h1 className="vv-welcomeBrand">
            {t("brand.voxiva")} <span>{t("brand.voice")}</span>
          </h1>

          {step === "hero" ? (
            <div className="vv-welcomeForm">
              <p className="vv-welcomeLead">{t("onboarding.heroBody")}</p>
              <Button className="vv-welcomeCta" onClick={() => setStep("setup")} disabled={busy}>
                {t("onboarding.ctaStart")}
              </Button>
            </div>
          ) : (
            <div className="vv-welcomeForm">
              <div className="vv-welcomeLayoutGrid">
                <button
                  type="button"
                  className={`vv-layoutCard${mode === "pushToTalk" ? " is-active" : ""}`}
                  onClick={() => setMode("pushToTalk")}
                >
                  <strong>{t("settings.recordingModePtt")}</strong>
                  <small>{t("onboarding.pttHint")}</small>
                </button>
                <button
                  type="button"
                  className={`vv-layoutCard${mode === "toggle" ? " is-active" : ""}`}
                  onClick={() => setMode("toggle")}
                >
                  <strong>{t("settings.recordingModeToggle")}</strong>
                  <small>{t("onboarding.toggleHint")}</small>
                </button>
              </div>
              <Button className="vv-welcomeCta" onClick={() => void finish()} disabled={busy}>
                {busy ? t("common.busy") : t("onboarding.ctaContinue")}
              </Button>
              <button type="button" className="vv-welcomeSkip" onClick={() => setStep("hero")} disabled={busy}>
                {t("onboarding.back")}
              </button>
            </div>
          )}
        </div>

        <div className="vv-welcomePreviewSlot">
          <LiveSpeakPreview />
        </div>
      </div>
    </div>
  );
}
