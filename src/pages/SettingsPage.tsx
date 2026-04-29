import type { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { downloadWhisperAssets, getSettings, getWhisperAssetsStatus, saveSettings } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import type { AppSettings, DictationLanguage, DictEntry, HudMode, PasteMethod, RecordingMode, SttMode, UiTheme } from "@/types/settings";
import { applyTheme } from "@/theme/applyTheme";
import { Section } from "@/components/ui/Section";
import { Toggle } from "@/components/ui/Toggle";

const dictationLangs: { value: DictationLanguage; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

const uiLocales = [
  { value: "en", label: "English UI" },
  { value: "ru", label: "Русский UI" },
];

const sttModes: { value: SttMode; label: string; caption: string; tags: string[] }[] = [
  { value: "localStub", label: "Basic", caption: "Fast local test mode.", tags: ["Local", "Fast"] },
  { value: "whisperCli", label: "Whisper", caption: "Offline recognition with a local model.", tags: ["Private", "Offline"] },
];

const pasteMethods: { value: PasteMethod; label: string; caption: string }[] = [
  { value: "ctrlV", label: "Ctrl+V", caption: "Default." },
  { value: "shiftInsert", label: "Shift+Insert", caption: "Alternative." },
  { value: "ctrlShiftV", label: "Ctrl+Shift+V", caption: "Alternative." },
];

const hudModes: { value: HudMode; label: string }[] = [
  { value: "full", label: "Logo + wave" },
  { value: "iconOnly", label: "Icon only" },
];

const themes: { value: UiTheme; title: string; caption: string }[] = [
  { value: "bridgemind", title: "Voxiva", caption: "Default dark." },
  { value: "black", title: "Black", caption: "Pure OLED." },
  { value: "light", title: "Light", caption: "Bright mode." },
];

const hotkeyPresets: { id: string; label: string; value: string }[] = [
  { id: "default", label: "Ctrl + Shift + Space (default)", value: "ctrl+shift+space" },
  { id: "ctrl-space", label: "Ctrl + Space", value: "ctrl+space" },
  { id: "alt-space", label: "Alt + Space", value: "alt+space" },
  { id: "ctrl-alt-space", label: "Ctrl + Alt + Space", value: "ctrl+alt+space" },
  { id: "custom", label: "Custom…", value: "" },
];

const selectStyle: CSSProperties = {
  width: "100%",
  background: "color-mix(in srgb, var(--vv-surface) 86%, transparent)",
  color: "var(--vv-text)",
  border: "1px solid var(--vv-border)",
  borderRadius: 13,
  padding: "0.72rem 0.82rem",
  outline: "none",
};

const inputStyle: CSSProperties = {
  ...selectStyle,
  width: "100%",
};

function SettingsField({ label, hint, children }: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="vv-settingsField">
      <span className="vv-settingsLabel">{label}</span>
      {children}
      {hint && <span className="vv-settingsHint">{hint}</span>}
    </label>
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
        <span className="vv-choiceDot" aria-hidden />
      </span>
      {children}
    </button>
  );
}

export function SettingsPage() {
  const { t, refresh: refreshI18n } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dictJson, setDictJson] = useState("[]");
  const [whisperCliPath, setWhisperCliPath] = useState("");
  const [whisperModelPath, setWhisperModelPath] = useState("");
  const [privacyLocalOnly, setPrivacyLocalOnly] = useState(true);
  const [pasteMethod, setPasteMethod] = useState<PasteMethod>("ctrlV");
  const [hudMode, setHudMode] = useState<HudMode>("full");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [whisperStatus, setWhisperStatus] = useState<string | null>(null);
  const [whisperError, setWhisperError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hotkeyPresetId, setHotkeyPresetId] = useState<string>("default");
  const [customHotkey, setCustomHotkey] = useState<string>("ctrl+shift+space");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) {
          setSettings(s);
          setDictJson(JSON.stringify(s.dictReplacements ?? [], null, 2));
          setWhisperCliPath((s.whisperCliPath ?? "").toString());
          setWhisperModelPath((s.whisperModelPath ?? "").toString());
          setPrivacyLocalOnly(Boolean(s.privacyLocalOnly));
          setPasteMethod((s.pasteMethod ?? "ctrlV") as PasteMethod);
          setHudMode((s.hudMode ?? "full") as HudMode);
          const normalized = (s.pushToTalkHotkey ?? "ctrl+shift+space").trim().toLowerCase();
          const preset = hotkeyPresets.find((p) => p.value === normalized);
          setHotkeyPresetId(preset?.id ?? "custom");
          setCustomHotkey(normalized);
        }
        const ws = await getWhisperAssetsStatus();
        if (!cancelled) {
          setWhisperStatus(ws.ready ? "Ready" : `Not ready (will download to: ${ws.dir})`);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave() {
    if (!settings) return;
    setStatus(null);
    setError(null);
    let parsed: DictEntry[];
    try {
      parsed = JSON.parse(dictJson) as DictEntry[];
      if (!Array.isArray(parsed)) throw new Error("Dictionary must be a JSON array");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return;
    }
    const chosenHotkey =
      hotkeyPresetId === "custom"
        ? customHotkey.trim().toLowerCase()
        : (hotkeyPresets.find((p) => p.id === hotkeyPresetId)?.value ?? settings.pushToTalkHotkey);
    if (!chosenHotkey || !chosenHotkey.includes("+")) {
      setError("Hotkey must look like ctrl+shift+space");
      return;
    }
    const next: AppSettings = {
      ...settings,
      pushToTalkHotkey: chosenHotkey || settings.pushToTalkHotkey,
      dictReplacements: parsed,
      whisperCliPath: whisperCliPath.trim() ? whisperCliPath.trim() : null,
      whisperModelPath: whisperModelPath.trim() ? whisperModelPath.trim() : null,
      privacyLocalOnly,
      pasteMethod,
      hudMode,
    };
    try {
      await saveSettings(next);
      setSettings(next);
      applyTheme(next.uiTheme);
      void refreshI18n();
      setStatus(t("settings.saved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onDownloadWhisper() {
    setWhisperError(null);
    setWhisperStatus("Downloading… (this can take a while)");
    try {
      await downloadWhisperAssets();
      setWhisperStatus("Download started. You can keep using the app; check back in a minute.");
    } catch (e) {
      setWhisperError(e instanceof Error ? e.message : String(e));
      setWhisperStatus(null);
    }
  }

  if (!settings) {
    return <Section title={t("settings.title")} subtitle={t("settings.intro")}>{error ?? t("settings.loading")}</Section>;
  }

  return (
    <div className="vv-settingsPage">
      <div className="vv-settingsHero">
        <div>
          <div className="vv-settingsKicker">Voxiva Voice</div>
          <div className="vv-settingsHeroTitle">{t("settings.title")}</div>
          <div className="vv-settingsHeroText">{t("settings.intro")}</div>
        </div>
        <div className="vv-settingsActions">
          <Button onClick={() => void onSave()}>{t("settings.save")}</Button>
          {status && <span className="vv-settingsStatus">{status}</span>}
          {error && <span className="vv-settingsError">{error}</span>}
        </div>
      </div>

      <div className="vv-settingsLayout">
        <div className="vv-settingsColumn">
          <Section title="Transcription Mode" subtitle="Choose how Voxiva turns speech into text. Whisper is the best default for real offline dictation.">
            <div className="vv-choiceGrid">
              {sttModes.map((mode) => (
                <ChoiceCard
                  key={mode.value}
                  selected={settings.sttMode === mode.value}
                  title={mode.label}
                  caption={mode.caption}
                  onClick={() => setSettings({ ...settings, sttMode: mode.value })}
                >
                  <span className="vv-pillRow">
                    {mode.tags.map((tag) => (
                      <span key={tag} className="vv-miniPill">
                        {tag}
                      </span>
                    ))}
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </Section>

          <Section title="Input & Recording" subtitle="Control the language, shortcut and paste behavior used in any text field.">
            <div className="vv-grid2">
              <SettingsField label={t("settings.dictationLang")}>
                <select
                  value={settings.dictationLanguage}
                  onChange={(e) => setSettings({ ...settings, dictationLanguage: e.target.value as DictationLanguage })}
                  style={selectStyle}
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
                  style={selectStyle}
                >
                  <option value="pushToTalk">{t("settings.recordingModePtt")}</option>
                  <option value="toggle">{t("settings.recordingModeToggle")}</option>
                </select>
              </SettingsField>

              <SettingsField label={t("settings.hotkey")} hint={hotkeyPresetId === "custom" ? "Example: ctrl+shift+space" : undefined}>
                <select value={hotkeyPresetId} onChange={(e) => setHotkeyPresetId(e.target.value)} style={selectStyle}>
                  {hotkeyPresets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {hotkeyPresetId === "custom" && (
                  <input value={customHotkey} onChange={(e) => setCustomHotkey(e.target.value)} style={inputStyle} spellCheck={false} />
                )}
              </SettingsField>

              <SettingsField label="Paste method" hint={pasteMethods.find((m) => m.value === pasteMethod)?.caption}>
                <select value={pasteMethod} onChange={(e) => setPasteMethod(e.target.value as PasteMethod)} style={selectStyle}>
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
              label="Voice activation"
              description="Start automatically when you speak."
            />
          </Section>

          <Section title="Dictionary" subtitle="Automatic phrase replacements. Keep it for names, products and repeated corrections.">
            <textarea
              value={dictJson}
              onChange={(e) => setDictJson(e.target.value)}
              rows={7}
              style={{ ...inputStyle, fontFamily: "var(--vv-mono)", resize: "vertical" }}
              spellCheck={false}
            />
          </Section>
        </div>

        <div className="vv-settingsColumn">
          <Section title="Local Model" subtitle="Download or refresh the offline Whisper assets.">
            <div className="vv-modelCard">
              <div>
                <div style={{ fontWeight: 900 }}>{whisperStatus ?? "Checking…"}</div>
                <div className="vv-settingsHint" style={{ marginTop: "0.25rem" }}>
                  Runs locally on this computer.
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => void onDownloadWhisper()}>
                  Download
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    void (async () => {
                      try {
                        const ws = await getWhisperAssetsStatus();
                        setWhisperStatus(ws.ready ? "Ready" : `Not ready (will download to: ${ws.dir})`);
                      } catch (e) {
                        setWhisperError(e instanceof Error ? e.message : String(e));
                      }
                    })()
                  }
                >
                  Refresh
                </Button>
              </div>
            </div>
            {whisperError && <span className="vv-settingsError">{whisperError}</span>}
          </Section>

          <Section title="Widget" subtitle="Choose the small floating dictation control.">
            <div className="vv-choiceGrid">
              {hudModes.map((m) => (
                <ChoiceCard key={m.value} selected={hudMode === m.value} title={m.label} onClick={() => setHudMode(m.value)} />
              ))}
            </div>
          </Section>

          <Section title="Themes" subtitle="Theme changes apply immediately. Black mode stays monochrome.">
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
          </Section>

          <Section title="General" subtitle="Interface language and advanced local paths.">
            <SettingsField label={t("settings.uiLang")}>
              <select
                value={settings.uiLocale}
                onChange={(e) => {
                  const nextLocale = e.target.value;
                  setSettings({ ...settings, uiLocale: nextLocale });
                  void (async () => {
                    try {
                      await saveSettings({ ...settings, uiLocale: nextLocale });
                      void refreshI18n();
                    } catch {
                      /* ignore */
                    }
                  })();
                }}
                style={selectStyle}
              >
                {uiLocales.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </SettingsField>

            <Button variant="ghost" onClick={() => setShowAdvanced((v) => !v)} style={{ justifySelf: "start" }}>
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </Button>

            {showAdvanced && (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <SettingsField label="whisper-cli.exe">
                  <input value={whisperCliPath} onChange={(e) => setWhisperCliPath(e.target.value)} style={inputStyle} spellCheck={false} />
                </SettingsField>
                <SettingsField label="model (.bin)">
                  <input value={whisperModelPath} onChange={(e) => setWhisperModelPath(e.target.value)} style={inputStyle} spellCheck={false} />
                </SettingsField>
                <Toggle checked={privacyLocalOnly} onChange={(e) => setPrivacyLocalOnly(e.target.checked)} label="Local-only" />
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
