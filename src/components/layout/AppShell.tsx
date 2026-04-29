import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import logoUrl from "@/assets/brand/voxiva-mark.svg";

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="vv-navIcon" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

export function AppShell() {
  const { t } = useI18n();

  return (
    <div className="vv-appShell">
      <aside className="vv-sidebar">
        <div className="vv-sidebarBrand">
          <img src={logoUrl} alt="Voxiva" className="vv-sidebarLogo" />
          <div className="vv-sidebarBrandText">
            <div className="vv-sidebarTitle">
              Voxiva <span>Voice</span>
            </div>
            <div className="vv-sidebarTagline">{t("nav.tagline")}</div>
          </div>
        </div>

        <nav className="vv-sidebarNav">
          <NavLink to="/overview" end className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v10h5v-6h4v6h5V10" />
            </NavIcon>
            {t("nav.overview")}
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <path d="M12 8v5l3 2" />
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </NavIcon>
            {t("nav.history")}
          </NavLink>
          <NavLink to="/dictionary" className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <path d="M5 4h14v16H7a2 2 0 0 1-2-2V4z" />
              <path d="M9 8h6" />
              <path d="M9 12h5" />
            </NavIcon>
            {t("nav.dictionary")}
          </NavLink>
          <NavLink to="/instructions" className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <path d="M6 4h12v16l-6-3-6 3V4z" />
              <path d="M9 8h6" />
              <path d="M9 12h4" />
            </NavIcon>
            {t("nav.instructions")}
          </NavLink>
          <NavLink to="/shortcuts" className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <rect x="5" y="5" width="14" height="14" rx="3" />
              <path d="M9 9h.01" />
              <path d="M12 9h.01" />
              <path d="M15 9h.01" />
              <path d="M9 13h6" />
            </NavIcon>
            {t("nav.shortcuts")}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <path d="M4 7h10" />
              <path d="M18 7h2" />
              <circle cx="16" cy="7" r="2" />
              <path d="M4 17h2" />
              <path d="M10 17h10" />
              <circle cx="8" cy="17" r="2" />
            </NavIcon>
            {t("nav.settings")}
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => `vv-navLink${isActive ? " is-active" : ""}`}>
            <NavIcon>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </NavIcon>
            {t("nav.account")}
          </NavLink>
        </nav>

        <div className="vv-sidebarSpacer" />
      </aside>

      <main className="vv-mainPane">
        <Outlet />
      </main>
    </div>
  );
}
