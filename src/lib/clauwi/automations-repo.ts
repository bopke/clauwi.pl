import "server-only";

// The automatic e-mails (migrations/0021): settings, and the run that sends
// whatever is due. Course e-mails are run by the cron (src/app/api/cron);
// the welcome e-mail is sent right when a sign-up is confirmed.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Automation, AutomationKey, AutomationOptions, AutomationSend } from "./automations";
import type { NewsletterRecipient } from "./newsletter";
import { buildMessageEmail, unsubscribeUrl, type NewsletterDraft } from "./newsletter-template";
import { newsletterTokenFor } from "./newsletter-repo";
import { sendEmail } from "./brevo";
import { CONTACT, SITE } from "./site";
import { localSqlAt } from "./time";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, string | number | null>;
const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));
const DAY = 24 * 60 * 60 * 1000;
/** Per automation per run — the cron comes back in five minutes anyway. */
const RUN_LIMIT = 10;

function rowToAutomation(r: Row): Automation {
  let options: AutomationOptions = {};
  try {
    options = JSON.parse(str(r.options) || "{}");
  } catch {}
  return {
    key: str(r.key) as AutomationKey,
    enabled: !!r.enabled,
    days: Number(r.days ?? 0),
    subject: str(r.subject),
    heading: str(r.heading),
    body: str(r.body),
    options,
    enabledAt: str(r.enabled_at),
    updatedBy: str(r.updated_by),
    updatedAt: str(r.updated_at),
    sent30d: Number(r.sent30d ?? 0),
  };
}

const SELECT = `SELECT a.*, (SELECT count(*) FROM automation_sends s WHERE s.automation = a.key AND s.status = 'sent'
  AND s.created_at >= datetime('now', '-30 days')) AS sent30d FROM automations a`;

export async function listAutomations(): Promise<Automation[]> {
  const { results } = await (await db()).prepare(SELECT).all<Row>();
  return (results ?? []).map(rowToAutomation);
}

export async function getAutomation(key: AutomationKey): Promise<Automation | null> {
  const row = await (await db()).prepare(`${SELECT} WHERE a.key = ?`).bind(key).first<Row>();
  return row ? rowToAutomation(row) : null;
}

/** Saves the wording and settings. Switching on (re)sets enabled_at — see the migration. */
export async function saveAutomation(
  key: AutomationKey,
  a: { enabled: boolean; days: number; options: AutomationOptions; draft: NewsletterDraft },
  by: string,
): Promise<void> {
  await (await db()).prepare(
    `UPDATE automations SET
       enabled_at = CASE WHEN ?2 = 1 AND enabled = 0 THEN datetime('now') ELSE enabled_at END,
       enabled = ?2, days = ?3, options = ?4, subject = ?5, heading = ?6, body = ?7,
       updated_by = ?8, updated_at = datetime('now')
     WHERE key = ?1`,
  ).bind(
    key, a.enabled ? 1 : 0, Math.max(0, Math.min(365, Math.floor(a.days) || 0)), JSON.stringify(a.options),
    a.draft.subject, a.draft.heading, a.draft.body, by,
  ).run();
}

export async function listAutomationSends(key: AutomationKey): Promise<AutomationSend[]> {
  const { results } = await (await db()).prepare(
    "SELECT email, ref, status, error, created_at FROM automation_sends WHERE automation = ? ORDER BY created_at DESC LIMIT 50",
  ).bind(key).all<Row>();
  return (results ?? []).map((r) => ({ email: str(r.email), ref: str(r.ref), status: str(r.status), error: str(r.error), createdAt: str(r.created_at) }));
}

// ----- Sending -----

/**
 * Sends one automatic e-mail, at most once per (automation, ref): the row is
 * claimed first, so overlapping runs can't send it twice.
 */
async function sendOnce(
  a: Automation,
  ref: string,
  r: NewsletterRecipient,
  baseUrl: string,
): Promise<"sent" | "failed" | "duplicate"> {
  const DB = await db();
  const claim = await DB.prepare("INSERT OR IGNORE INTO automation_sends (automation, ref, email, status) VALUES (?, ?, ?, 'sending')")
    .bind(a.key, ref, r.email).run();
  if (claim.meta.changes === 0) return "duplicate";
  let status: "sent" | "failed" = "sent";
  let error = "";
  try {
    const marketing = a.key === "welcome" || a.key === "course-next-step";
    const { subject, html, text } = buildMessageEmail(a, r, {
      baseUrl,
      unsubscribeUrl: marketing ? unsubscribeUrl(baseUrl, await newsletterTokenFor(r.email)) : undefined,
      utm: { source: "automat", campaign: a.key },
    });
    await sendEmail({
      to: r.email,
      toName: `${r.firstName} ${r.lastName}`.trim() || undefined,
      subject,
      html,
      text,
      replyTo: { email: CONTACT.email, name: SITE.name },
    });
  } catch (e) {
    console.error("automatic e-mail failed to send", a.key, r.email, e);
    status = "failed";
    error = String(e instanceof Error ? e.message : e).slice(0, 300);
  }
  await DB.prepare("UPDATE automation_sends SET status = ?, error = ? WHERE automation = ? AND ref = ?").bind(status, error, a.key, ref).run();
  return status;
}

