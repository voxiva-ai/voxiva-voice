import type { PropsWithChildren, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check } from "@untitledui/icons";
import { Button } from "@/components/ui/Button";
import {
  downloadWhisperAssets,
  getSettings,
  getUsageStats,
  getWhisperAssetsStatus,
  saveSettings,
  checkForUpdates,
  openExternalUrl,
} from "@/lib/commands";
import { formatDuration, formatStatDate } from "@/lib/formatStats";
import type { UpdateCheckResult } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import { useAppMetadata } from "@/hooks/useAppMetadata";
import type { AppSettings, DictationLanguage, DictEntry, HudMode, PasteMethod, RecordingMode, UiTheme } from "@/types/settings";
import type { UsageStats } from "@/types/stats";
import { applyTheme } from "@/theme/applyTheme";
import { Toggle } from "@/components/ui/Toggle";
import {
  IconAppearance,
  IconHelp,
  IconHistory,
  IconInfo,
  IconKeyboard,
  IconMic,
  IconSliders,
} from "@/components/icons";

const NAV = [
  { id: "look" as const, labelKey: "settings.section.look" as const, Icon: IconAppearance },
  { id: "voice" as const, labelKey: "settings.section.voice" as const, Icon: IconMic },
  { id: "input" as const, labelKey: "settings.section.input" as const, Icon: IconKeyboard },
  { id: "help" as const, labelKey: "settings.section.help" as const, Icon: IconHelp },
  { id: "history" as const, labelKey: "settings.section.history" as const, Icon: IconHistory },
  { id: "about" as const, labelKey: "settings.section.about" as const, Icon: IconInfo },
  { id: "advanced" as const, labelKey: "settings.section.advanced" as const, Icon: IconSliders },
];

type SettingsSection = (typeof NAV)[number]["id"];

const HOTKEY_PRESETS = [
  { id: "default", labelKey: "settings.hotkeyDefault" as const, value: "ctrl+shift+space" },
  { id: "ctrl-space", labelKey: "settings.hotkeyCtrlSpace" as const, value: "ctrl+space" },
  { id: "alt-space", labelKey: "settings.hotkeyAltSpace" as const, value: "alt+space" },
  { id: "ctrl-alt-space", labelKey: "settings.hotkeyCtrlAltSpace" as const, value: "ctrl+alt+space" },
  { id: "custom", labelKey: "settings.hotkeyCustom" as const, value: "" },
] as const;

function SettingsField({ label, hint, children }: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="vv-settingsField">
      <span className="vv-settingsLabel">{label}</span>
      {children}
      {hint && <span className="vv-settingsHint">{hint}</span>}
    </label>
  );
}

function SettingsBlock({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section className="vv-settingsBlock">
      <h3>{title}</h3>
      {subtitle && <p className="vv-settingsHint">{subtitle}</p>}
      <div className="vv-settingsBlockBody">{children}</div>
    </section>
  );
}

function ChoiceCard({
  selected,
  title,
  caption,
  children,
  onClick,
}: {
  selected: boolean;
  title: string;
  caption?: string;
  children?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`vv-choiceCard${selected ? " is-selected" : ""}`} onClick={onClick}>
      <span className="vv-choiceTop">
        <span>
          <span className="vv-choiceTitle">{title}</span>
          {caption && <span className="vv-choiceCaption">{caption}</span>}
        </span>
        <span className={`vv-choiceCheck${selected ? " is-on" : ""}`} aria-hidden>
          {selected ? <Check size={14} /> : null}
        </span>
      </span>
      {children}
    </button>
  );
}

