import "server-only";

// The sent-message log and the sending queue (migrations/0018).
//
// A message is first written down whole — content plus every recipient — and
// only then sent, a chunk at a time, by whoever gets to it: the browser tab
// that's showing the mailing, or the cron (src/app/api/cron/route.ts) once the
// tab is closed. Newsletter mailings stay within a daily limit, so a big list
// goes out over several days.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  BOUNCE_PAUSE_RATE, COMPLAINT_PAUSE_RATE, emptyCounts, HEALTH_MIN_SENT, MAILING_CHUNK, MAILING_RECIPIENTS_PAGE, nowUtcSql,
  type Mailing, type MailingCounts, type MailingKind, type MailingRecipientRow, type MailingStatus, type RecipientStatus,
} from "./mailings";
import type { NewsletterFilters, NewsletterRecipient } from "./newsletter";
import { buildMessageEmail, unsubscribeUrl, type NewsletterDraft, type Utm } from "./newsletter-template";
import { newsletterTokensFor, queueNewsletterRecipientsStmt } from "./newsletter-repo";
import { sendEmail } from "./brevo";
import { CONTACT, SITE } from "./site";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, string | number | null>;
const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

function toCounts(json: string | number | null | undefined): MailingCounts {
  const counts = emptyCounts();
  try {
    for (const [k, n] of Object.entries(JSON.parse(str(json) || "{}") as Record<string, number>)) {
      if (k in counts) counts[k as RecipientStatus] = n;
      counts.total += n;
    }
  } catch {}
  return counts;
}

function rowToMailing(r: Row): Mailing {
  return {
    id: str(r.id),
    kind: r.kind === "course" ? "course" : "newsletter",
    subject: str(r.subject),
    heading: str(r.heading),
    body: str(r.body),
    audience: str(r.audience),
    courseId: str(r.course_id),
    campaign: str(r.campaign),
    status: str(r.status) as MailingStatus,
    pauseReason: str(r.pause_reason),
    sendAfter: str(r.send_after),
    createdBy: str(r.created_by),
    createdAt: str(r.created_at),
    finishedAt: str(r.finished_at),
    counts: toCounts(r.counts),
  };
}

const COUNTS = `(SELECT json_group_object(status, n) FROM (
  SELECT status, count(*) AS n FROM mailing_recipients WHERE mailing_id = m.id GROUP BY status
)) AS counts`;

/** Links to the site carry the mailing's campaign — visible in Google Analytics. */
function utmFor(m: Row): Utm {
  return { source: m.kind === "newsletter" ? "newsletter" : "wiadomosc-kurs", campaign: str(m.campaign) };
}

// ----- Settings -----

export async function getDailyLimit(): Promise<number> {
  const row = await (await db()).prepare("SELECT value FROM app_settings WHERE key = 'newsletter_daily_limit'").first<{ value: string }>();
  return Number(row?.value ?? 300) || 300;
}

export async function setDailyLimit(n: number): Promise<void> {
  const value = String(Math.max(1, Math.min(100000, Math.floor(n))));
  await (await db()).prepare(
    "INSERT INTO app_settings (key, value) VALUES ('newsletter_daily_limit', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
  ).bind(value).run();
}

/**
 * E-mails from the panel that went out in the last 24 hours — of both kinds,
 * since they all count towards the provider's daily quota.
 */
export async function sentLast24h(): Promise<number> {
  const row = await (await db()).prepare(
    `SELECT count(*) AS n FROM mailing_recipients
      WHERE status IN ('sent', 'bounced', 'complained', 'sending') AND updated_at >= datetime('now', '-1 day')`,
  ).first<{ n: number }>();
  return row?.n ?? 0;
}

// ----- Creating -----

type NewMailing = {
  kind: MailingKind;
  draft: NewsletterDraft;
  audience: string;
  baseUrl: string;
  createdBy: string;
  filters?: NewsletterFilters;
  courseId?: string;
  /** UTC "YYYY-MM-DD HH:MM:SS"; omitted = now. */
  sendAfter?: string;
};

/** Lowercase ASCII slug, for utm_campaign. */
function slug(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/Ł/g, "L")
    .toLowerCase().replace(/\{\{[^}]*\}\}/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 40);
}

function insertMailingStmt(DB: D1Database, id: string, m: NewMailing): D1PreparedStatement {
  const campaign = `${m.kind}-${nowUtcSql().slice(0, 10)}-${slug(m.draft.subject) || "wiadomosc"}`;
  return DB.prepare(
    `INSERT INTO mailings (id, kind, subject, heading, body, audience, filters, course_id, base_url, campaign, send_after, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, coalesce(?, datetime('now')), ?)`,
  ).bind(
    id, m.kind, m.draft.subject, m.draft.heading, m.draft.body, m.audience,
    m.filters ? JSON.stringify(m.filters) : "", m.courseId ?? "", m.baseUrl, campaign, m.sendAfter ?? null, m.createdBy,
  );
}

