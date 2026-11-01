"use server";

// Unsubscribe page actions. Both act on the token in the link — the address
// itself never travels in the URL or the form.

import { redirect } from "next/navigation";
import { findNewsletterToken, suppressNewsletterEmail, unsuppressNewsletterEmail } from "@/lib/clauwi/newsletter-repo";

export async function unsubscribeAction(token: string): Promise<void> {
  const found = await findNewsletterToken(token);
  if (found) await suppressNewsletterEmail(found.email, "link");
  redirect(`/newsletter/wypisz/${encodeURIComponent(token)}`);
}

/** "Zapisz mnie ponownie" — undoes an unsubscribe made by mistake. */
export async function resubscribeAction(token: string): Promise<void> {
  const found = await findNewsletterToken(token);
  if (found) await unsuppressNewsletterEmail(found.email);
  redirect(`/newsletter/wypisz/${encodeURIComponent(token)}`);
}
