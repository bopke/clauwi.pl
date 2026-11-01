// Brevo webhook: unsubscribes, spam complaints and hard bounces reported by
// Brevo become newsletter suppressions, so our list and Brevo's agree.
//
// Needed because Brevo adds its own List-Unsubscribe header to everything it
// sends — the inbox "Unsubscribe" button goes to Brevo, not to us. This file
// is the only Brevo-specific part of unsubscribing.
//
// Set up in Brevo (Transactional → Settings → Webhooks) with the URL
//   https://<domain>/api/webhooks/brevo?secret=<BREVO_WEBHOOK_SECRET>
// and the Unsubscribed, Spam and Hard bounce events. The secret is a
// `wrangler secret`; without it the endpoint refuses everything.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { suppressNewsletterEmail, type SuppressionReason } from "@/lib/clauwi/newsletter-repo";

// Event names differ between Brevo's transactional and marketing webhooks.
const REASONS: Record<string, SuppressionReason> = {
  unsubscribed: "provider-unsubscribe",
  unsubscribe: "provider-unsubscribe",
  spam: "provider-spam",
  complaint: "provider-spam",
  hard_bounce: "provider-bounce",
  hardBounce: "provider-bounce",
};

/** Constant-time comparison, so the secret can't be guessed byte by byte. */
function sameSecret(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const expected = env.BREVO_WEBHOOK_SECRET;
  const given =
    new URL(req.url).searchParams.get("secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || !sameSecret(given, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // One event per request normally; accept a batch too.
  const events = (Array.isArray(payload) ? payload : [payload]) as { event?: string; email?: string }[];
  for (const e of events) {
    const reason = e?.event ? REASONS[e.event] : undefined;
    if (reason && typeof e.email === "string" && e.email.includes("@")) {
      await suppressNewsletterEmail(e.email, reason);
    }
  }
  // Brevo retries on non-2xx — events we don't act on are still "handled".
  return NextResponse.json({ ok: true });
}
