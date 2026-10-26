import { NextRequest } from "next/server";
import { sendOpinionEmail } from "@/lib/clauwi/brevo";
import { verifyTurnstileToken } from "@/lib/clauwi/turnstile";

// The testimonial form on /opinie: a plain native form POST, forwarded to the
// ClauWi® inbox by e-mail (nothing is published automatically). Redirects
// back to /opinie with ?opinion=ok|error for the status line.
function redirectWithStatus(req: NextRequest, status: "ok" | "error") {
  const url = new URL("/opinie", req.url);
  url.searchParams.set("opinion", status);
  return Response.redirect(url.toString(), 303);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // Honeypot — real visitors never fill it in. If a bot did, pretend success.
  if (String(form.get("_kb_verify_email") || "").trim()) {
    return redirectWithStatus(req, "ok");
  }

  const name = String(form.get("kb_field_0") || "").trim();
  const course = String(form.get("kb_field_1") || "").trim();
  const email = String(form.get("kb_field_2") || "").trim();
  const opinion = String(form.get("kb_field_3") || "").trim();

  // Only the opinion itself is required (as on the original form); an e-mail,
  // when given, has to look like one.
  if (!opinion || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return redirectWithStatus(req, "error");
  }

  const turnstileToken = String(form.get("cf-turnstile-response") || "");
  if (!(await verifyTurnstileToken(turnstileToken, req.headers.get("cf-connecting-ip") || undefined))) {
    return redirectWithStatus(req, "error");
  }

  try {
    await sendOpinionEmail({ name, course, email, opinion });
  } catch (e) {
    console.error("opinion form send failed", e);
    return redirectWithStatus(req, "error");
  }

  return redirectWithStatus(req, "ok");
}
