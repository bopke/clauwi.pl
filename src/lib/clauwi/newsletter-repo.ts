import "server-only";

// D1 access for newsletter sign-ups.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NewsletterEntry } from "./newsletter";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

/** Stores a newsletter-bar sign-up; an address already on the list is left as is. */
export async function addNewsletterSubscriber(email: string): Promise<void> {
  const DB = await db();
  await DB.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)").bind(email).run();
}

/**
 * Everyone who agreed to marketing e-mails: newsletter-bar sign-ups plus
 * course bookings with the marketing checkbox ticked. Newest first.
 */
export async function adminListNewsletter(): Promise<NewsletterEntry[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    `SELECT 'widget' AS source, email, created_at,
            NULL AS name, NULL AS course_id, NULL AS course_name, NULL AS course_type, NULL AS course_starts_at
       FROM newsletter_subscribers
     UNION ALL
     SELECT 'course', b.email, b.created_at,
            b.first_name || ' ' || b.last_name, c.id, c.name, c.type, c.starts_at
       FROM course_bookings b JOIN courses c ON c.id = b.course_id
      WHERE b.marketing_consent = 1
     ORDER BY created_at DESC`,
  ).all<Record<string, string | null>>();
  return (results ?? []).map((r) => ({
    email: r.email ?? "",
    createdAt: r.created_at ?? "",
    source: r.source === "course" ? "course" : "widget",
    ...(r.source === "course" && {
      name: r.name ?? "",
      courseId: r.course_id ?? "",
      courseName: r.course_name ?? "",
      courseType: r.course_type ?? "",
      courseStartsAt: r.course_starts_at ?? "",
    }),
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