/** A newsletter mailing to everyone matching the filters right now. Returns its id. */
export async function createNewsletterMailing(m: NewMailing & { filters: NewsletterFilters }): Promise<string> {
  const DB = await db();
  const id = "mlg" + crypto.randomUUID();
  // One transaction: the mailing never exists without its recipients.
  await DB.batch([insertMailingStmt(DB, id, m), await queueNewsletterRecipientsStmt(id, m.filters)]);
  return id;
}

/** A message to chosen course participants (already looked up by the caller). */
export async function createCourseMailing(
  m: NewMailing & { courseId: string },
  recipients: { bookingId: string; recipient: NewsletterRecipient }[],
): Promise<string> {
  const DB = await db();
  const id = "mlg" + crypto.randomUUID();
  await DB.batch([
    insertMailingStmt(DB, id, m),
    ...recipients.map(({ bookingId, recipient }, i) =>
      DB.prepare("INSERT OR IGNORE INTO mailing_recipients (mailing_id, email, ref, data, ord) VALUES (?, ?, ?, ?, ?)")
        .bind(id, recipient.email, bookingId, JSON.stringify(recipient), i),
    ),
  ]);
  return id;
}

// ----- Reading -----

export async function getMailing(id: string): Promise<Mailing | null> {
  const row = await (await db()).prepare(`SELECT m.*, ${COUNTS} FROM mailings m WHERE m.id = ?`).bind(id).first<Row>();
  return row ? rowToMailing(row) : null;
}

/** Most recent first. A few mailings a year plus course messages — a page is plenty. */
export async function listMailings(): Promise<Mailing[]> {
  const { results } = await (await db()).prepare(
    `SELECT m.*, ${COUNTS} FROM mailings m ORDER BY m.created_at DESC LIMIT 200`,
  ).all<Row>();
  return (results ?? []).map(rowToMailing);
}

export async function listMailingRecipients(
  id: string,
  opts: { page: number; status: RecipientStatus | ""; q: string },
): Promise<{ rows: MailingRecipientRow[]; total: number }> {
  const DB = await db();
  const like = opts.q.trim() ? "%" + opts.q.trim().toLowerCase().replace(/[\\%_]/g, "\\$&") + "%" : "";
  const where = `WHERE mailing_id = ?1 AND (?2 = '' OR status = ?2) AND (?3 = '' OR lower(email) LIKE ?3 ESCAPE '\\')`;
  const page = Math.max(1, Math.floor(opts.page) || 1);
  const [rows, count] = await DB.batch<Row>([
    DB.prepare(`SELECT email, data, status, error, updated_at FROM mailing_recipients ${where} ORDER BY ord LIMIT ?4 OFFSET ?5`)
      .bind(id, opts.status, like, MAILING_RECIPIENTS_PAGE, (page - 1) * MAILING_RECIPIENTS_PAGE),
    DB.prepare(`SELECT count(*) AS n FROM mailing_recipients ${where}`).bind(id, opts.status, like),
  ]);
  return {
    total: Number(count.results?.[0]?.n ?? 0),
    rows: (rows.results ?? []).map((r) => {
      let name = "";
      try {
        const d = JSON.parse(str(r.data)) as NewsletterRecipient;
        name = `${d.firstName} ${d.lastName}`.trim();
      } catch {}
      return { email: str(r.email), name, status: str(r.status) as RecipientStatus, error: str(r.error), updatedAt: str(r.updated_at) };
    }),
  };
}

/** The mailing's e-mail as its first recipient gets it — for its page in the panel. */
export async function mailingPreview(id: string): Promise<{ html: string; subject: string; email: string } | null> {
  const DB = await db();
  const m = await DB.prepare("SELECT * FROM mailings WHERE id = ?").bind(id).first<Row>();
  const first = await DB.prepare("SELECT email, data FROM mailing_recipients WHERE mailing_id = ? ORDER BY ord LIMIT 1").bind(id).first<Row>();
  if (!m || !first) return null;
  const baseUrl = str(m.base_url);
  const { html, subject } = buildMessageEmail(
    { subject: str(m.subject), heading: str(m.heading), body: str(m.body) },
    JSON.parse(str(first.data)) as NewsletterRecipient,
    { baseUrl, unsubscribeUrl: m.kind === "newsletter" ? unsubscribeUrl(baseUrl, "podglad") : undefined, utm: utmFor(m) },
  );
  return { html, subject, email: str(first.email) };
}

