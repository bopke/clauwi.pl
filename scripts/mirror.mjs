// Mirror pipeline: fetch a live clauwi.pl page, split its CSS into a SHARED
// base bundle (the ~53 theme/plugin stylesheets enqueued on every page —
// fetched once and cached across a whole batch run) and PAGE-SPECIFIC inline
// <style> blocks (Kadence's per-block generated CSS), strip WordPress
// scripts, and emit a self-contained `src/legacy/<slug>.ts` module exporting
// { css, html, bodyClass, title }. The shared bundle is written once to
// `src/legacy/base.css` and imported globally by the (public) layout.
//
// Usage: node scripts/mirror.mjs <slug> <path>
//   node scripts/mirror.mjs home /
//   node scripts/mirror.mjs o-nas /o-nas/
//
// Asset URLs (images/fonts) are rewritten to /assets/<path> (served from R2 —
// see localizeAssetUrls() below and scripts/upload-assets.mjs) so the mirrored
// site no longer depends on the live clauwi.pl host staying up.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://clauwi.pl";
const UA = { "User-Agent": "Mozilla/5.0 (clauwi-mirror)" };
const BASE_CSS_PATH = resolve(ROOT, "src/legacy/base.css");
const BASE_MANIFEST_PATH = resolve(ROOT, "src/legacy/.base-css-urls.json");

const abs = (base, rel) => {
  try { return new URL(rel, base).href; } catch { return rel; }
};

// Rewrite relative url(...) inside a CSS file to absolute, based on its source URL.
function rewriteCssUrls(css, baseUrl) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
    if (/^(data:|https?:|\/\/)/i.test(u)) return m;
    return `url(${q}${abs(baseUrl, u)}${q})`;
  });
}

// Rewrite same-site page links (href="https://clauwi.pl/...") to relative
// paths, so clicking anything on the mirrored site keeps the user on OUR
// site instead of bouncing to the live WordPress. Deliberately narrow to
// <a href="..."> — asset URLs (images, fonts, wp-content, CSS url()) are a
// separate, already-tracked pre-cutover task and are left untouched here.
// Paths we haven't built yet (kalendarz-wydarzen, aktualizacja-danych, ...)
// will 404 locally rather than silently escaping to the live site — that's
// the correct interim behavior and surfaces what's still missing.
// A couple of already-relative hrefs in the source content are themselves
// broken/stale on the live site (WordPress transparently fixes them via its
// core "old slug" redirect, which we don't have) — alias them to where they
// actually resolve. Checked against the live site's redirect behavior.
const LINK_ALIASES = {
  "/lista-doradcow/": "/o-nas/lista-doradcow/",
  // Live site's own old-slug redirect sends this to a test page we drop
  // intentionally; the real destination readers want is the advisor directory.
  "/doradcy": "/o-nas/lista-doradcow/",
};

