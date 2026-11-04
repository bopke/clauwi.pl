// Shared types for the sent-message log and sending queue (client + server).
// See migrations/0018_mailings.sql for how it works.

export type MailingKind = "newsletter" | "course";
export type MailingStatus = "sending" | "paused" | "done" | "cancelled";
export type RecipientStatus = "queued" | "sending" | "sent" | "failed" | "skipped" | "bounced" | "complained";

export type MailingCounts = Record<RecipientStatus, number> & { total: number };

export type Mailing = {
  id: string;
  kind: MailingKind;
  subject: string;
  heading: string;
  body: string;
  audience: string;
  courseId: string;
  campaign: string;
  status: MailingStatus;
  pauseReason: string;
  /** UTC "YYYY-MM-DD HH:MM:SS"; later than now = scheduled. */
  sendAfter: string;
  createdBy: string;
  createdAt: string;
  finishedAt: string;
  counts: MailingCounts;
};

export type MailingRecipientRow = {
  email: string;
  name: string;
  status: RecipientStatus;
  error: string;
  updatedAt: string;
};

export const MAILING_RECIPIENTS_PAGE = 50;

/**
 * E-mails sent per request (one browser call or one cron step) — keeps each
 * request well inside the Workers limit on outgoing calls.
 */
export const MAILING_CHUNK = 20;

/** Newsletter mailings stop on their own past these rates (see pauseIfUnhealthy). */
export const BOUNCE_PAUSE_RATE = 0.05;
export const COMPLAINT_PAUSE_RATE = 0.005;
/** …once at least this many have gone out, so a single bounce can't trip it. */
export const HEALTH_MIN_SENT = 100;

export const RECIPIENT_STATUS_LABELS: Record<RecipientStatus, string> = {
  queued: "W kolejce",
  sending: "Wysyłanie",
  sent: "Wysłano",
  failed: "Błąd",
  skipped: "Pominięto",
  bounced: "Odbite",
  complained: "Zgłoszone jako spam",
};

export function emptyCounts(): MailingCounts {
  return { queued: 0, sending: 0, sent: 0, failed: 0, skipped: 0, bounced: 0, complained: 0, total: 0 };
}

/** Status in words, telling a scheduled mailing apart from one in progress. */
export function mailingStatusLabel(m: Pick<Mailing, "status" | "sendAfter">, nowUtc: string): string {
  if (m.status === "sending") return m.sendAfter > nowUtc ? "Zaplanowana" : "W trakcie wysyłki";
  return m.status === "paused" ? "Wstrzymana" : m.status === "done" ? "Wysłana" : "Anulowana";
}

/** "now" in the format SQLite's datetime('now') uses (UTC). */
export function nowUtcSql(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}
