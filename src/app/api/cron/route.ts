// Periodic work, called every few minutes by the Worker's cron handler
// (worker.ts): sends the next chunk of every due mailing, then whatever
// automatic course e-mails are due.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { cronToken } from "@/lib/clauwi/cron-token";
import { processDueMailings } from "@/lib/clauwi/mailings-repo";
import { runCourseAutomations } from "@/lib/clauwi/automations-repo";
import { SITE } from "@/lib/clauwi/site";

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!env.AUTH_SECRET || given !== (await cronToken(env.AUTH_SECRET))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // One failing mustn't stop the other.
  const [mailings, automations] = await Promise.allSettled([processDueMailings(), runCourseAutomations(env.SITE_URL || SITE.url)]);
  for (const r of [mailings, automations]) if (r.status === "rejected") console.error("cron step failed", r.reason);
  return NextResponse.json({
    ok: true,
    mailings: mailings.status === "fulfilled" ? mailings.value : "error",
    automations: automations.status === "fulfilled" ? automations.value : "error",
  });
}
