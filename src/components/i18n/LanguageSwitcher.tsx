import { useState } from "react";
import { useI18n } from "@/i18n/I18nContext";

type Props = { compact?: boolean };

export function LanguageSwitcher({ compact }: Props) {
  const { locale, setUiLocale, t } = useI18n();
  const active = locale.toLowerCase().startsWith("ru") ? "ru" : "en";
  const [pending, setPending] = useState(false);

  async function pick(code: "en" | "ru") {
    if (code === active || pending) return;
    setPending(true);
    try {
      await setUiLocale(code);
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={`vv-seg${pending ? " is-pending" : ""}`}
      role="group"
      aria-label={t("nav.language")}
      style={compact ? { width: "auto" } : undefined}
    >
      {(["en", "ru"] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={`vv-segBtn${active === code ? " is-active" : ""}`}
          onClick={() => void pick(code)}
        >
          {code === "en" ? t("settings.uiLocaleEn") : t("settings.uiLocaleRu")}
        </button>
      ))}
    </div>
  );
}
