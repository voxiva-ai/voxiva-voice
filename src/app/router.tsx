import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { DictionaryPage } from "@/pages/DictionaryPage";
import { InstructionsPage } from "@/pages/InstructionsPage";
import { ShortcutsPage } from "@/pages/ShortcutsPage";
import { AccountPage } from "@/pages/AccountPage";
import { WelcomePage } from "@/pages/WelcomePage";
import { AuthWaitPage } from "@/pages/AuthWaitPage";
import { LaunchGate } from "@/pages/LaunchGate";

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LaunchGate />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth/wait" element={<AuthWaitPage />} />
        <Route element={<AppShell />}>
          <Route path="/overview" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          <Route path="/shortcuts" element={<ShortcutsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
