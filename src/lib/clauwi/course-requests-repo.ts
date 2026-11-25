import "server-only";

// D1 access for the "no course in your city?" requests (migrations/0023).

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cityKey, type CourseRequest } from "./courses";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, string | number | null>;

function rowToRequest(r: Row): CourseRequest {
  let types: string[] = [];
  try {
    types = JSON.parse(String(r.types ?? "[]"));
  } catch {}
  return { id: Number(r.id), city: String(r.city ?? ""), types, email: String(r.email ?? ""), createdAt: String(r.created_at ?? "") };
}

/** `email` and `consent` (the wording agreed to) are both empty when no address was given. */
export async function addCourseRequest(r: { city: string; types: string[]; email: string; consent: string }): Promise<void> {
  await (await db()).prepare("INSERT INTO course_requests (city, types, email, consent) VALUES (?, ?, ?, ?)")
    .bind(r.city, JSON.stringify(r.types), r.email, r.consent).run();
}

export async function listCourseRequests(): Promise<CourseRequest[]> {
  const { results } = await (await db()).prepare("SELECT * FROM course_requests ORDER BY created_at DESC, id DESC LIMIT 1000").all<Row>();
  return (results ?? []).map(rowToRequest);
}

/**
 * People who asked for `type` in `city` and left an e-mail (so agreed to be
 * told) — one per address, the latest request.
 */
export async function requestersFor(city: string, type: string): Promise<CourseRequest[]> {
  const key = cityKey(city);
  const seen = new Set<string>();
  return (await listCourseRequests()).filter((r) => {
    const email = r.email.toLowerCase();
    if (!email || cityKey(r.city) !== key || !r.types.includes(type) || seen.has(email)) return false;
    seen.add(email);
    return true;
  });
}

export async function deleteCourseRequests(ids: number[]): Promise<void> {
  await (await db()).prepare("DELETE FROM course_requests WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(ids)).run();
}
