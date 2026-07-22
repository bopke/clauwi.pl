import { NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/clauwi/brevo";
import { verifyTurnstileToken } from "@/lib/clauwi/turnstile";

// Handles the mirrored Kadence contact form (kontakt + home pages — see
// scripts/mirror.mjs's rewriteContactFormAction) as a plain native form POST,
// no client JS required. Redirects back to the referring page with
// ?contact=ok|error so ContactFormHydrator can show a status message.
function redirectWithStatus(req: NextRequest, status: "ok" | "error") {
  const referer = req.headers.get("referer");
  let path = "/kontakt";
  if (referer) {
    try {
      path = new URL(referer).pathname;
    } catch {
      // keep default
    }
  }
  const url = new URL(path, req.url);
  url.searchParams.set("contact", status);
  return Response.redirect(url.toString(), 303);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // Kadence's hidden honeypot field — real visitors never fill it in. If a
  // bot did, pretend success rather than tipping it off.
  if (String(form.get("_kb_verify_email") || "").trim()) {
    return redirectWithStatus(req, "ok");
  }

  const name = String(form.get("kb_field_0") || "").trim();
  const email = String(form.get("kb_field_1") || "").trim();
  const message = String(form.get("kb_field_2") || "").trim();
  const consent = form.get("kb_field_3");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailValid || !message || !consent) {
    return redirectWithStatus(req, "error");
  }

  const turnstileToken = String(form.get("cf-turnstile-response") || "");
  const ok = await verifyTurnstileToken(turnstileToken, req.headers.get("cf-connecting-ip") || undefined);
  if (!ok) {
    return redirectWithStatus(req, "error");
  }

  try {
    await sendContactEmail({ name, email, message });
  } catch (e) {
    console.error("contact form send failed", e);
    return redirectWithStatus(req, "error");
  }

  return redirectWithStatus(req, "ok");
}
