export function formatDuration(seconds: number, locale: string): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return locale.startsWith("ru") ? `${s} сек` : `${s}s`;
  const mins = Math.floor(s / 60);
  if (mins < 60) return locale.startsWith("ru") ? `${mins} мин` : `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (locale.startsWith("ru")) {
    return rem > 0 ? `${hours} ч ${rem} мин` : `${hours} ч`;
  }
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

export function formatStatDate(unix: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale.startsWith("ru") ? "ru-RU" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(unix * 1000));
  } catch {
    return String(unix);
  }
}
