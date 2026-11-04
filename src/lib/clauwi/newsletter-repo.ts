import "server-only";

// D1 access for newsletter sign-ups.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ConsentEntry, ConsentSource } from "./consent";
import { NEWSLETTER_PAGE_SIZE, type NewsletterCourse, type NewsletterFilters, type NewsletterPage, type NewsletterQuery, type NewsletterRecipient } from "./newsletter";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

// ----- Consent log (migrations/0017) -----

type ConsentRecord = {
  email: string;
  action: "granted" | "withdrawn";
  source: ConsentSource;
  ref?: string;
  wording?: string;
  ip?: string;
  note?: string;
};

function consentStmt(DB: D1Database, c: ConsentRecord): D1PreparedStatement {
  return DB.prepare("INSERT INTO consent_log (email, action, source, ref, wording, ip, note) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(c.email.trim(), c.action, c.source, c.ref ?? "", c.wording ?? "", c.ip ?? "", c.note ?? "");
}

/** Adds an entry to the consent log — every consent given, with its wording. */
export async function recordConsent(c: ConsentRecord): Promise<void> {
  await consentStmt(await db(), c).run();
}

/** An address's consent history, oldest first. */
export async function consentHistory(email: string): Promise<ConsentEntry[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    "SELECT action, source, ref, wording, ip, note, created_at FROM consent_log WHERE email = ? ORDER BY created_at, id",
  ).bind(email.trim()).all<Record<string, string>>();
  return (results ?? []).map((r) => ({
    action: r.action === "withdrawn" ? "withdrawn" : "granted",
    source: r.source as ConsentSource,
    ref: r.ref,
    wording: r.wording,
    ip: r.ip,
    note: r.note,
    createdAt: r.created_at,
  }));
}

/**
 * Stores a newsletter-card sign-up; an address already on the list is left as
 * is. Signing up is fresh consent, so it lifts an earlier unsubscribe. The
 * caller records the consent itself (recordConsent).
 */
export async function addNewsletterSubscriber(email: string): Promise<void> {
  const DB = await db();
  await DB.batch([
    DB.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)").bind(email),
    DB.prepare("DELETE FROM newsletter_suppressions WHERE email = ?").bind(email),
  ]);
}

// ----- Unsubscribing -----

export type SuppressionReason = "link" | "one-click" | "admin" | "provider-unsubscribe" | "provider-spam" | "provider-bounce";

/**
 * Stops mailings to an address. Repeating it keeps the first reason and date
 * (and logs the withdrawal only once).
 */
export async function suppressNewsletterEmail(email: string, reason: SuppressionReason, ref = ""): Promise<void> {
  const DB = await db();
  const res = await DB.prepare("INSERT OR IGNORE INTO newsletter_suppressions (email, reason) VALUES (?, ?)").bind(email.trim(), reason).run();
  if (res.meta.changes > 0) await consentStmt(DB, { email, action: "withdrawn", source: reason, ref }).run();
}

/** Lifts a suppression — the person signed up again or undid the unsubscribe. */
export async function unsuppressNewsletterEmail(email: string): Promise<void> {
  const DB = await db();
  await DB.prepare("DELETE FROM newsletter_suppressions WHERE email = ?").bind(email).run();
}

/** The address's unsubscribe token, created on first use. */
export async function newsletterTokenFor(email: string): Promise<string> {
  const DB = await db();
  // 24 random bytes, URL-safe — unguessable, and no e-mail address in the link.
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const fresh = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  await DB.prepare("INSERT OR IGNORE INTO newsletter_tokens (token, email) VALUES (?, ?)").bind(fresh, email.trim()).run();
  const row = await DB.prepare("SELECT token FROM newsletter_tokens WHERE email = ?").bind(email.trim()).first<{ token: string }>();
  return row!.token;
}

/** Unsubscribe tokens for many addresses at once (created where missing), keyed by lowercased address. */
export async function newsletterTokensFor(emails: string[]): Promise<Map<string, string>> {
  const DB = await db();
  if (emails.length === 0) return new Map();
  await DB.batch(
    emails.map((email) => {
      const bytes = crypto.getRandomValues(new Uint8Array(24));
      const fresh = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      return DB.prepare("INSERT OR IGNORE INTO newsletter_tokens (token, email) VALUES (?, ?)").bind(fresh, email.trim());
    }),
  );
  const { results } = await DB.prepare("SELECT token, email FROM newsletter_tokens WHERE email IN (SELECT value FROM json_each(?))")
    .bind(JSON.stringify(emails.map((e) => e.trim()))).all<{ token: string; email: string }>();
  return new Map((results ?? []).map((r) => [r.email.toLowerCase(), r.token]));
}

