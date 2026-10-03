import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import logoUrl from "@/assets/brand/voxiva-voice-logo.png";
import { IconHome, IconSettings } from "@/components/icons";
import { WindowControls } from "@/components/shell/WindowControls";
import { beginWindowDrag, ensureAppWindowSize, toggleMaximize } from "@/features/ui/windowDrag";

const NAV = [
  { to: "/overview", end: true, labelKey: "nav.overview" as const, Icon: IconHome },
  { to: "/settings", end: false, labelKey: "nav.settings" as const, Icon: IconSettings },
];

export function AppShell() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    void ensureAppWindowSize();
  }, []);

  return (
    <div className="vv-appShell">
      <header className="vv-titlebar">
        <div className="vv-titlebarLeft" data-no-drag>
          <div className="vv-titleBrand">
            <img src={logoUrl} alt="" className="vv-titleLogo" />
          </div>
          <nav className="vv-titleNav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={t(item.labelKey)}
                aria-label={t(item.labelKey)}
                className={({ isActive }) => `vv-iconNavBtn${isActive ? " is-active" : ""}`}
              >
                <item.Icon size={16} />
              </NavLink>
            ))}
          </nav>
        </div>
        <div
          className="vv-titleDrag"
          data-tauri-drag-region
          onPointerDown={beginWindowDrag}
          onDoubleClick={toggleMaximize}
        />
        <WindowControls />
      </header>

      <main className={`vv-content${pathname.startsWith("/settings") ? " is-settings" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