/** Welcome e-mail after a confirmed sign-up — if it's switched on. */
export async function sendWelcome(email: string, baseUrl: string): Promise<void> {
  const a = await getAutomation("welcome");
  if (!a?.enabled) return;
  await sendOnce(a, email.toLowerCase(), { email, firstName: "", lastName: "", course: null }, baseUrl);
}

/** Bookings an automation is due for, joined with their course. */
async function dueBookings(a: Automation): Promise<Row[]> {
  const DB = await db();
  const now = new Date();
  const sent = `NOT EXISTS (SELECT 1 FROM automation_sends s WHERE s.automation = '${a.key}' AND s.ref = b.id)`;
  const base = `SELECT b.id, b.email, b.first_name, b.last_name, c.name, c.type, c.location, c.starts_at, c.ends_at
                  FROM course_bookings b JOIN courses c ON c.id = b.course_id`;

  if (a.key === "course-reminder") {
    // Starting within `days`, booked a few hours ago at least (not on top of the confirmation).
    const { results } = await DB.prepare(
      `${base} WHERE b.status != 'cancelled' AND c.starts_at > ?1 AND c.starts_at <= ?2
         AND b.created_at <= datetime('now', '-6 hours') AND ${sent}
       ORDER BY c.starts_at LIMIT ${RUN_LIMIT}`,
    ).bind(localSqlAt(now), localSqlAt(new Date(now.getTime() + a.days * DAY))).all<Row>();
    return results ?? [];
  }

  // After the course: ended at least `days` ago, but after the automation was
  // switched on and not more than a week too late (the cron was down…).
  const enabledAt = new Date(a.enabledAt.replace(" ", "T") + "Z");
  if (Number.isNaN(enabledAt.getTime())) return [];
  const from = localSqlAt(new Date(Math.max(enabledAt.getTime(), now.getTime() - (a.days + 7) * DAY)));
  const until = localSqlAt(new Date(now.getTime() - a.days * DAY));
  if (a.key === "course-thanks") {
    const { results } = await DB.prepare(
      `${base} WHERE b.status = 'confirmed' AND c.ends_at > ?1 AND c.ends_at <= ?2 AND ${sent}
       ORDER BY c.ends_at LIMIT ${RUN_LIMIT}`,
    ).bind(from, until).all<Row>();
    return results ?? [];
  }

  // course-next-step: marketing — consent, not unsubscribed, no later course of the skip type.
  const { results } = await DB.prepare(
    `${base} WHERE b.status = 'confirmed' AND b.marketing_consent = 1 AND c.ends_at > ?1 AND c.ends_at <= ?2
       AND (?3 = '' OR c.type = ?3)
       AND NOT EXISTS (SELECT 1 FROM newsletter_suppressions x WHERE x.email = b.email)
       AND NOT EXISTS (
         SELECT 1 FROM course_bookings b2 JOIN courses c2 ON c2.id = b2.course_id
          WHERE lower(b2.email) = lower(b.email) AND b2.status != 'cancelled' AND c2.starts_at > c.starts_at
            AND (?4 = '' OR c2.type = ?4)
       )
       AND ${sent}
     ORDER BY c.ends_at LIMIT ${RUN_LIMIT}`,
  ).bind(from, until, a.options.afterType ?? "", a.options.skipIfType ?? "").all<Row>();
  return results ?? [];
}

/** The cron's share: every switched-on course automation, whatever is due. */
export async function runCourseAutomations(baseUrl: string): Promise<number> {
  let sent = 0;
  for (const a of await listAutomations()) {
    if (!a.enabled || a.key === "welcome") continue;
    for (const b of await dueBookings(a)) {
      const recipient: NewsletterRecipient = {
        email: str(b.email),
        firstName: str(b.first_name),
        lastName: str(b.last_name),
        course: { name: str(b.name), type: str(b.type), location: str(b.location), startsAt: str(b.starts_at), endsAt: str(b.ends_at) },
      };
      if ((await sendOnce(a, str(b.id), recipient, baseUrl)) === "sent") sent++;
    }
  }
  return sent;
}