export function SettingsPage() {
  const { t, locale, refresh: refreshI18n } = useI18n();
  const { meta } = useAppMetadata();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [section, setSection] = useState<SettingsSection>(() => {
    const raw = searchParams.get("section");
    return NAV.some((n) => n.id === raw) ? (raw as SettingsSection) : "look";
  });
  const [dictJson, setDictJson] = useState("[]");
  const [whisperCliPath, setWhisperCliPath] = useState("");
  const [whisperModelPath, setWhisperModelPath] = useState("");
  const [pasteMethod, setPasteMethod] = useState<PasteMethod>("ctrlV");
  const [hudMode, setHudMode] = useState<HudMode>("full");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [whisperStatus, setWhisperStatus] = useState<string | null>(null);
  const [whisperError, setWhisperError] = useState<string | null>(null);
  const [whisperDownloading, setWhisperDownloading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hotkeyPresetId, setHotkeyPresetId] = useState<string>("default");
  const [customHotkey, setCustomHotkey] = useState<string>("ctrl+shift+space");
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const hydrated = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const lastSaved = useRef("");

  const dictationLangs: { value: DictationLanguage; label: string }[] = [
    { value: "auto", label: t("settings.langAuto") },
    { value: "en", label: t("settings.langEn") },
    { value: "ru", label: t("settings.langRu") },
  ];

  const pasteMethods: { value: PasteMethod; label: string; caption: string }[] = [
    { value: "ctrlV", label: t("settings.pasteCtrlV"), caption: t("settings.pasteCtrlVCap") },
    { value: "shiftInsert", label: t("settings.pasteShiftInsert"), caption: t("settings.pasteShiftInsertCap") },
    { value: "ctrlShiftV", label: t("settings.pasteCtrlShiftV"), caption: t("settings.pasteCtrlShiftVCap") },
  ];

  const hudModes: { value: HudMode; label: string; caption: string }[] = [
    { value: "full", label: t("settings.hudFull"), caption: t("settings.hudFullCap") },
    { value: "iconOnly", label: t("settings.hudIcon"), caption: t("settings.hudIconCap") },
  ];

  const themes: { value: UiTheme; title: string; caption: string }[] = [
    { value: "bridgemind", title: t("settings.themeVoxiva"), caption: t("settings.themeVoxivaCap") },
    { value: "black", title: t("settings.themeBlack"), caption: t("settings.themeBlackCap") },
    { value: "light", title: t("settings.themeLight"), caption: t("settings.themeLightCap") },
  ];

  useEffect(() => {
    const raw = searchParams.get("section");
    if (raw && NAV.some((n) => n.id === raw)) {
      setSection(raw as SettingsSection);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) {
          const next = s.sttMode === "localStub" ? { ...s, sttMode: "whisperCli" as const } : s;
          setSettings(next);
          setDictJson(JSON.stringify(next.dictReplacements ?? [], null, 2));
          setWhisperCliPath((next.whisperCliPath ?? "").toString());
          setWhisperModelPath((next.whisperModelPath ?? "").toString());
          setPasteMethod((next.pasteMethod ?? "ctrlV") as PasteMethod);
          setHudMode((next.hudMode ?? "full") as HudMode);
          const normalized = (next.pushToTalkHotkey ?? "ctrl+shift+space").trim().toLowerCase();
          const preset = HOTKEY_PRESETS.find((p) => p.value === normalized);
          setHotkeyPresetId(preset?.id ?? "custom");
          setCustomHotkey(normalized);
          hydrated.current = true;
          lastSaved.current = JSON.stringify(next);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
      try {
        const st = await getUsageStats();
        if (!cancelled) setUsageStats(st);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const ws = await getWhisperAssetsStatus();
        if (!cancelled) {
          setWhisperStatus(ws.ready ? t("settings.whisperReady") : t("settings.whisperNotReady").replace("{dir}", ws.dir));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  const buildNextSettings = useCallback((): AppSettings | null => {
    if (!settings) return null;
    let parsed: DictEntry[];
    try {
      parsed = JSON.parse(dictJson) as DictEntry[];
      if (!Array.isArray(parsed)) throw new Error(t("settings.dictInvalid"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
    const chosenHotkey =
      hotkeyPresetId === "custom"
        ? customHotkey.trim().toLowerCase()
        : (HOTKEY_PRESETS.find((p) => p.id === hotkeyPresetId)?.value ?? settings.pushToTalkHotkey);
    if (!chosenHotkey || !chosenHotkey.includes("+")) {
      setError(t("settings.hotkeyInvalid"));
      return null;
    }
    setError(null);
    return {
      ...settings,
      sttMode: "whisperCli",
      pushToTalkHotkey: chosenHotkey || settings.pushToTalkHotkey,
      dictReplacements: parsed,
      whisperCliPath: whisperCliPath.trim() ? whisperCliPath.trim() : null,
      whisperModelPath: whisperModelPath.trim() ? whisperModelPath.trim() : null,
      privacyLocalOnly: true,
      pasteMethod,
      hudMode,
    };
  }, [settings, dictJson, hotkeyPresetId, customHotkey, whisperCliPath, whisperModelPath, pasteMethod, hudMode, t]);

  const persistSettings = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const next = buildNextSettings();
      if (!next) return false;
      const snap = JSON.stringify(next);
      if (snap === lastSaved.current) return true;
      setSaving(true);
      try {
        await saveSettings(next);
        lastSaved.current = snap;
        setSettings(next);
        applyTheme(next.uiTheme);
        void refreshI18n();
        if (!opts?.quiet) setStatus(t("settings.saved"));
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [buildNextSettings, refreshI18n, t],
  );

  useEffect(() => {
    if (!hydrated.current || !settings) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void persistSettings({ quiet: true });
    }, 450);
    return () => window.clearTimeout(saveTimer.current);
  }, [settings, dictJson, pasteMethod, hudMode, hotkeyPresetId, customHotkey, whisperCliPath, whisperModelPath, persistSettings]);

  async function onDownloadWhisper() {
    setWhisperError(null);
    setWhisperDownloading(true);
    setWhisperStatus(t("settings.whisperDownloading"));
    try {
      const ws = await downloadWhisperAssets();
      setWhisperStatus(ws.ready ? t("settings.whisperReady") : t("settings.whisperNotReady").replace("{dir}", ws.dir));
      const nextSettings = await getSettings();
      setSettings(nextSettings);
      setWhisperCliPath((nextSettings.whisperCliPath ?? "").toString());
      setWhisperModelPath((nextSettings.whisperModelPath ?? "").toString());
    } catch (e) {
      setWhisperError(e instanceof Error ? e.message : String(e));
      setWhisperStatus(null);
    } finally {
      setWhisperDownloading(false);
    }
  }

  const active = NAV.find((n) => n.id === section) ?? NAV[0];

  if (!settings) {
    return (
      <div className="vv-settingsLayout">
        <div className="vv-settingsPanel">
          <div className="vv-settingsPanelBody">
            <h2>{t("settings.title")}</h2>
            <p className="vv-settingsHint">{error ?? t("settings.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vv-settingsLayout">
      <aside className="vv-settingsNav" aria-label={t("settings.title")}>
        <div className="vv-settingsNavTitle">{t("settings.title")}</div>
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`vv-settingsNavItem${section === item.id ? " is-active" : ""}`}
            onClick={() => setSection(item.id)}
          >
            <item.Icon size={16} />
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </aside>

      <div className="vv-settingsPanel">
        <div className="vv-settingsPanelBody">
          <header className="vv-settingsPanelHead">
            <div>
              <h2>{t(active.labelKey)}</h2>
              <p className="vv-settingsHint">
                {section === "look" && t("settings.intro")}
                {section === "voice" && t("settings.voiceSectionSub")}
                {section === "input" && t("settings.inputSectionSub")}
                {section === "help" && t("settings.helpSectionSub")}
                {section === "history" && t("settings.historyHint")}
                {section === "about" && t("settings.aboutHint")}
                {section === "advanced" && t("settings.advancedSectionSub")}
              </p>
            </div>
            <div className="vv-settingsSaveMeta" aria-live="polite">
              {saving ? <span className="vv-settingsStatus">{t("settings.saving")}</span> : null}
              {!saving && status ? <span className="vv-settingsStatus">{status}</span> : null}
              {error ? <span className="vv-settingsError">{error}</span> : null}
            </div>
          </header>

          {section === "look" && (
            <>
              <SettingsBlock title={t("settings.uiLang")} subtitle={t("settings.uiLangSub")}>
                <div className="vv-langRow">
                  {(["en", "ru"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={`vv-langChip${settings.uiLocale === code ? " is-active" : ""}`}
                      onClick={() => {
                        const next = { ...settings, uiLocale: code };
                        setSettings(next);
                        void (async () => {
                          try {
                            await saveSettings(next);
                            void refreshI18n();
                          } catch {
                            /* ignore */
                          }
                        })();
                      }}
                    >
                      <strong>{code === "en" ? t("settings.uiLocaleEn") : t("settings.uiLocaleRu")}</strong>
                      <small>{code.toUpperCase()}</small>
                      {settings.uiLocale === code ? (
                        <span className="vv-langCheck" aria-hidden>
                          <Check size={14} />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </SettingsBlock>

              <SettingsBlock title={t("settings.themesSectionTitle")} subtitle={t("settings.themesSectionSub")}>
                <div className="vv-choiceGrid is-three">
                  {themes.map((th) => (
                    <ChoiceCard
                      key={th.value}
                      selected={settings.uiTheme === th.value}
                      title={th.title}
                      caption={th.caption}
                      onClick={() => {
                        const next = { ...settings, uiTheme: th.value };
                        setSettings(next);
                        applyTheme(next.uiTheme);
                      }}
                    />
                  ))}
                </div>
              </SettingsBlock>

              <SettingsBlock title={t("settings.widgetSectionTitle")} subtitle={t("settings.widgetSectionSub")}>
                <div className="vv-choiceGrid">
                  {hudModes.map((m) => (
                    <ChoiceCard
                      key={m.value}
                      selected={hudMode === m.value}
                      title={m.label}
                      caption={m.caption}
                      onClick={() => setHudMode(m.value)}
                    />
                  ))}
                </div>
              </SettingsBlock>
            </>
          )}

          {section === "voice" && (
            <>
              <SettingsBlock title={t("settings.voiceSectionTitle")} subtitle={t("settings.voiceSectionSub")}>
                <div className="vv-choiceGrid">
                  <div className="vv-choiceCard is-selected">
                    <span className="vv-choiceTop">
                      <span>
                        <span className="vv-choiceTitle">{t("settings.whisperEngine")}</span>
                        <span className="vv-choiceCaption">{t("settings.whisperEngineCap")}</span>
                      </span>
                      <span className="vv-choiceCheck is-on" aria-hidden>
                        <Check size={14} />
                      </span>
                    </span>
                    <span className="vv-pillRow">
                      {[t("settings.tagFree"), t("settings.tagLocal"), t("settings.tagFast")].map((tag) => (
                        <span key={tag} className="vv-miniPill">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </SettingsBlock>

              <SettingsBlock title={t("settings.whisperSectionTitle")} subtitle={t("settings.whisperSectionSub")}>
                <div className="vv-modelCard">
                  <div>
                    <div className="vv-modelCardTitle">{whisperStatus ?? t("settings.whisperChecking")}</div>
                    <div className="vv-settingsHint" style={{ marginTop: "0.25rem" }}>
                      {t("settings.whisperLocalHint")}
                    </div>
                  </div>
                  <div className="vv-modelCardActions">
                    <Button variant="secondary" onClick={() => void onDownloadWhisper()} disabled={whisperDownloading}>
                      {whisperDownloading ? t("settings.preparing") : t("settings.download")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        void (async () => {
                          try {
                            const ws = await getWhisperAssetsStatus();
                            setWhisperStatus(ws.ready ? t("settings.whisperReady") : t("settings.whisperNotReady").replace("{dir}", ws.dir));
                          } catch (e) {
                            setWhisperError(e instanceof Error ? e.message : String(e));
                          }
                        })()
                      }
                    >
                      {t("settings.refresh")}
                    </Button>
                  </div>
                </div>
                {whisperError && <span className="vv-settingsError">{whisperError}</span>}
              </SettingsBlock>
            </>
          )}

          {section === "input" && (
            <>
              <SettingsBlock title={t("settings.inputSectionTitle")} subtitle={t("settings.inputSectionSub")}>
                <div className="vv-grid2">
                  <SettingsField label={t("settings.dictationLang")}>
                    <select
                      value={settings.dictationLanguage}
                      onChange={(e) => setSettings({ ...settings, dictationLanguage: e.target.value as DictationLanguage })}
                      className="vv-control"
                    >
                      {dictationLangs.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </SettingsField>

                  <SettingsField label={t("settings.recordingMode")}>
                    <select
                      value={settings.recordingMode}
                      onChange={(e) => setSettings({ ...settings, recordingMode: e.target.value as RecordingMode })}
                      className="vv-control"
                    >
                      <option value="pushToTalk">{t("settings.recordingModePtt")}</option>
                      <option value="toggle">{t("settings.recordingModeToggle")}</option>
                    </select>
                  </SettingsField>

                  <SettingsField label={t("settings.hotkey")} hint={hotkeyPresetId === "custom" ? t("settings.hotkeyExample") : undefined}>
                    <select value={hotkeyPresetId} onChange={(e) => setHotkeyPresetId(e.target.value)} className="vv-control">
                      {HOTKEY_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {t(p.labelKey)}
                        </option>
                      ))}
                    </select>
                    {hotkeyPresetId === "custom" && (
                      <input value={customHotkey} onChange={(e) => setCustomHotkey(e.target.value)} className="vv-control" spellCheck={false} />
                    )}
                  </SettingsField>

                  <SettingsField label={t("settings.pasteMethod")} hint={pasteMethods.find((m) => m.value === pasteMethod)?.caption}>
                    <select value={pasteMethod} onChange={(e) => setPasteMethod(e.target.value as PasteMethod)} className="vv-control">
                      {pasteMethods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </SettingsField>
                </div>

                <Toggle
                  checked={settings.voiceActivationEnabled}
                  onChange={(e) => setSettings({ ...settings, voiceActivationEnabled: e.target.checked })}
                  label={t("settings.voiceActivation")}
                  description={t("settings.voiceActivationDesc")}
                />

                <Toggle
                  checked={settings.humanizeText !== false}
                  onChange={(e) => setSettings({ ...settings, humanizeText: e.target.checked })}
                  label={t("settings.humanize")}
                  description={t("settings.humanizeDesc")}
                />
              </SettingsBlock>

              <SettingsBlock title={t("settings.dictSectionTitle")} subtitle={t("settings.dictSectionSub")}>
                <textarea
                  value={dictJson}
                  onChange={(e) => setDictJson(e.target.value)}
                  rows={7}
                  className="vv-control vv-controlMono"
                  style={{ resize: "vertical" }}
                  spellCheck={false}
                />
              </SettingsBlock>
            </>
          )}

          {section === "help" && (
            <SettingsBlock title={t("nav.instructions")} subtitle={t("settings.helpSectionSub")}>
              <ol className="vv-helpList">
                <li>{t("overview.step1")}</li>
                <li>{t("overview.step2")}</li>
                <li>{t("overview.step3")}</li>
                <li>{t("settings.helpPaste")}</li>
                <li>{t("settings.helpSpace")}</li>
              </ol>
            </SettingsBlock>
          )}

          {section === "history" && (
            <SettingsBlock title={t("nav.history")} subtitle={t("settings.historyHint")}>
              <div className="vv-overviewCards" style={{ marginTop: 0 }}>
                <article className="vv-overviewCard">
                  <span className="vv-overviewLabel">{t("stats.words")}</span>
                  <strong className="vv-overviewValue">{usageStats?.totalWords ?? 0}</strong>
                </article>
                <article className="vv-overviewCard">
                  <span className="vv-overviewLabel">{t("stats.dictationTime")}</span>
                  <strong className="vv-overviewValue">{formatDuration(usageStats?.totalDictationSeconds ?? 0, locale)}</strong>
                </article>
                <article className="vv-overviewCard">
                  <span className="vv-overviewLabel">{t("stats.appTime")}</span>
                  <strong className="vv-overviewValue">{formatDuration(usageStats?.totalAppSeconds ?? 0, locale)}</strong>
                </article>
                <article className="vv-overviewCard">
                  <span className="vv-overviewLabel">{t("stats.sessions")}</span>
                  <strong className="vv-overviewValue">{usageStats?.dictationCount ?? 0}</strong>
                </article>
              </div>
              {usageStats?.recent?.length ? (
                <>
                  <div className="vv-settingsLabel" style={{ marginTop: "0.85rem" }}>{t("stats.recentTitle")}</div>
                  <ul className="vv-statsList">
                    {usageStats.recent.map((item, i) => (
                      <li key={`${item.at}-${i}`} className="vv-statsItem">
                        <div className="vv-statsItemText">{item.text}</div>
                        <div className="vv-statsItemMeta">
                          {item.words} {t("stats.wordsUnit")} · {formatStatDate(item.at, locale)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="vv-settingsHint" style={{ marginTop: "0.85rem" }}>{t("stats.empty")}</p>
              )}
            </SettingsBlock>
          )}

          {section === "about" && (
            <>
              <SettingsBlock title={t("nav.account")} subtitle={t("settings.aboutHint")}>
                <div className="vv-aboutCard">
                  <strong>{meta ? `${meta.name} v${meta.version}` : t("settings.kicker")}</strong>
                  <p>{t("settings.aboutBody")}</p>
                </div>
              </SettingsBlock>

              <SettingsBlock title={t("settings.updateTitle")} subtitle={t("settings.updateCurrent").replace("{version}", meta?.version ?? "…")}>
                <div className="vv-modelCardActions">
                  <Button
                    variant="secondary"
                    disabled={updateBusy}
                    onClick={() =>
                      void (async () => {
                        setUpdateBusy(true);
                        setUpdateError(null);
                        setUpdateInfo(null);
                        try {
                          const info = await checkForUpdates();
                          setUpdateInfo(info);
                        } catch (e) {
                          setUpdateError(e instanceof Error ? e.message : String(e));
                        } finally {
                          setUpdateBusy(false);
                        }
                      })()
                    }
                  >
                    {updateBusy ? t("settings.updateChecking") : t("settings.updateCheck")}
                  </Button>
                  {(updateInfo?.updateAvailable || updateError) && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        void openExternalUrl(updateInfo?.downloadUrl || updateInfo?.downloadsPage || "https://voxiva.ai/downloads")
                      }
                    >
                      {updateInfo?.updateAvailable ? t("settings.updateDownload") : t("settings.updateOpenPage")}
                    </Button>
                  )}
                </div>
                {updateInfo?.updateAvailable ? (
                  <p className="vv-settingsHint" style={{ marginTop: "0.65rem" }}>
                    {t("settings.updateAvailable")
                      .replace("{latest}", updateInfo.latestVersion)
                      .replace("{current}", updateInfo.currentVersion)}
                    {updateInfo.notes ? ` — ${updateInfo.notes}` : ""}
                  </p>
                ) : null}
                {updateInfo && !updateInfo.updateAvailable ? (
                  <p className="vv-settingsStatus" style={{ marginTop: "0.65rem" }}>
                    {t("settings.updateUpToDate")}
                  </p>
                ) : null}
                {updateError ? (
                  <span className="vv-settingsError" style={{ marginTop: "0.65rem", display: "block" }}>
                    {t("settings.updateFailed")}
                  </span>
                ) : null}
              </SettingsBlock>
            </>
          )}

          {section === "advanced" && (
            <SettingsBlock title={t("settings.advancedSectionTitle")} subtitle={t("settings.advancedSectionSub")}>
              <div className="vv-aboutCard" style={{ marginBottom: "0.75rem" }}>
                <strong>{t("settings.alwaysLocal")}</strong>
                <p className="vv-settingsHint">{t("settings.alwaysLocalHint")}</p>
              </div>
              <Button variant="ghost" onClick={() => setShowAdvanced((v) => !v)} style={{ justifySelf: "start" }}>
                {showAdvanced ? t("settings.hidePaths") : t("settings.showPaths")}
              </Button>
              {showAdvanced && (
                <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <SettingsField label={t("settings.whisperCliLabel")}>
                    <input value={whisperCliPath} onChange={(e) => setWhisperCliPath(e.target.value)} className="vv-control" spellCheck={false} />
                  </SettingsField>
                  <SettingsField label={t("settings.whisperModelLabel")}>
                    <input value={whisperModelPath} onChange={(e) => setWhisperModelPath(e.target.value)} className="vv-control" spellCheck={false} />
                  </SettingsField>
                </div>
              )}
            </SettingsBlock>
          )}
        </div>
      </div>
    </div>
  );
}
