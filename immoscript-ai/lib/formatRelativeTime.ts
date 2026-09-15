const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

export function formatRelativeTime(date: Date): string {
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 60) return "à l'instant";

  for (const [unit, unitSeconds] of UNITS) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) {
      return rtf.format(-value, unit);
    }
  }
  return "à l'instant";
}
