import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSettings } from "@/lib/commands";
import type { MessageKey } from "@/i18n/messages";
import { translate } from "@/i18n/messages";

type Ctx = {
  locale: string;
  t: (key: MessageKey) => string;
  refresh: () => Promise<void>;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState("en");

  const refresh = useCallback(async () => {
    const s = await getSettings();
    setLocale(s.uiLocale || "en");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);

  const value = useMemo(() => ({ locale, t, refresh }), [locale, t, refresh]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const v = useContext(I18nContext);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
