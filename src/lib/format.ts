// All dates in the prototype are fixed so server and client render identically.
export const NOW = new Date("2026-10-29T10:24:00+02:00");

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurCompact = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(value: number, opts?: { sign?: boolean; compact?: boolean }) {
  const f = opts?.compact ? eurCompact : eur;
  const s = f.format(Math.abs(value));
  if (opts?.sign) return (value < 0 ? "−" : value > 0 ? "+" : "") + s;
  return value < 0 ? "−" + s : s;
}

/** Splits a formatted amount so the cents can be rendered smaller (Revolut-style). */
export function moneyParts(value: number) {
  const s = eur.format(Math.abs(value));
  const i = s.lastIndexOf(".");
  return {
    negative: value < 0,
    whole: i === -1 ? s : s.slice(0, i),
    cents: i === -1 ? "" : s.slice(i),
  };
}

const TZ = "Europe/Tallinn";

export function fmtDate(iso: string, style: "short" | "long" | "day" = "short") {
  const d = new Date(iso);
  if (style === "day") {
    return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(d);
  }
  if (style === "long") {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).format(d);
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ }).format(d);
}

export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function fmtDateTime(iso: string) {
  return `${fmtDate(iso, "long")}, ${fmtTime(iso)}`;
}

/** "Today", "Yesterday" or a weekday/date label for grouping lists. */
export function dayLabel(iso: string) {
  const key = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
  const today = key(NOW);
  const yesterday = key(new Date(NOW.getTime() - 86_400_000));
  const k = key(new Date(iso));
  if (k === today) return "Today";
  if (k === yesterday) return "Yesterday";
  return fmtDate(iso, "day");
}

export function relative(iso: string) {
  const diff = Math.round((NOW.getTime() - new Date(iso).getTime()) / 1000);
  if (diff < 0) {
    const ahead = -diff;
    if (ahead < 3600) return `in ${Math.max(1, Math.round(ahead / 60))}m`;
    if (ahead < 86400) return `in ${Math.round(ahead / 3600)}h`;
    return `in ${Math.round(ahead / 86400)}d`;
  }
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)}d ago`;
  return fmtDate(iso, "long");
}

export function groupBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return [...map.entries()];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function iban(raw: string) {
  return raw.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}
