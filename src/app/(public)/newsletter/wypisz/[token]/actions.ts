"use server";

// Unsubscribe page actions. Both act on the token in the link — the address
// itself never travels in the URL or the form.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { findNewsletterToken, recordConsent, suppressNewsletterEmail, unsuppressNewsletterEmail } from "@/lib/clauwi/newsletter-repo";
import { RESUBSCRIBE_TEXT } from "@/lib/clauwi/consent";

export async function unsubscribeAction(token: string): Promise<void> {
  const found = await findNewsletterToken(token);
  if (found) await suppressNewsletterEmail(found.email, "link");
  redirect(`/newsletter/wypisz/${encodeURIComponent(token)}`);
}

/** "Zapisz mnie ponownie" — undoes an unsubscribe made by mistake. */
export async function resubscribeAction(token: string): Promise<void> {
  const found = await findNewsletterToken(token);
  if (found?.suppressed) {
    await unsuppressNewsletterEmail(found.email);
    const ip = (await headers()).get("cf-connecting-ip") ?? "";
    await recordConsent({ email: found.email, action: "granted", source: "resubscribe", wording: RESUBSCRIBE_TEXT, ip });
  }
  redirect(`/newsletter/wypisz/${encodeURIComponent(token)}`);
}
