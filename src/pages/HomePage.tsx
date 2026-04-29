import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import logoUrl from "@/assets/brand/voxiva-mark.svg";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

export function HomePage() {
  const { t } = useI18n();
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <section className="vv-hero">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.15rem", alignItems: "center" }}>
          <img className="vv-heroMark" src={logoUrl} alt="Voxiva Voice" width={72} height={72} />
          <div style={{ flex: "1 1 360px", minWidth: 280 }}>
            <h1 className="vv-glassTitle">{t("overview.heroTitle")}</h1>
            <p className="vv-heroTagline">{t("overview.heroBody")}</p>
            <div style={{ marginTop: "0.9rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link to="/settings" style={{ textDecoration: "none" }}>
                <Button>{t("overview.openSettings")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
        <Card>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>{t("overview.howTitle")}</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>
            <li>{t("overview.step1")}</li>
            <li>{t("overview.step2")}</li>
            <li>{t("overview.step3")}</li>
          </ul>
        </Card>
        <Card>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>{t("overview.tipsTitle")}</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--vv-muted)", lineHeight: 1.5 }}>
            <li>{t("overview.tip1")}</li>
            <li>{t("overview.tip2")}</li>
            <li>{t("overview.tip3")}</li>
          </ul>
        </Card>
      </div>

    </div>
  );
}
