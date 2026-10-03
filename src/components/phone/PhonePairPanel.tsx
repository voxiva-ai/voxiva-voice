import { useEffect, useState } from "react";
import { getPhonePairInfo, type PhonePairInfo } from "@/lib/commands";
import { useI18n } from "@/i18n/I18nContext";

/** QR pair panel — used inside Settings → Phone. */
export function PhonePairPanel() {
  const { t } = useI18n();
  const [info, setInfo] = useState<PhonePairInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setBusy(true);
      try {
        const next = await getPhonePairInfo();
        if (!cancelled) {
          setInfo(next);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="vv-phoneCard vv-phoneCardEmbed">
      {busy && <p className="vv-muted">{t("common.busy")}</p>}
      {error && <p className="vv-errorText">{error}</p>}
      {info && (
        <>
          <div className="vv-phoneQrWrap">
            <div className="vv-phoneQr" dangerouslySetInnerHTML={{ __html: info.qrSvg }} />
          </div>
          <p className="vv-phoneUrl">{info.url}</p>
          <p className="vv-phoneTip">{t("phone.tip")}</p>
          <ol className="vv-helpList is-compact">
            <li>{t("phone.step1")}</li>
            <li>{t("phone.step2")}</li>
            <li>{t("phone.step3")}</li>
            <li>{t("phone.step4")}</li>
          </ol>
        </>
      )}
    </div>
  );
}
