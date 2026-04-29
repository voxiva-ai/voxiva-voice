import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import logoUrl from "@/assets/brand/voxiva-mark.svg";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { AppSettings } from "@/types/settings";
import { getSettings, saveSettings } from "@/lib/commands";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

export function AuthWaitPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [progress, setProgress] = useState(18);

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return 92;
        const next = p + Math.max(0.35, (100 - p) * 0.035);
        return Math.min(92, next);
      });
    }, 220);
    return () => window.clearInterval(id);
  }, []);

  async function openBrowser() {
    // Placeholder until the real site is ready.
    // Keep it non-blocking; failures are fine.
    try {
      await openUrl("https://voxiva.ai");
    } catch {
      // ignore
    }
  }

  async function finish() {
    if (settings) {
      const next: AppSettings = { ...settings, onboardingCompleted: true };
      try {
        await saveSettings(next);
      } catch {
        // ignore
      }
    }
    nav("/overview", { replace: true });
  }

  return (
    <div className="vv-onboard" style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: "2.25rem 1.25rem" }}>
      <div className="vv-bubbles" aria-hidden />
      <div style={{ width: "min(820px, 100%)", display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
          <img
            src={logoUrl}
            alt={t("onboarding.title")}
            width={62}
            height={62}
            style={{ borderRadius: 18, filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.30))" }}
          />
          <div style={{ marginTop: "0.85rem", fontSize: "1.65rem", fontWeight: 900 }}>
            Voxiva <span style={{ color: "var(--vv-accent)" }}>Voice</span>
          </div>
        </div>

        <Card>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>{t("auth.waitTitle")}</div>
            <div style={{ color: "var(--vv-muted)", lineHeight: 1.55 }}>{t("auth.waitBody")}</div>

            <div
              aria-hidden
              style={{
                height: 4,
                borderRadius: 999,
                background: "color-mix(in srgb, var(--vv-text) 10%, transparent)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.round(progress)}%`,
                  background:
                    "linear-gradient(90deg, var(--vv-accent), color-mix(in srgb, var(--vv-warn) 82%, var(--vv-accent)))",
                  borderRadius: 999,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Button onClick={() => void finish()}>{t("auth.continue")}</Button>
              <Button variant="secondary" onClick={() => void openBrowser()}>
                {t("auth.openBrowser")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

