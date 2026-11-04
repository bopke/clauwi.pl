"use server";

// Confirmation page action (double opt-in). Acts on the token in the link —
// the address never travels in the URL or the form.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { confirmPendingSignup } from "@/lib/clauwi/newsletter-repo";
import { sendWelcome } from "@/lib/clauwi/automations-repo";
import { emailBaseUrl } from "@/lib/clauwi/brevo";

export async function confirmSignupAction(token: string): Promise<void> {
  const ip = (await headers()).get("cf-connecting-ip") ?? "";
  const email = await confirmPendingSignup(token, ip);
  if (email) {
    // The sign-up already counts — a failed welcome e-mail mustn't undo it.
    try {
      await sendWelcome(email, await emailBaseUrl());
    } catch (e) {
      console.error("welcome e-mail failed to send", e);
    }
  }
  redirect(`/newsletter/potwierdz/${encodeURIComponent(token)}`);
}