// ----- Controls -----

export async function pauseMailing(id: string, reason = ""): Promise<void> {
  await (await db()).prepare("UPDATE mailings SET status = 'paused', pause_reason = ? WHERE id = ? AND status = 'sending'").bind(reason, id).run();
}

export async function resumeMailing(id: string): Promise<void> {
  await (await db()).prepare("UPDATE mailings SET status = 'sending', pause_reason = '' WHERE id = ? AND status = 'paused'").bind(id).run();
}

/** Stops for good; whoever hadn't got it yet is marked skipped. */
export async function cancelMailing(id: string): Promise<void> {
  const DB = await db();
  await DB.batch([
    DB.prepare("UPDATE mailings SET status = 'cancelled', finished_at = datetime('now') WHERE id = ? AND status IN ('sending', 'paused')").bind(id),
    DB.prepare("UPDATE mailing_recipients SET status = 'skipped', error = 'anulowano', updated_at = datetime('now') WHERE mailing_id = ? AND status = 'queued'").bind(id),
  ]);
}

/** Puts the failed recipients back in the queue and resumes sending. */
export async function retryFailed(id: string): Promise<void> {
  const DB = await db();
  await DB.batch([
    DB.prepare("UPDATE mailing_recipients SET status = 'queued', error = '' WHERE mailing_id = ? AND status = 'failed'").bind(id),
    DB.prepare("UPDATE mailings SET status = 'sending', finished_at = NULL WHERE id = ? AND status IN ('done', 'paused')").bind(id),
  ]);
}

// ----- Sending -----

/**
 * A recipient claimed for sending whose request then died (timeout, deploy)
 * is stuck in "sending". After a while it's marked failed rather than put
 * back, because the e-mail may well have gone out — a retry is then a
 * deliberate choice in the panel, not a silent double send.
 */
async function releaseStale(DB: D1Database): Promise<void> {
  await DB.prepare(
    `UPDATE mailing_recipients SET status = 'failed', error = 'przerwane — nie wiadomo, czy wysłano', updated_at = datetime('now')
      WHERE status = 'sending' AND updated_at < datetime('now', '-15 minutes')`,
  ).run();
}

export type ProcessResult = {
  /** Why nothing was sent this time, if so. */
  waiting: "" | "scheduled" | "limit" | "stopped";
  sent: number;
  /** Recipients dealt with this time, whatever the outcome. */
  processed: number;
};

/**
 * Sends the next chunk of a mailing: claims up to `max` queued recipients,
 * renders each one's e-mail and sends it. Newsletter mailings skip anyone who
 * has unsubscribed since the mailing was queued, carry each recipient's own
 * unsubscribe link, and stay within the daily limit.
 */
