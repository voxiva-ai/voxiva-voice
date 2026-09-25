import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import { useI18n } from "@/i18n/I18nContext";

/** Static product preview — no motion. */
export function LiveSpeakPreview() {
  const { t } = useI18n();

  const steps = [
    t("preview.stepHold"),
    t("preview.stepSpeak"),
    t("preview.stepRelease"),
    t("preview.stepLand"),
  ];

  const waveHeights = [14, 28, 42, 22, 48, 32, 18, 40, 26, 44, 20, 34];

  return (
    <div className="vv-speakPreview" aria-hidden>
      <div className="vv-speakPreviewChrome">
        <span />
        <span />
        <span />
        <strong>{t("preview.holdSpeakLand")}</strong>
      </div>
      <div className="vv-speakPreviewBody">
        <div className="vv-speakSteps">
          {steps.map((label, i) => (
            <div key={label} className={`vv-speakStep${i === 1 ? " is-active" : ""}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="vv-speakStage">
          <div className="vv-speakPane is-listening">
            <div className="vv-speakPaneBar">
              <b>{t("preview.hud")}</b>
              <i />
            </div>
            <div className="vv-speakPaneBody">
              <div className="vv-speakWave">
                {waveHeights.map((h, i) => (
                  <i key={i} style={{ height: `${h}px`, opacity: 0.85 }} />
                ))}
              </div>
              <div className="vv-speakHud is-listening">
                <img src={logoUrl} alt="" />
                <label>{t("preview.listening")}</label>
              </div>
            </div>
          </div>

          <div className="vv-speakPane">
            <div className="vv-speakPaneBar">
              <b>{t("preview.anyApp")}</b>
              <i />
            </div>
            <div className="vv-speakEditor">
              <div className="vv-speakEditorLine">{t("preview.cursorLine")}</div>
              <div className="vv-speakEditorLine is-typed">{t("preview.demoText")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
