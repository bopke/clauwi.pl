// One-click unsubscribe (RFC 8058) — the target of a List-Unsubscribe header:
// the mail client POSTs `List-Unsubscribe=One-Click` here and expects no page.
//
// Not used while mailings go through Brevo, which sets its own header (its
// unsubscribes reach us via the webhook instead); ready for a provider that
// lets us set ours.

import { NextResponse } from "next/server";
import { findNewsletterToken, suppressNewsletterEmail } from "@/lib/clauwi/newsletter-repo";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findNewsletterToken(token);
  if (found) await suppressNewsletterEmail(found.email, "one-click");
  // Same answer either way — don't reveal which tokens exist.
  return new NextResponse(null, { status: 200 });
}

/** Someone opened the URL itself — show them the normal unsubscribe page. */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return NextResponse.redirect(new URL(`/newsletter/wypisz/${encodeURIComponent(token)}`, req.url), 303);
}