export async function processMailing(id: string, max = MAILING_CHUNK): Promise<ProcessResult> {
  const DB = await db();
  await releaseStale(DB);
  const m = await DB.prepare("SELECT * FROM mailings WHERE id = ?").bind(id).first<Row>();
  if (!m || m.status !== "sending") return { waiting: "stopped", sent: 0, processed: 0 };
  if (str(m.send_after) > nowUtcSql()) return { waiting: "scheduled", sent: 0, processed: 0 };

  const newsletter = m.kind === "newsletter";
  let allowance = max;
  if (newsletter) {
    allowance = Math.min(max, (await getDailyLimit()) - (await sentLast24h()));
    if (allowance <= 0) return { waiting: "limit", sent: 0, processed: 0 };
  }

  const { results: claimed } = await DB.prepare(
    `UPDATE mailing_recipients SET status = 'sending', updated_at = datetime('now')
      WHERE mailing_id = ?1 AND status = 'queued' AND email IN (
        SELECT email FROM mailing_recipients WHERE mailing_id = ?1 AND status = 'queued' ORDER BY ord LIMIT ?2
      )
      RETURNING email, data`,
  ).bind(id, allowance).all<{ email: string; data: string }>();

  const results: { email: string; status: RecipientStatus; error: string }[] = [];
  if (claimed?.length) {
    const emails = claimed.map((c) => c.email);
    let suppressed = new Set<string>();
    let tokens = new Map<string, string>();
    if (newsletter) {
      const { results: sup } = await DB.prepare(
        "SELECT email FROM newsletter_suppressions WHERE email IN (SELECT value FROM json_each(?))",
      ).bind(JSON.stringify(emails)).all<{ email: string }>();
      suppressed = new Set((sup ?? []).map((s) => s.email.toLowerCase()));
      tokens = await newsletterTokensFor(emails.filter((e) => !suppressed.has(e.toLowerCase())));
    }

    const draft: NewsletterDraft = { subject: str(m.subject), heading: str(m.heading), body: str(m.body) };
    const baseUrl = str(m.base_url);
    for (const c of claimed) {
      if (suppressed.has(c.email.toLowerCase())) {
        results.push({ email: c.email, status: "skipped", error: "wypisany(-a) przed wysyłką" });
        continue;
      }
      try {
        const r = JSON.parse(c.data) as NewsletterRecipient;
        const token = tokens.get(c.email.toLowerCase());
        const { subject, html, text } = buildMessageEmail(draft, r, {
          baseUrl,
          unsubscribeUrl: newsletter && token ? unsubscribeUrl(baseUrl, token) : undefined,
          utm: utmFor(m),
        });
        if (newsletter && !token) throw new Error("brak linku wypisu");
        await sendEmail({
          to: c.email,
          toName: `${r.firstName} ${r.lastName}`.trim() || undefined,
          subject,
          html,
          text,
          replyTo: { email: CONTACT.email, name: SITE.name },
        });
        results.push({ email: c.email, status: "sent", error: "" });
      } catch (e) {
        console.error("mailing e-mail failed to send", id, c.email, e);
        results.push({ email: c.email, status: "failed", error: String(e instanceof Error ? e.message : e).slice(0, 300) });
      }
    }
    await DB.batch(
      results.map((r) =>
        DB.prepare("UPDATE mailing_recipients SET status = ?, error = ?, updated_at = datetime('now') WHERE mailing_id = ? AND email = ?")
          .bind(r.status, r.error, id, r.email),
      ),
    );
  }

  // Nothing left to send → the mailing is done.
  await DB.prepare(
    `UPDATE mailings SET status = 'done', finished_at = datetime('now')
      WHERE id = ?1 AND status = 'sending'
        AND NOT EXISTS (SELECT 1 FROM mailing_recipients WHERE mailing_id = ?1 AND status IN ('queued', 'sending'))`,
  ).bind(id).run();

  return { waiting: "", sent: results.filter((r) => r.status === "sent").length, processed: results.length };
}

/**
 * The cron's share: works through every mailing that's due, oldest first,
 * up to `budget` e-mails in total.
 */
export async function processDueMailings(budget = MAILING_CHUNK * 2): Promise<number> {
  const { results } = await (await db()).prepare(
    "SELECT id FROM mailings WHERE status = 'sending' AND send_after <= datetime('now') ORDER BY created_at",
  ).all<{ id: string }>();
  let sent = 0;
  for (const { id } of results ?? []) {
    while (sent < budget) {
      const res = await processMailing(id, Math.min(MAILING_CHUNK, budget - sent));
      sent += res.processed;
      if (res.waiting || res.processed === 0) break;
    }
  }
  return sent;
}

// ----- Provider feedback -----

/**
 * The provider reported a hard bounce or a spam complaint for an address:
 * mark it on the mailings it was recently sent, and stop any newsletter
 * mailing that has gone over the safe rate.
 */
export async function recordProviderEvent(email: string, status: "bounced" | "complained"): Promise<void> {
  const DB = await db();
  const { results } = await DB.prepare(
    `UPDATE mailing_recipients SET status = ?, updated_at = datetime('now')
      WHERE email = ? AND status = 'sent' AND updated_at >= datetime('now', '-14 days')
      RETURNING mailing_id`,
  ).bind(status, email.trim()).all<{ mailing_id: string }>();
  for (const id of new Set((results ?? []).map((r) => r.mailing_id))) await pauseIfUnhealthy(id);
}

/**
 * Brevo suspends accounts with too many bounces or complaints — which would
 * also stop booking confirmations. A newsletter mailing past the safe rates
 * pauses itself, with the reason shown in the panel.
 */
async function pauseIfUnhealthy(id: string): Promise<void> {
  const m = await getMailing(id);
  if (!m || m.kind !== "newsletter" || m.status !== "sending") return;
  const { sent, bounced, complained } = m.counts;
  const out = sent + bounced + complained;
  if (out < HEALTH_MIN_SENT) return;
  const pct = (n: number) => `${((n / out) * 100).toFixed(1).replace(".", ",")}%`;
  if (bounced / out > BOUNCE_PAUSE_RATE) {
    await pauseMailing(id, `Za dużo adresów nie istnieje (${pct(bounced)} odbitych wiadomości). Lista może być nieaktualna — dalsza wysyłka grozi zablokowaniem konta w Brevo.`);
  } else if (complained / out > COMPLAINT_PAUSE_RATE) {
    await pauseMailing(id, `Za dużo zgłoszeń jako spam (${pct(complained)}). Dalsza wysyłka grozi zablokowaniem konta w Brevo.`);
  }
}
