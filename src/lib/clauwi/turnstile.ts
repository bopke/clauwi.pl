import { getCloudflareContext } from "@opennextjs/cloudflare";

// Verifies a Turnstile token server-side via Cloudflare's siteverify
// endpoint. Never call siteverify from the browser — the token rides in as
// the form's cf-turnstile-response field and is checked here, inside our own
// backend (src/app/api/contact/route.ts), before the message is sent.
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return false;

  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
