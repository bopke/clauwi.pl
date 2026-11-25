import "server-only";

// D1 access for the "no course in your city?" requests (migrations/0023).

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CourseRequest } from "./courses";

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
  return { id: Number(r.id), city: String(r.city ?? ""), types, createdAt: String(r.created_at ?? "") };
}

export async function addCourseRequest(city: string, types: string[]): Promise<void> {
  await (await db()).prepare("INSERT INTO course_requests (city, types) VALUES (?, ?)").bind(city, JSON.stringify(types)).run();
}

export async function listCourseRequests(): Promise<CourseRequest[]> {
  const { results } = await (await db()).prepare("SELECT * FROM course_requests ORDER BY created_at DESC, id DESC LIMIT 1000").all<Row>();
  return (results ?? []).map(rowToRequest);
}

export async function deleteCourseRequests(ids: number[]): Promise<void> {
  await (await db()).prepare("DELETE FROM course_requests WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(ids)).run();
}
