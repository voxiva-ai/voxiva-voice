import { AppRouter } from "@/app/router";
import { useEffect } from "react";
import { getSettings } from "@/lib/commands";
import { applyTheme } from "@/theme/applyTheme";

export default function App() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (!cancelled) applyTheme(s.uiTheme);
      } catch {
        if (!cancelled) applyTheme("bridgemind");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return <AppRouter />;
}