/** Who an unsubscribe token belongs to, and whether they're already unsubscribed. */
export async function findNewsletterToken(token: string): Promise<{ email: string; suppressed: boolean } | null> {
  const DB = await db();
  const row = await DB.prepare(
    `SELECT t.email, s.email IS NOT NULL AS suppressed
       FROM newsletter_tokens t LEFT JOIN newsletter_suppressions s ON s.email = t.email
      WHERE t.token = ?`,
  ).bind(token).first<{ email: string; suppressed: number }>();
  return row ? { email: row.email, suppressed: !!row.suppressed } : null;
}

// Everyone who agreed to marketing e-mails: newsletter-bar sign-ups plus course
// bookings with the marketing checkbox ticked, as one list — minus anyone who
// has since unsubscribed.
const ENTRIES = `
  SELECT 'widget' AS source, email, created_at,
         NULL AS name, NULL AS first_name, NULL AS last_name,
         NULL AS course_id, NULL AS course_name, NULL AS course_type,
         NULL AS course_starts_at, NULL AS course_ends_at, NULL AS course_location
    FROM newsletter_subscribers n
   WHERE NOT EXISTS (SELECT 1 FROM newsletter_suppressions s WHERE s.email = n.email)
  UNION ALL
  SELECT 'course', b.email, b.created_at,
         b.first_name || ' ' || b.last_name, b.first_name, b.last_name,
         c.id, c.name, c.type,
         c.starts_at, c.ends_at, c.location
    FROM course_bookings b JOIN courses c ON c.id = b.course_id
   WHERE b.marketing_consent = 1
     AND NOT EXISTS (SELECT 1 FROM newsletter_suppressions s WHERE s.email = b.email)`;

// Every filter is always bound; an empty value switches it off.
const WHERE = `
  WHERE (?1 = '' OR source = ?1)
    AND (?2 = '' OR course_type = ?2)
    AND (?3 = '[]' OR course_id IN (SELECT value FROM json_each(?3)))
    AND (?4 = '' OR lower(email) LIKE ?4 ESCAPE '\\' OR lower(name) LIKE ?4 ESCAPE '\\')`;

/**
 * One page of the list, newest first, filtered in SQL — the list is meant to
 * hold an imported archive too, so it's never loaded whole.
 */
/** The ?1–?4 values for WHERE. */
function whereParams(f: NewsletterFilters): string[] {
  const like = f.q.trim() ? "%" + f.q.trim().toLowerCase().replace(/[\\%_]/g, "\\$&") + "%" : "";
  return [f.source, f.courseType, JSON.stringify(f.courseIds.slice(0, 2000)), like];
}

export async function adminListNewsletter(query: NewsletterQuery): Promise<NewsletterPage> {
  const DB = await db();
  const params = whereParams(query);
  const page = Math.max(1, Math.floor(query.page) || 1);

  const [rows, counts] = await DB.batch<Record<string, string | number | null>>([
    DB.prepare(`SELECT * FROM (${ENTRIES}) ${WHERE} ORDER BY created_at DESC, email LIMIT ?5 OFFSET ?6`)
      .bind(...params, NEWSLETTER_PAGE_SIZE, (page - 1) * NEWSLETTER_PAGE_SIZE),
    DB.prepare(`SELECT count(*) AS total, count(DISTINCT lower(email)) AS uniq FROM (${ENTRIES}) ${WHERE}`)
      .bind(...params),
  ]);

  const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));
  return {
    entries: (rows.results ?? []).map((r) => ({
      email: str(r.email),
      createdAt: str(r.created_at),
      source: r.source === "course" ? "course" : "widget",
      ...(r.source === "course" && {
        name: str(r.name),
        courseId: str(r.course_id),
        courseName: str(r.course_name),
        courseType: str(r.course_type),
        courseStartsAt: str(r.course_starts_at),
      }),
    })),
    total: Number(counts.results?.[0]?.total ?? 0),
    uniqueEmails: Number(counts.results?.[0]?.uniq ?? 0),
  };
}

// One row per address matching the filters (WHERE's ?1–?4): its most recent
// matching course, and `latest` — its newest consent.
const RECIPIENTS = `
  SELECT * FROM (
    SELECT *,
           row_number() OVER (
             PARTITION BY lower(email)
             ORDER BY course_starts_at IS NULL, course_starts_at DESC, created_at DESC
           ) AS rn,
           max(created_at) OVER (PARTITION BY lower(email)) AS latest
      FROM (${ENTRIES}) ${WHERE}
  ) WHERE rn = 1`;

