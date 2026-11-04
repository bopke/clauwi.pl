import "server-only";

// Saved composer templates (migrations/0019).

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NewsletterDraft } from "./newsletter-template";

export type MessageTemplate = NewsletterDraft & { id: string; name: string; updatedAt: string };

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export async function listTemplates(): Promise<MessageTemplate[]> {
  const { results } = await (await db()).prepare(
    "SELECT id, name, subject, heading, body, updated_at FROM message_templates ORDER BY name COLLATE NOCASE",
  ).all<Record<string, string>>();
  return (results ?? []).map((r) => ({ id: r.id, name: r.name, subject: r.subject, heading: r.heading, body: r.body, updatedAt: r.updated_at }));
}

/** Saves under `name`, replacing a template of the same name. */
export async function saveTemplate(name: string, draft: NewsletterDraft, by: string): Promise<void> {
  await (await db()).prepare(
    `INSERT INTO message_templates (id, name, subject, heading, body, updated_by) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (name) DO UPDATE SET subject = excluded.subject, heading = excluded.heading, body = excluded.body,
       updated_by = excluded.updated_by, updated_at = datetime('now')`,
  ).bind("tpl" + crypto.randomUUID(), name.trim().slice(0, 120), draft.subject, draft.heading, draft.body, by).run();
}

export async function deleteTemplate(id: string): Promise<void> {
  await (await db()).prepare("DELETE FROM message_templates WHERE id = ?").bind(id).run();
}
