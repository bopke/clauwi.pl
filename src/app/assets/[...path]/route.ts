import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves migrated legacy media (blog photos, hero images, plugin webfonts —
// see scripts/localize-assets.mjs) from the MEDIA R2 bucket, so the mirrored
// pages no longer depend on the live clauwi.pl host staying up. Same
// Worker-proxied-R2-binding pattern as specjalisci-easybaby's photo route.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const key = (path || []).join("/");
  const { env } = await getCloudflareContext({ async: true });
  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const buf = await obj.arrayBuffer();
  const headers = new Headers();
  headers.set("content-type", obj.httpMetadata?.contentType || "application/octet-stream");
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(buf, { headers });
}
