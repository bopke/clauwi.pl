// Shared between the Worker's cron handler (worker.ts) and the route it calls
// (src/app/api/cron/route.ts): the bearer token proving a request came from
// the cron. Derived from AUTH_SECRET, so no extra secret has to be set up.

export async function cronToken(authSecret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(authSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("clauwi-cron"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
