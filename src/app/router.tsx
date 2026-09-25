import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SplashPage } from "@/pages/SplashPage";
import { PhonePage } from "@/pages/PhonePage";
import { AuthWaitPage } from "@/pages/AuthWaitPage";

function RedirectSettings({ section }: { section: string }) {
  return <Navigate to={`/settings?section=${section}`} replace />;
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/auth/wait" element={<AuthWaitPage />} />
        <Route element={<AppShell />}>
          <Route path="/overview" element={<HomePage />} />
          <Route path="/phone" element={<PhonePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/history" element={<RedirectSettings section="history" />} />
          <Route path="/dictionary" element={<RedirectSettings section="input" />} />
          <Route path="/instructions" element={<RedirectSettings section="help" />} />
          <Route path="/shortcuts" element={<RedirectSettings section="input" />} />
          <Route path="/account" element={<RedirectSettings section="about" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
