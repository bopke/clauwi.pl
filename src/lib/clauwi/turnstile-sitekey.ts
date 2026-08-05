// Public Turnstile sitekey — not secret, safe to ship to the client. Kept
// separate from src/lib/clauwi/turnstile.ts (which does server-only
// verification via TURNSTILE_SECRET_KEY) so client components can import
// this without pulling in getCloudflareContext.
//
// Keep in sync with scripts/mirror.mjs's own TURNSTILE_SITEKEY constant —
// duplicated there since that's a plain Node script outside the src/ build,
// but it's the exact same Cloudflare Turnstile widget/sitekey.
export const TURNSTILE_SITEKEY = "0x4AAAAAAD7Pd82wpJ8Bnluu";
