"use server";

// Public (unauthenticated) newsletter sign-up from the bar on the site.
// Double opt-in: this only e-mails a confirmation link; the address joins the
// list when it's used (src/app/(public)/newsletter/potwierdz/[token]).

import { headers } from "next/headers";
import { createPendingSignup } from "./newsletter-repo";
import { sendNewsletterConfirmEmail } from "./brevo";
import { NEWSLETTER_CONSENT_TEXT } from "./consent";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function subscribeNewsletterAction(formData: FormData): Promise<{ ok: boolean }> {
  // Honeypot: hidden from people, filled in by naive bots — pretend it worked.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  if (!EMAIL_RE.test(email) || formData.get("consent") == null) return { ok: false };

  const ip = (await headers()).get("cf-connecting-ip") ?? "";
  // The same answer whether or not a link went out — the form must not tell
  // anyone which addresses are on the list.
  const token = await createPendingSignup(email, NEWSLETTER_CONSENT_TEXT, ip);
  if (token) await sendNewsletterConfirmEmail(email, token);
  return { ok: true };
}
