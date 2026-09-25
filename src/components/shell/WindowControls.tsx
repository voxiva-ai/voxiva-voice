import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useI18n } from "@/i18n/I18nContext";

export function WindowControls() {
  const { t } = useI18n();
  const [maximized, setMaximized] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMaximized(await getCurrentWindow().isMaximized());
    } catch {
      // web preview
    }
  }, []);

  useEffect(() => {
    void refresh();
    const win = getCurrentWindow();
    let unlistenResize: (() => void) | undefined;
    void win
      .onResized(() => {
        void refresh();
      })
      .then((fn) => {
        unlistenResize = fn;
      })
      .catch(() => undefined);
    return () => unlistenResize?.();
  }, [refresh]);

  return (
    <div className="vv-winControls" data-no-drag onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="vv-winBtn"
        aria-label={t("win.minimize")}
        title={t("win.minimize")}
        onClick={() => void getCurrentWindow().minimize()}
      >
        <span className="vv-winGlyph is-min" />
      </button>
      <button
        type="button"
        className="vv-winBtn"
        aria-label={maximized ? t("win.restore") : t("win.maximize")}
        title={maximized ? t("win.restore") : t("win.maximize")}
        onClick={() => void getCurrentWindow().toggleMaximize().then(() => refresh())}
      >
        <span className={`vv-winGlyph ${maximized ? "is-restore" : "is-max"}`} />
      </button>
      <button
        type="button"
        className="vv-winBtn is-close"
        aria-label={t("win.close")}
        title={t("win.close")}
        onClick={() => void getCurrentWindow().close()}
      >
        <span className="vv-winGlyph is-close" />
      </button>
    </div>
  );
}
