import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getSettings, getUsageStats } from "@/lib/commands";
import { formatDuration } from "@/lib/formatStats";
import type { AppSettings } from "@/types/settings";
import type { UsageStats } from "@/types/stats";
import { useI18n } from "@/i18n/I18nContext";
import { CountUp } from "@/components/ui/CountUp";
import {
  IconChart,
  IconClock,
  IconCommand,
  IconMic,
  IconMinimize,
  IconRecording,
} from "@/components/icons";

async function showHud() {
  try {
    const hud = await WebviewWindow.getByLabel("hud");
    if (!hud) return;
    await hud.show();
    await hud.setAlwaysOnTop(true);
  } catch {
    /* web */
  }
}

export function HomePage() {
  const { t, locale } = useI18n();
  const nav = useNavigate();
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
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function minimizeToHud() {
    try {
      await getCurrentWindow().minimize();
      await showHud();
    } catch {
      /* web */
    }
  }

  const mode =
    settings?.recordingMode === "toggle" ? t("settings.recordingModeToggle") : t("settings.recordingModePtt");
  const hotkey = settings?.pushToTalkHotkey ?? "ctrl+shift+space";
  const words = stats?.totalWords ?? 0;
  const sessions = stats?.dictationCount ?? 0;
  const speakSec = stats?.totalDictationSeconds ?? 0;

  return (
    <div className="vv-page vv-pageCompact">
      <div className="vv-pageInner vv-home">
        <header className="vv-homeHero">
          <h2 className="vv-homeTitle">
            <span className="vv-homeTitleMuted">{t("splash.line1")}</span>
            <span className="vv-homeTitleAccent">{t("splash.line2")}</span>
          </h2>

          <button
            type="button"
            className="vv-homePrimary"
            onClick={() => void minimizeToHud()}
            title={t("overview.minimizeHud")}
            aria-label={t("overview.minimizeHud")}
          >
            <span className="vv-homePrimaryIcon" aria-hidden>
              <IconMinimize size={18} />
            </span>
            <span className="vv-homePrimaryText">
              <strong>{t("overview.minimizeHud")}</strong>
            </span>
            <span className="vv-homePrimaryMic" aria-hidden>
              <IconMic size={16} />
            </span>
          </button>
        </header>

        <section className="vv-homeSetup" aria-label={t("overview.setupTitle")}>
          <button
            type="button"
            className="vv-homeChip"
            onClick={() => nav("/settings?section=input")}
            title={t("overview.cardHotkey")}
          >
            <IconCommand size={15} />
            <span>
              <small>{t("overview.cardHotkey")}</small>
              <strong className="vv-mono">{hotkey}</strong>
            </span>
          </button>
          <button
            type="button"
            className="vv-homeChip"
            onClick={() => nav("/settings?section=input")}
            title={t("overview.cardMode")}
          >
            <IconRecording size={15} />
            <span>
              <small>{t("overview.cardMode")}</small>
              <strong>{mode}</strong>
            </span>
          </button>
        </section>

        <section className="vv-homeStats" aria-label={t("overview.statsTitle")}>
          <article className="vv-statCard is-hero">
            <span className="vv-statIcon" aria-hidden>
              <IconChart size={16} />
            </span>
            <span className="vv-statLabel">{t("stats.words")}</span>
            <strong className="vv-statValue">
              <CountUp value={words} />
            </strong>
          </article>
          <article className="vv-statCard">
            <span className="vv-statIcon" aria-hidden>
              <IconRecording size={16} />
            </span>
            <span className="vv-statLabel">{t("stats.sessions")}</span>
            <strong className="vv-statValue">
              <CountUp value={sessions} durationMs={700} />
            </strong>
          </article>
          <article className="vv-statCard">
            <span className="vv-statIcon" aria-hidden>
              <IconClock size={16} />
            </span>
            <span className="vv-statLabel">{t("stats.dictationTime")}</span>
            <strong className="vv-statValue vv-statValueSm">
              {formatDuration(speakSec, locale)}
            </strong>
          </article>
        </section>
      </div>
    </div>
  );
}
