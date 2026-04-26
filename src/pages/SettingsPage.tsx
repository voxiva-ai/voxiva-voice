import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { downloadWhisperAssets, getSettings, getWhisperAssetsStatus, saveSettings } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";
import type { AppSettings, DictationLanguage, DictEntry, RecordingMode } from "@/types/settings";

const dictationLangs: { value: DictationLanguage; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

const uiLocales = [
  { value: "en", label: "English UI" },
  { value: "ru", label: "Русский UI" },
];

const hotkeyPresets: { id: string; label: string; value: string }[] = [
  { id: "default", label: "Ctrl + Shift + Space (default)", value: "ctrl+shift+space" },
  { id: "ctrl-space", label: "Ctrl + Space", value: "ctrl+space" },
  { id: "alt-space", label: "Alt + Space", value: "alt+space" },
  { id: "ctrl-alt-space", label: "Ctrl + Alt + Space", value: "ctrl+alt+space" },
  { id: "custom", label: "Custom…", value: "" },
];

const selectStyle: CSSProperties = {
  background: "var(--vv-surface)",
  color: "var(--vv-text)",
  border: "1px solid var(--vv-border)",
  borderRadius: "var(--vv-radius-sm)",
  padding: "0.55rem 0.65rem",
};

const inputStyle: CSSProperties = {
  ...selectStyle,
  width: "100%",
};

export function SettingsPage() {
  const { t, refresh: refreshI18n } = useI18n();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dictJson, setDictJson] = useState("[]");
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
    };
    try {
      await saveSettings(next);
      setSettings(next);
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
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--vv-muted)" }}>{error ?? t("settings.loading")}</p>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <Card>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem" }}>{t("settings.title")}</h1>
        <p style={{ margin: "0 0 1rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>{t("settings.intro")}</p>

        <div style={{ display: "grid", gap: "0.35rem", marginBottom: "0.85rem" }}>
          <span style={{ fontWeight: 700 }}>Offline engine (Whisper)</span>
          <span style={{ color: "var(--vv-muted)" }}>{whisperStatus ?? "Checking…"}</span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button onClick={() => void onDownloadWhisper()}>Download offline model</Button>
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
              Refresh status
            </Button>
          </div>
          {whisperError && <span style={{ color: "#ff8c8c" }}>{whisperError}</span>}
        </div>

        <label style={{ display: "grid", gap: "0.35rem", marginBottom: "0.85rem" }}>
          <span style={{ fontWeight: 700 }}>{t("settings.dictationLang")}</span>
          <select
            value={settings.dictationLanguage}
            onChange={(e) =>
              setSettings({ ...settings, dictationLanguage: e.target.value as DictationLanguage })
            }
            style={selectStyle}
          >
            {dictationLangs.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginBottom: "0.85rem" }}>
          <span style={{ fontWeight: 700 }}>{t("settings.uiLang")}</span>
          <select
            value={settings.uiLocale}
            onChange={(e) => setSettings({ ...settings, uiLocale: e.target.value })}
            style={selectStyle}
          >
            {uiLocales.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginBottom: "0.85rem" }}>
          <span style={{ fontWeight: 700 }}>{t("settings.hotkey")}</span>
          <select value={hotkeyPresetId} onChange={(e) => setHotkeyPresetId(e.target.value)} style={selectStyle}>
            {hotkeyPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {hotkeyPresetId === "custom" && (
            <input
              value={customHotkey}
              onChange={(e) => setCustomHotkey(e.target.value)}
              style={inputStyle}
              spellCheck={false}
            />
          )}
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginBottom: "0.85rem" }}>
          <span style={{ fontWeight: 700 }}>{t("settings.recordingMode")}</span>
          <select
            value={settings.recordingMode}
            onChange={(e) =>
              setSettings({ ...settings, recordingMode: e.target.value as RecordingMode })
            }
            style={selectStyle}
          >
            <option value="pushToTalk">{t("settings.recordingModePtt")}</option>
            <option value="toggle">{t("settings.recordingModeToggle")}</option>
          </select>
        </label>

        {/* Advanced STT paths are auto-managed; keep UI minimal for end users. */}

        <label style={{ display: "grid", gap: "0.35rem", marginBottom: "1rem" }}>
          <span style={{ fontWeight: 700 }}>{t("settings.dictJson")}</span>
          <textarea
            value={dictJson}
            onChange={(e) => setDictJson(e.target.value)}
            rows={6}
            style={{ ...inputStyle, fontFamily: "var(--vv-mono)", resize: "vertical" }}
            spellCheck={false}
          />
        </label>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <Button onClick={() => void onSave()}>{t("settings.save")}</Button>
          {status && <span style={{ color: "var(--vv-muted)" }}>{status}</span>}
          {error && <span style={{ color: "#ff8c8c" }}>{error}</span>}
        </div>
      </Card>
    </div>
  );
}
