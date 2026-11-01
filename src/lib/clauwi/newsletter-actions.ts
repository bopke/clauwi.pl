"use server";

// Public (unauthenticated) newsletter sign-up from the bar on the site.

import { addNewsletterSubscriber } from "./newsletter-repo";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function subscribeNewsletterAction(formData: FormData): Promise<{ ok: boolean }> {
  // Honeypot: hidden from people, filled in by naive bots — pretend it worked.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  if (!EMAIL_RE.test(email) || formData.get("consent") == null) return { ok: false };

  await addNewsletterSubscriber(email);
  return { ok: true };
}
