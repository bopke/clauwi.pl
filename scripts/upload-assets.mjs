// Downloads every asset in scripts/localized-asset-keys.json from the live
// clauwi.pl and uploads it to the clauwi-media R2 bucket (binding: MEDIA),
// both locally (for dev) and remotely (for production). That key list is
// the output of a real-browser crawl across all 21 mirrored pages (see
// scratchpad-asset-crawl.mjs, not committed) — it is deliberately NOT "every
// wp-content URL that appears in the CSS", since most plugin/theme assets
// (WooCommerce, Ultimate Member, the cookie-consent plugin, FontAwesome CSS
// classes we never render, the old advisor-map plugin, ...) are leftovers
// from features we dropped and are never actually requested by a browser.
//
// Usage: node scripts/upload-assets.mjs [--remote-only|--local-only]
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://clauwi.pl";
const UA = { "User-Agent": "Mozilla/5.0 (clauwi-asset-migration)" };

const keys = JSON.parse(readFileSync(resolve(ROOT, "scripts/localized-asset-keys.json"), "utf8"));

const mode = process.argv.includes("--remote-only")
  ? "remote-only"
  : process.argv.includes("--local-only")
    ? "local-only"
    : "both";

const tmp = mkdtempSync(join(tmpdir(), "clauwi-assets-"));
let ok = 0;
let failed = [];

for (const [i, key] of keys.entries()) {
  const url = `${ORIGIN}/${key.split("/").map(encodeURIComponent).join("/")}`;
  process.stderr.write(`[${i + 1}/${keys.length}] ${key} ... `);
  try {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const file = join(tmp, "asset");
    writeFileSync(file, buf);

    if (mode !== "remote-only") {
      execFileSync("npx", [
        "wrangler", "r2", "object", "put", `clauwi-media/${key}`,
        "--file", file, "--content-type", contentType, "--local",
      ], { cwd: ROOT, stdio: "pipe" });
    }
    if (mode !== "local-only") {
      execFileSync("npx", [
        "wrangler", "r2", "object", "put", `clauwi-media/${key}`,
        "--file", file, "--content-type", contentType, "--remote",
      ], { cwd: ROOT, stdio: "pipe" });
    }
    ok++;
    process.stderr.write("ok\n");
  } catch (e) {
    failed.push({ key, error: e.message });
    process.stderr.write(`FAILED: ${e.message}\n`);
  }
}

rmSync(tmp, { recursive: true, force: true });

console.log(`\n${ok}/${keys.length} uploaded.`);
if (failed.length) {
  console.log(`${failed.length} failed:`);
  for (const f of failed) console.log(`  ${f.key}: ${f.error}`);
  process.exitCode = 1;
}
