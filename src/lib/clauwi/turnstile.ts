import { getCloudflareContext } from "@opennextjs/cloudflare";

// Verifies a Turnstile token server-side via Cloudflare's siteverify
// endpoint. Never call siteverify from the browser — the token rides in as
// the form's cf-turnstile-response field and is checked here, inside our own
// backend (src/app/api/contact/route.ts), before the message is sent.
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.TURNSTILE_SECRET_KEY;
  // Logged (never the secret or the token) so a failing check can be told
  // apart in Workers logs: no secret, no token, or what siteverify said.
  if (!secret) {
    console.warn("turnstile: TURNSTILE_SECRET_KEY is not set — siteverify not called");
    return false;
  }
  if (!token) {
    console.warn("turnstile: request has no cf-turnstile-response — siteverify not called");
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let res: Response;
  try {
    res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error("turnstile: siteverify request failed", e);
    return false;
  }
  if (!res.ok) {
    console.error(`turnstile: siteverify HTTP ${res.status}`);
    return false;
  }

  const data = (await res.json()) as { success: boolean; "error-codes"?: string[]; hostname?: string; action?: string };
  console.log("turnstile: siteverify", JSON.stringify({
    success: data.success, errors: data["error-codes"] ?? [], hostname: data.hostname, action: data.action,
  }));
  return data.success === true;
}
