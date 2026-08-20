// Course timezone.
//
// Course dates are stored in D1 as "YYYY-MM-DD HH:MM:SS" — local (wall-clock)
// time in Poland, exactly as the administrator types it into an
// <input type="datetime-local">. It is NOT UTC. The Workers runtime, on the
// other hand, runs in UTC, so `new Date("2026-08-07T10:00:00")` is 10:00 UTC
// there, i.e. 12:00 Polish time — hence wrong hours on the page and courses
// dropping off the calendar two hours late.
//
// This module is the only place that translates between the two.
// Safe to import from client components as well.

export const TIME_ZONE = "Europe/Warsaw";

const TZ_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** The same instant expressed as Polish wall-clock time, in UTC milliseconds. */
function wallClockMs(at: Date): number {
  const p: Record<string, string> = {};
  for (const part of TZ_PARTS.formatToParts(at)) p[part.type] = part.value;
  // Some implementations return "24" instead of "00" for midnight.
  const hour = p.hour === "24" ? "00" : p.hour;
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(hour), Number(p.minute), Number(p.second));
}

/** Europe/Warsaw's offset from UTC at a given instant (+1h in winter, +2h in summer). */
export function tzOffsetMs(at: Date): number {
  return wallClockMs(at) - at.getTime();
}

/** "YYYY-MM-DD HH:MM:SS" (Polish time) → the actual instant. */
export function localSqlToDate(sql: string): Date {
  const naive = Date.parse(sql.replace(" ", "T") + "Z");
  if (Number.isNaN(naive)) return new Date(NaN);
  // Two passes: the offset can differ on the other side of a DST switch.
  const firstGuess = naive - tzOffsetMs(new Date(naive));
  return new Date(naive - tzOffsetMs(new Date(firstGuess)));
}

/** Now, as Polish wall clock in the starts_at/ends_at format — for SQL comparisons. */
export function nowLocalSql(): string {
  const now = new Date();
  return new Date(wallClockMs(now)).toISOString().slice(0, 19).replace("T", " ");
}

/** Whether the date has passed (compared as real instants, not as strings). */
export function isPastLocalSql(sql: string): boolean {
  return localSqlToDate(sql).getTime() < Date.now();
}

const DATE_FMT = new Intl.DateTimeFormat("pl-PL", { timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric" });
const TIME_FMT = new Intl.DateTimeFormat("pl-PL", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });

export function formatDate(sql: string): string {
  return DATE_FMT.format(localSqlToDate(sql));
}

export function formatTime(sql: string): string {
  return TIME_FMT.format(localSqlToDate(sql));
}

export function formatDateTime(sql: string): string {
  return `${formatDate(sql)}, ${formatTime(sql)}`;
}

/**
 * A course's date range. `withTime` adds the hours for single-day courses
 * (the course page and the e-mails); the course list shows dates only.
 * The "same day" check runs on the raw strings — they are already Polish time.
 */
export function formatRange(startsAt: string, endsAt: string, opts: { withTime?: boolean } = {}): string {
  const sameDay = startsAt.slice(0, 10) === endsAt.slice(0, 10);
  if (!sameDay) return `${formatDate(startsAt)} – ${formatDate(endsAt)}`;
  return opts.withTime ? `${formatDate(startsAt)}, ${formatTime(startsAt)}–${formatTime(endsAt)}` : formatDate(startsAt);
}
