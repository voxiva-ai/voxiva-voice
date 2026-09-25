import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getSettings, getUsageStats } from "@/lib/commands";
import { formatDuration } from "@/lib/formatStats";
import type { AppSettings } from "@/types/settings";
import type { UsageStats } from "@/types/stats";
import { useI18n } from "@/i18n/I18nContext";

export function HomePage() {
  const { t, locale } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [s, st] = await Promise.all([getSettings(), getUsageStats()]);
        if (!cancelled) {
          setSettings(s);
          setStats(st);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function minimizeToHud() {
    try {
      await getCurrentWindow().minimize();
    } catch {
      // web
    }
  }

  const mode =
    settings?.recordingMode === "toggle" ? t("settings.recordingModeToggle") : t("settings.recordingModePtt");

  return (
    <div className="vv-page vv-pageCompact">
      <div className="vv-pageInner">
        <header className="vv-pageHeader">
          <h2 className="vv-pageTitle">{t("overview.heroTitle")}</h2>
          <p className="vv-pageSubtitle">{t("overview.heroBody")}</p>
          <button type="button" className="vv-overviewHudBtn" onClick={() => void minimizeToHud()}>
            {t("overview.minimizeHud")}
          </button>
        </header>

        <div className="vv-overviewCards">
          <article className="vv-overviewCard">
            <span className="vv-overviewLabel">{t("overview.cardHotkey")}</span>
            <strong className="vv-overviewValue vv-mono">{settings?.pushToTalkHotkey ?? "ctrl+shift+space"}</strong>
          </article>
          <article className="vv-overviewCard">
            <span className="vv-overviewLabel">{t("overview.cardMode")}</span>
            <strong className="vv-overviewValue">{mode}</strong>
          </article>
          <article className="vv-overviewCard">
            <span className="vv-overviewLabel">{t("stats.words")}</span>
            <strong className="vv-overviewValue">{stats?.totalWords ?? 0}</strong>
          </article>
          <article className="vv-overviewCard">
            <span className="vv-overviewLabel">{t("stats.sessions")}</span>
            <strong className="vv-overviewValue">{stats?.dictationCount ?? 0}</strong>
          </article>
          <article className="vv-overviewCard is-wide">
            <span className="vv-overviewLabel">{t("stats.dictationTime")}</span>
            <strong className="vv-overviewValue">{formatDuration(stats?.totalDictationSeconds ?? 0, locale)}</strong>
          </article>
        </div>
      </div>
    </div>
  );
}
