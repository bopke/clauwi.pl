// Periodic work, called every few minutes by the Worker's cron handler
// (worker.ts): sends the next chunk of every due mailing.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { cronToken } from "@/lib/clauwi/cron-token";
import { processDueMailings } from "@/lib/clauwi/mailings-repo";

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!env.AUTH_SECRET || given !== (await cronToken(env.AUTH_SECRET))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sent = await processDueMailings();
  return NextResponse.json({ ok: true, sent });
}