// Rewrite any /wp-content/... asset URL (images, fonts, plugin/theme assets —
// any protocol, any of the site's own hostnames) to a relative /assets/...
// path served by src/app/assets/[...path]/route.ts from the MEDIA R2 bucket.
// Deliberately blanket: it rewrites every wp-content reference, not just ones
// we've confirmed are used — scripts/upload-assets.mjs is what decides which
// files are actually fetched (via a real-browser crawl) and only uploads
// those. A rewritten-but-never-uploaded URL simply 404s from R2, which is no
// worse than it being an untriggered dead link today.
export function localizeAssetUrls(text) {
  return text.replace(
    /(?:https?:)?\/\/(?:www\.|n\.)?clauwi\.pl(\/wp-content\/[^"'\\)\s]+)/g,
    (_m, path) => `/assets${path}`,
  );
}

// Assets that are 404 on the live site ITSELF (pre-existing broken references,
// not something we introduced) — dropping the whole declaration is better
// than localizing a link that will just 404 from R2 too, since the browser
// still logs a failed request either way. Keyed by the asset's basename.
const BROKEN_ASSETS = ["Clauwi®komputer-1-1.png"];

export function stripBrokenAssetRefs(css) {
  for (const name of BROKEN_ASSETS) {
    css = css.replace(
      new RegExp(`background-image:url\\(['"]?[^'")]*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]?\\);?`, "g"),
      "",
    );
  }
  return css;
}

function rewriteInternalLinks(body) {
  body = body.replace(/href=(["'])https?:\/\/(?:www\.)?clauwi\.pl(\/[^"']*)?\1/g, (m, q, path) => {
    return `href=${q}${path || "/"}${q}`;
  });
  for (const [from, to] of Object.entries(LINK_ALIASES)) {
    body = body.replaceAll(`href="${from}"`, `href="${to}"`).replaceAll(`href='${from}'`, `href='${to}'`);
  }
  return body;
}

// Footer credit line: client asked to split "Projekt i opieka - Bit-Art
// Studio" into "Projekt - Bit-Art Studio, Opieka - Bopke.dev", keeping the
// existing Bit-Art Studio link and adding a new Bopke.dev link.
function rewriteFooterCredit(body) {
  const credit =
    'Projekt - <a href="http://www.facebook.com/a.warywocka">Bit-Art Studio</a>, ' +
    'Opieka i adaptacja - <a href="https://bopke.dev/">Bopke.dev</a>';
  return body
    // fresh mirror output still carries the original single credit
    .replace(
      /Projekt i opieka - <a href="http:\/\/www\.facebook\.com\/a\.warywocka">Bit-Art Studio<\/a>/,
      credit,
    )
    // already-rewritten pages: keep the wording in sync without re-mirroring
    .replace(
      /Opieka - <a href="https:\/\/bopke\.dev\/">Bopke\.dev<\/a>/,
      'Opieka i adaptacja - <a href="https://bopke.dev/">Bopke.dev</a>',
    );
}

// Public Turnstile sitekey (not secret — safe to bake into static HTML).
// Created via the turnstile-spin skill, account 1567723ff568a1bffcc2baf79c4cf320,
// registered for localhost/127.0.0.1/staging.clauwi.pl/clauwi.pl. The paired
// secret (TURNSTILE_SECRET_KEY) lives only in .dev.vars / wrangler secrets and
// is checked server-side in src/app/api/contact/route.ts.
const TURNSTILE_SITEKEY = "0x4AAAAAAD7Pd82wpJ8Bnluu";

// Wires the mirrored Kadence contact form (home + kontakt pages only — NOT
// the "opinie" testimonial-submission form, a different form entirely) up to
// src/app/api/contact/route.ts, which sends the message via Brevo. Kadence's
// own JS normally intercepts submission for an AJAX post; since we strip all
// scripts, the safest fix is a plain native form POST — no client JS needed.
// Matched by data-label="Message" (unique to this form's textarea; opinie's
// textarea is labeled "Treść opinii"), not by the per-page _kb_form_id, which
// is a generated hash that could change on a future re-mirror. Also injects a
// Turnstile widget before the submit button — the token rides along as the
// standard cf-turnstile-response form field and is checked server-side.
export function rewriteContactFormAction(body) {
  return body.replace(
    /<form class="kb-form" action="" method="post">([\s\S]*?)<\/form>/g,
    (whole, inner) => {
      if (!inner.includes('data-label="Message"')) return whole;
      return whole
        .replace(
          '<form class="kb-form" action="" method="post">',
          '<form class="kb-form" data-contact-form="true" action="/api/contact" method="post">',
        )
        .replace(
          '<div class="kadence-blocks-form-field kb-submit-field',
          `<div class="cf-turnstile" data-sitekey="${TURNSTILE_SITEKEY}" data-action="turnstile-spin-v1"></div><div class="kadence-blocks-form-field kb-submit-field`,
        );
    },
  );
}

// Content images left with empty alt="" by the original WordPress editors
// (accessibility + image-search gap). Keyed by filename (basename of the src
// URL, ignoring WordPress's size suffix like "-1024x720"), applied to every
// mirrored page. Text is hand-written from real page context.
const ALT_TEXT_BY_STEM = {
  "logo_clauwi": "Logo ClauWi® — Szkoła Doradców Noszenia",
  "logo_clauwi-297x300": "Logo ClauWi® — Szkoła Doradców Noszenia",
  "baby-newborn-baby-feet-4077353": "Bose stópki noworodka noszonego blisko rodzica",
  "1": "Trenerki ClauWi® podczas prowadzenia kursu noszenia",
  "2": "Trenerka ClauWi® podczas kursu doradcy noszenia",
  "3": "Materiały szkoleniowe wykorzystywane na kursach ClauWi®",
  "bez-nazwy2": "Szkoła ClauWi® — zdjęcie promocyjne",
  "staraclauwi": "Zrzut ekranu poprzedniej wersji strony ClauWi®",
  "2023-02-13-Iza-Banach-kangur2": "Izabela Banach nosząca dziecko w chuście kangurowej",
  "2023-02-13-Iza-Banach-kangur2-1024x720": "Izabela Banach nosząca dziecko w chuście kangurowej",
  "2023-02-13-Iza-Banach-kangur": "Izabela Banach, autorka wpisu, doradczyni noszenia ClauWi®",
  "2023-02-13-Iza-Banach-kangur3-1024x720": "Dziecko noszone w chuście kangurowej",
  "201010Karolonafaras2": "Karolina Faraś, doradczyni noszenia ClauWi®",
  "231010Karolinafaras1": "Karolina Faraś podczas konsultacji z rodzicem",
  "201010Karolonafaras3": "Dziecko noszone w chuście — profilaktyka logopedyczna",
  "201010Karolonafaras4": "Dziecko noszone w chuście — profilaktyka logopedyczna",
  "201010Karolonafaras5": "Dziecko noszone w chuście — profilaktyka logopedyczna",
  "20230308JoannaTworzydlo1-scaled": "Joanna Tworzydło nosząca dziecko w chuście",
  "20230308JoannaTworzydlo1-1024x684": "Joanna Tworzydło nosząca dziecko w chuście",
  "20230308JoannaTworzydlo2-684x1024": "Dziecko noszone w chuście wiązanej",
  "20230308JoannaTworzydlo3-682x1024": "Dziecko noszone w chuście wiązanej",
  "DagmaraStolarczyk2": "Dagmara Stolarczyk, autorka wpisu, doradczyni noszenia ClauWi®",
  "DagmaraStolarczyk1-683x1024": "Dziecko noszone w chuście",
  "DagmaraStolarczyk2-1-683x1024": "Dagmara Stolarczyk nosząca dziecko w chuście",
  "230118OlaMlodkowska2": "Aleksandra Młodkowska nosząca dziecko na wsi",
  "230118OlaMlodkowska1-1-603x1024": "Dziecko noszone w chuście na wsi",
  "230118OlaMlodkowska3": "Aleksandra Młodkowska z dzieckiem w chuście",
  "230125KarolinaFaras2": "Karolina Faraś nosząca dziecko pomimo dyskopatii lędźwiowej",
  "230125KarolinaFaras1": "Rodzic z dyskopatią lędźwiową noszący dziecko w chuście",
  "230125KarolinaFaras2-1024x475": "Karolina Faraś nosząca dziecko pomimo dyskopatii lędźwiowej",
  "7G3A1226-1": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0716-1": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0792-1": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0834": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0697": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A1101": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0382": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0572": "Zdjęcie z konferencji ClauWi® 2025",
  "7G3A0413": "Zdjęcie z konferencji ClauWi® 2025",
};

function altStemFor(src) {
  const file = (src.split("/").pop() || "").replace(/\.[a-zA-Z0-9]+$/, "");
  return file;
}

// The legacy WordPress install is compromised (see the project notes) and had
// hidden SEO spam injected into some pages — darknet-marketplace copy in
// Russian, wrapped in a div parked far off-screen:
//
//   <div style="position:absolute;left:-13168px;width:1000px;"> … </div>
//
// Invisible to a visitor, fully present for search engines, and it came along
// for the ride when those pages were mirrored. Strip any absolutely-positioned
// block pushed off-canvas; the real pages never use that trick.
// The original content links "Kurs zaawansowany" to clauwi.kodu-kodu.pl, an
// old development host of the site that no longer resolves (verified: no DNS
// response). Nothing there to point at, and no equivalent page on the current
// site, so the anchor is unwrapped to plain text rather than redirected —
// the sentence still reads correctly without a link.
const DEAD_LINK_HOSTS = [/^https?:\/\/clauwi\.kodu-kodu\.pl\b/i];

export function unwrapDeadLinks(body) {
  return body.replace(/<a\b([^>]*)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (full, pre, href, post, text) =>
    DEAD_LINK_HOSTS.some((h) => h.test(href)) ? text : full,
  );
}

export function stripInjectedSpam(html) {
  let out = "";
  let rest = html;
  const opener = /<div[^>]*style="[^"]*position:\s*absolute[^"]*(?:left|top):\s*-\d{3,}px[^"]*"[^>]*>/i;

  for (;;) {
    const m = rest.match(opener);
    if (!m) return out + rest;

    out += rest.slice(0, m.index);
    // Walk forward counting nested <div>s so the matching </div> is removed
    // along with everything between — a plain non-greedy match would stop at
    // the first inner </div> and leave spam behind.
    let i = m.index + m[0].length;
    let depth = 1;
    const tag = /<\/?div\b[^>]*>/gi;
    tag.lastIndex = i;
    let t;
    while (depth > 0 && (t = tag.exec(rest))) {
      depth += t[0][1] === "/" ? -1 : 1;
      i = tag.lastIndex;
    }
    rest = rest.slice(i);
  }
}

export function fillAltText(body) {
  // Operates on the raw (unescaped) HTML string before JSON.stringify serializes
  // it into the generated .ts module.
  return body.replace(/<img\b[^>]*>/g, (tag) => {
    if (!/alt=["']["']/.test(tag)) return tag; // only fill genuinely empty alt
    const src = (tag.match(/src=["']([^"']+)["']/) || [])[1];
    if (!src) return tag;
    const alt = ALT_TEXT_BY_STEM[altStemFor(src)];
    if (!alt) return tag;
    return tag.replace(/alt=["']["']/, `alt="${alt}"`);
  });
}

// Strip old IE star-hack (`*zoom:1`) and underscore-hack (`_height:30px`)
// property prefixes — invalid per the CSS spec (rejected by strict parsers
// like Turbopack/Lightning CSS) but harmless to remove: modern browsers
// already ignore these declarations entirely, so this changes nothing visually.
function stripLegacyCssHacks(css) {
  return css
    .replace(/([;{]\s*)\*(?=[a-zA-Z-]+\s*:)/g, "$1")
    .replace(/([;{]\s*)_(?=[a-zA-Z-]+\s*:)/g, "$1");
}

function loadManifest() {
  if (!existsSync(BASE_MANIFEST_PATH)) return [];
  return JSON.parse(readFileSync(BASE_MANIFEST_PATH, "utf8"));
}

export async function mirrorPage(slug, path) {
  const html = await (await fetch(`${ORIGIN}${path}`, { headers: UA })).text();

  const title = ((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "").trim();

  // --- shared external CSS: fetch only URLs not already captured by a prior run ---
  const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/g)]
    .map((l) => (l[0].match(/href=["']([^"']+)["']/) || [])[1])
    .filter(Boolean);

  const seen = new Set(loadManifest());
  let newBaseCss = "";
  for (const href of cssLinks) {
    const url = href.startsWith("http") ? href : abs(ORIGIN, href);
    if (seen.has(url)) continue;
    seen.add(url);
    if (url.includes("fonts.googleapis.com")) { newBaseCss += `@import url("${url}");\n`; continue; }
    if (!url.includes("clauwi.pl")) { newBaseCss += `@import url("${url}");\n`; continue; }
    try {
      const css = await (await fetch(url, { headers: UA })).text();
      newBaseCss += `\n/* ${href} */\n` + localizeAssetUrls(stripBrokenAssetRefs(stripLegacyCssHacks(rewriteCssUrls(css, url)))) + "\n";
    } catch (e) {
      console.warn("skip css", url, e.message);
    }
  }
  if (newBaseCss) {
    const prior = existsSync(BASE_CSS_PATH) ? readFileSync(BASE_CSS_PATH, "utf8") : "";
    // CSS requires @import to precede all other rules — hoist every @import
    // line (old + new) to the top so appending across runs stays valid.
    const merged = prior + newBaseCss;
    const lines = merged.split("\n");
    const imports = lines.filter((l) => l.trim().startsWith("@import"));
    const rest = lines.filter((l) => !l.trim().startsWith("@import"));
    writeFileSync(BASE_CSS_PATH, imports.join("\n") + "\n" + rest.join("\n"));
    writeFileSync(BASE_MANIFEST_PATH, JSON.stringify([...seen], null, 2));
  }

  // --- page-specific inline <style> blocks ---
  const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const css = localizeAssetUrls(stripBrokenAssetRefs(stripLegacyCssHacks(inlineStyles.join("\n"))));

  // --- extract + clean body ---
  let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [])[1] || "";
  body = body
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/g, "")
    .replace(/<div[^>]*id=["']wpadminbar["'][\s\S]*?<\/div>\s*(?=<)/g, "")
    .replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/g, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/ (on\w+)=("[^"]*"|'[^']*')/g, ""); // strip inline event handlers
  body = rewriteInternalLinks(body);
  body = rewriteFooterCredit(body);
  body = rewriteContactFormAction(body);
  body = stripInjectedSpam(body);
  body = unwrapDeadLinks(body);
  body = fillAltText(body);
  body = localizeAssetUrls(body);

  const bodyClass = (html.match(/<body[^>]*class=["']([^"']*)["']/) || [])[1] || "";

  const out = `// AUTO-GENERATED by scripts/mirror.mjs from ${ORIGIN}${path}
// Do not edit by hand; re-run the mirror script to refresh.
// Shared theme/plugin CSS lives in src/legacy/base.css (imported once by the
// public layout) — this module only carries page-specific inline styles.
export const title = ${JSON.stringify(title)};
export const bodyClass = ${JSON.stringify(bodyClass)};
export const css = ${JSON.stringify(css)};
export const html = ${JSON.stringify(body)};
`;

  const dest = resolve(ROOT, "src/legacy", `${slug}.ts`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, out);
  console.log(
    `wrote ${dest}  (inline-css ${(css.length / 1024).toFixed(0)}kB, html ${(body.length / 1024).toFixed(0)}kB, ${newBaseCss ? "base.css +" + (newBaseCss.length / 1024).toFixed(0) + "kB" : "base.css unchanged"})`,
  );
}

// Our architecture splits CSS into a SHARED base.css (loaded early, in <head>,
// via the (public) layout's import) and PER-PAGE inline <style> (rendered
// later, in <body>). On the real WordPress page, shared theme stylesheets and
// per-page/per-block inline styles are interleaved in whatever order Kadence's
// various hooks happened to print them — NOT always "shared first". When two
// rules have equal CSS specificity, source order is the tiebreaker, so our
// fixed early/late split can invert who wins compared to the live site.
//
// Rather than trying to perfectly replicate WordPress's exact per-page head
// order (fragile, and re-verified per page), we patch the ONE known conflict
// this has caused: Kadence's generic `.alignwide`/`.alignfull` bleed rule
// (meant for full-bleed ROWS) should never apply to a plain content block
// (image, heading, ...) sitting inside a row-layout column — Kadence itself
// carries a reset for exactly this, and on the live site it happens to win;
// in ours the reset can lose the tiebreak. This !important, narrowly-scoped
// rule guarantees the reset always wins, regardless of source order, without
// touching legitimate full-bleed rows/sections.
const CSS_FIXUPS_MARKER = "/* === MIRROR FIXUPS (auto-appended by scripts/mirror.mjs — do not edit by hand) === */";
const CSS_FIXUPS = `${CSS_FIXUPS_MARKER}
.wp-block-kadence-column .kt-inside-inner-col > :is(.alignwide, .alignfull):not(.wp-block-kadence-rowlayout) {
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* Kadence Forms hides its submit button by default (\`.kb-submit-field {
   display: none }\`, keyed to each form's unique ID) and reveals it via JS as
   a bot-mitigation measure. We have no such JS, so every mirrored form (
   kontakt, home, opinie) is left with no visible submit button at all. Since
   hiding it serves no purpose without the anti-bot JS behind it, always show it. */
.kadence-blocks-form-field.kb-submit-field {
  display: flex !important;
}

/* FAQ accordion (Getwid Accordion, see getwid-accordion-hydrator.tsx) used
   Font Awesome +/− glyphs (a webfont dependency) for its expand/collapse
   indicator — replaced with a plain CSS chevron: pointing down when
   collapsed, up when open (client's explicit ask). The hydrator toggles
   \`.is-open\` on the header wrapper; the original icon spans are hidden. */
.wp-block-getwid-accordion__icon {
  display: none !important;
}
.wp-block-getwid-accordion__header-wrapper a::after {
  /* Getwid's own CSS has a higher-specificity rule forcing this pseudo-element
     to display:none — override it, this IS the chevron. */
  display: block !important;
  content: "";
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-left: 0.75em;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}
.wp-block-getwid-accordion__header-wrapper.is-open a::after {
  transform: rotate(-135deg);
}
`;

export function finalizeBaseCss() {
  if (!existsSync(BASE_CSS_PATH)) return;
  const css = readFileSync(BASE_CSS_PATH, "utf8");
  const withoutOld = css.split(CSS_FIXUPS_MARKER)[0].trimEnd();
  writeFileSync(BASE_CSS_PATH, withoutOld + "\n\n" + CSS_FIXUPS);
}

// CLI entrypoint: `node scripts/mirror.mjs <slug> <path>`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [slug, path] = process.argv.slice(2);
  if (!slug || !path) {
    console.error("usage: node scripts/mirror.mjs <slug> <path>");
    process.exit(1);
  }
  await mirrorPage(slug, path);
  finalizeBaseCss();
}
