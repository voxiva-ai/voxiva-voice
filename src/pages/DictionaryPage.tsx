import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AppSettings, DictEntry } from "@/types/settings";
import { getSettings, saveSettings } from "@/lib/commands";

export function DictionaryPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dictJson, setDictJson] = useState<string>("[]");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) {
          setSettings(s);
          setDictJson(JSON.stringify(s.dictReplacements ?? [], null, 2));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const parsedPreview = useMemo(() => {
    try {
      const parsed = JSON.parse(dictJson) as DictEntry[];
      if (!Array.isArray(parsed)) return null;
      return parsed.slice(0, 3);
    } catch {
      return null;
    }
  }, [dictJson]);

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
    const next: AppSettings = { ...settings, dictReplacements: parsed };
    try {
      await saveSettings(next);
      setSettings(next);
      setStatus("Saved locally.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <Card>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.35rem" }}>Dictionary</h1>
        <p style={{ margin: "0 0 1rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>
          Replace words automatically after recognition. Example:
          <span style={{ fontFamily: "var(--vv-mono)" }}>{" "}[{"{"}"phrase":"Voxiva","replacement":"Voksiva"{"}"}]</span>
        </p>

        {!settings ? (
          <p style={{ margin: 0, color: "var(--vv-muted)" }}>{error ?? "Loading…"}</p>
        ) : (
          <>
            <textarea
              value={dictJson}
              onChange={(e) => setDictJson(e.target.value)}
              rows={10}
              style={{
                width: "100%",
                borderRadius: "var(--vv-radius-md)",
                border: "1px solid var(--vv-border)",
                background: "var(--vv-surface)",
                color: "var(--vv-text)",
                padding: "0.8rem 0.9rem",
                fontFamily: "var(--vv-mono)",
                resize: "vertical",
              }}
              spellCheck={false}
            />

            {parsedPreview && (
              <div style={{ marginTop: "0.75rem", color: "var(--vv-muted)", fontSize: "0.85rem" }}>
                Preview: {parsedPreview.length} entries
              </div>
            )}

            <div style={{ marginTop: "0.9rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <Button onClick={() => void onSave()}>Save</Button>
              {status && <span style={{ color: "var(--vv-muted)" }}>{status}</span>}
              {error && <span style={{ color: "#ff8c8c" }}>{error}</span>}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

