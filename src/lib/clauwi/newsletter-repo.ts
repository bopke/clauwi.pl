import "server-only";

// D1 access for newsletter sign-ups.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NEWSLETTER_PAGE_SIZE, type NewsletterCourse, type NewsletterPage, type NewsletterQuery } from "./newsletter";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

/** Stores a newsletter-bar sign-up; an address already on the list is left as is. */
export async function addNewsletterSubscriber(email: string): Promise<void> {
  const DB = await db();
  await DB.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)").bind(email).run();
}

// Everyone who agreed to marketing e-mails: newsletter-bar sign-ups plus course
// bookings with the marketing checkbox ticked, as one list.
const ENTRIES = `
  SELECT 'widget' AS source, email, created_at,
         NULL AS name, NULL AS course_id, NULL AS course_name, NULL AS course_type, NULL AS course_starts_at
    FROM newsletter_subscribers
  UNION ALL
  SELECT 'course', b.email, b.created_at,
         b.first_name || ' ' || b.last_name, c.id, c.name, c.type, c.starts_at
    FROM course_bookings b JOIN courses c ON c.id = b.course_id
   WHERE b.marketing_consent = 1`;

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
export async function adminListNewsletter(query: NewsletterQuery): Promise<NewsletterPage> {
  const DB = await db();
  const like = query.q.trim() ? "%" + query.q.trim().toLowerCase().replace(/[\\%_]/g, "\\$&") + "%" : "";
  const params = [query.source, query.courseType, JSON.stringify(query.courseIds.slice(0, 2000)), like];
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
 * Takes an address off the list everywhere: drops its newsletter sign-up and
 * withdraws the marketing consent on all its course bookings (the bookings
 * themselves stay).
 */
export async function adminRemoveFromNewsletter(email: string): Promise<void> {
  const DB = await db();
  await DB.batch([
    DB.prepare("DELETE FROM newsletter_subscribers WHERE email = ? COLLATE NOCASE").bind(email),
    DB.prepare("UPDATE course_bookings SET marketing_consent = 0 WHERE lower(email) = lower(?)").bind(email),
  ]);
}