/**
 * Statement that queues everyone matching the filters as recipients of a
 * mailing (see migrations/0018), each with their details frozen as JSON.
 * Most recent consent goes first, so if a mailing to an old list is cut
 * short, it's the people least likely to have forgotten us who got it.
 */
export async function queueNewsletterRecipientsStmt(mailingId: string, filters: NewsletterFilters): Promise<D1PreparedStatement> {
  const DB = await db();
  return DB.prepare(
    `INSERT INTO mailing_recipients (mailing_id, email, data, ord)
     SELECT ?5, email,
            json_object(
              'email', email,
              'firstName', coalesce(first_name, ''),
              'lastName', coalesce(last_name, ''),
              'course', json(CASE WHEN course_id IS NULL THEN NULL ELSE json_object(
                'name', course_name, 'type', coalesce(course_type, ''), 'location', coalesce(course_location, ''),
                'startsAt', coalesce(course_starts_at, ''), 'endsAt', coalesce(course_ends_at, '')
              ) END)
            ),
            row_number() OVER (ORDER BY latest DESC, lower(email))
       FROM (${RECIPIENTS})`,
  ).bind(...whereParams(filters), mailingId);
}

/**
 * The index-th person (by e-mail, alphabetically) a mailing with these
 * filters goes to, plus how many there are. One row per address; its course
 * is the most recent matching one, card-only sign-ups have none.
 */
export async function adminNewsletterRecipient(
  filters: NewsletterFilters,
  index: number,
): Promise<{ recipient: NewsletterRecipient | null; total: number }> {
  const DB = await db();
  const params = whereParams(filters);
  const [rows, counts] = await DB.batch<Record<string, string | number | null>>([
    DB.prepare(`${RECIPIENTS} ORDER BY lower(email) LIMIT 1 OFFSET ?5`).bind(...params, Math.max(0, Math.floor(index) || 0)),
    DB.prepare(`SELECT count(DISTINCT lower(email)) AS n FROM (${ENTRIES}) ${WHERE}`).bind(...params),
  ]);
  const r = rows.results?.[0];
  const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));
  return {
    total: Number(counts.results?.[0]?.n ?? 0),
    recipient: r
      ? {
          email: str(r.email),
          firstName: str(r.first_name),
          lastName: str(r.last_name),
          course: r.course_id
            ? {
                name: str(r.course_name),
                type: str(r.course_type),
                location: str(r.course_location),
                startsAt: str(r.course_starts_at),
                endsAt: str(r.course_ends_at),
              }
            : null,
        }
      : null,
  };
}

/**
 * Courses with at least one marketing-consent booking, newest first. Even
 * with the whole history imported that's a few hundred rows, so the picker
 * gets them all and searches them in the browser.
 */
export async function adminListNewsletterCourses(): Promise<NewsletterCourse[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    `SELECT c.id, c.name, c.type, c.location, c.starts_at, c.ends_at, count(*) AS consents
       FROM courses c JOIN course_bookings b ON b.course_id = c.id AND b.marketing_consent = 1
      GROUP BY c.id
      ORDER BY c.starts_at DESC`,
  ).all<Record<string, string | number>>();
  return (results ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    type: String(r.type ?? ""),
    location: String(r.location ?? ""),
    startsAt: String(r.starts_at ?? ""),
    endsAt: String(r.ends_at ?? ""),
    consents: Number(r.consents ?? 0),
  }));
}

/**
 * Takes an address off the list everywhere: drops its newsletter sign-up,
 * withdraws the marketing consent on all its course bookings (the bookings
 * themselves stay) and records the suppression, so an import can't bring it
 * back.
 */
export async function adminRemoveFromNewsletter(email: string, admin: string): Promise<void> {
  const DB = await db();
  await DB.batch([
    DB.prepare("INSERT OR IGNORE INTO newsletter_suppressions (email, reason) VALUES (?, 'admin')").bind(email),
    consentStmt(DB, { email, action: "withdrawn", source: "admin", ref: admin }),
    DB.prepare("DELETE FROM newsletter_subscribers WHERE email = ? COLLATE NOCASE").bind(email),
    DB.prepare("UPDATE course_bookings SET marketing_consent = 0 WHERE lower(email) = lower(?)").bind(email),
  ]);
}
