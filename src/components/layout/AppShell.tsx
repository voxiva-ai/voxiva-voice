import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import logoUrl from "@/assets/brand/voxiva-mark.svg";
import lockupUrl from "@/assets/brand/voxiva-voice-lockup-horizontal.svg";

export function AppShell() {
  const { t } = useI18n();
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside
        style={{
          width: 248,
          padding: "1rem",
          borderRight: "1px solid var(--vv-border)",
          background: "rgba(12, 16, 26, 0.72)",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={logoUrl}
            alt="Voxiva"
            width={38}
            height={38}
            style={{
              borderRadius: 12,
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
            }}
          />
          <div>
            <img src={lockupUrl} alt="Voxiva Voice" height={20} style={{ display: "block", opacity: 0.95 }} />
            <div style={{ fontSize: "0.8rem", color: "var(--vv-muted)" }}>{t("nav.tagline")}</div>
          </div>
        </div>

        <nav style={{ display: "grid", gap: "0.35rem" }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: "0.6rem 0.7rem",
              borderRadius: 12,
              color: isActive ? "var(--vv-text)" : "var(--vv-muted)",
              fontWeight: 700,
              background: isActive ? "var(--vv-accent-soft)" : "transparent",
              border: isActive ? "1px solid rgba(91,140,255,0.35)" : "1px solid transparent",
            })}
          >
            {t("nav.overview")}
          </NavLink>
          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              padding: "0.6rem 0.7rem",
              borderRadius: 12,
              color: isActive ? "var(--vv-text)" : "var(--vv-muted)",
              fontWeight: 700,
              background: isActive ? "var(--vv-accent-soft)" : "transparent",
              border: isActive ? "1px solid rgba(91,140,255,0.35)" : "1px solid transparent",
            })}
          >
            {t("nav.settings")}
          </NavLink>
        </nav>

        <div style={{ marginTop: "auto", color: "rgba(200,210,230,0.6)", fontSize: "0.78rem" }}>
          Tip: minimize the app to show the mic HUD.
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", padding: "1.25rem 1.4rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
