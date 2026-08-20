import "server-only";

// Allowlist of Google accounts with access to the admin panel, stored in D1.
// Sign-in is gated by these functions (see src/auth.ts).
// Mirrors specjalisci-easybaby's allowlist module exactly.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AllowEntry } from "./advisors";

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export async function isAllowed(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const DB = await db();
  const row = await DB.prepare("SELECT 1 FROM allowlist WHERE email = ? COLLATE NOCASE").bind(email).first();
  return !!row;
}

export async function listAllow(): Promise<AllowEntry[]> {
  const DB = await db();
  const { results } = await DB.prepare("SELECT email, added FROM allowlist ORDER BY added DESC, email ASC").all<AllowEntry>();
  return results ?? [];
}

export async function addAllow(email: string): Promise<void> {
  const DB = await db();
  await DB.prepare("INSERT OR IGNORE INTO allowlist (email, added) VALUES (?, date('now'))").bind(email).run();
}

export async function removeAllow(email: string): Promise<void> {
  const DB = await db();
  await DB.prepare("DELETE FROM allowlist WHERE email = ? COLLATE NOCASE").bind(email).run();
}
