// Model and helpers for the ClauWi® babywearing-advisor directory.
// The data lives in D1 (see advisors-repo.ts) — this module only holds types,
// region metadata and stateless view helpers.
//
// NOTE: these fields are SPECIFIC to ClauWi and do not match the advisor model
// in specjalisci-easybaby (there: first/last name separately, several statuses,
// several regions per advisor, a photo; here: one full name in `name`, one
// `level`, one region, no photo).

import { POLAND } from "./poland-map";

export type Advisor = {
  id: string;
  name: string; // full name, e.g. "Agnieszka Feliks-Długosz"
  level: string; // e.g. "Kurs podstawowy", "Kurs zaawansowany", "Certyfikat" (a country name for advisors abroad)
  region: string; // slug — one of REGION_META (including "zagranica")
  locality: string; // free text, e.g. "Kraków i okolice, Gdów, Wieliczka"
  email: string;
  website: string; // a URL or a link/description (e.g. "Fb: ...")
  phone: string;
  services: string; // shown as "Oferta dodatkowa"
  certificationValidUntil: string; // "Ważność uprawnień" — free text
  notes: string; // "Uwagi" — internal, never shown publicly
  active: boolean; // mirrors the site's own "lista aktywnych doradców" concept
};

export type RegionMeta = { slug: string; name: string };

// Levels offered as quick picks in the admin form. The source data shows the
// field is also used for free text (a country name for advisors abroad), so
// the form does NOT restrict input to these values.
export const LEVEL_SUGGESTIONS = ["Kurs podstawowy", "Kurs zaawansowany", "Certyfikat"];

export const REGION_META: RegionMeta[] = [
  ...POLAND.regions.map((r) => ({ slug: r.slug, name: r.name })),
  { slug: "zagranica", name: "Doradcy konsultujący za granicą" },
];

// Allowlist entry (shared type, no side effects — also used server-side).
export type AllowEntry = { email: string; added: string };

export const AdvisorUtil = {
  regionName(slug: string): string {
    const m = REGION_META.find((r) => r.slug === slug);
    return m ? m.name : slug;
  },
  countByRegion(advisors: Advisor[]): Record<string, number> {
    const m: Record<string, number> = {};
    advisors.forEach((a) => { m[a.region] = (m[a.region] || 0) + 1; });
    return m;
  },
};

export type WebsiteItem = { text: string; href?: string; title?: string };

const URL_TOKEN = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:[/?#]\S*)?$/i;
const SHORT_MAX = 40;

function shortUrl(url: string): string {
  const s = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
  return s.length > SHORT_MAX ? s.slice(0, SHORT_MAX - 1) + "…" : s;
}

function urlItem(token: string, text?: string): WebsiteItem {
  const href = /^https?:\/\//i.test(token) ? token : `https://${token}`;
  const short = shortUrl(token);
  return { text: text ?? short, href, title: short.endsWith("…") ? token : undefined };
}

/**
 * The advisor's "Strona WWW" field split into what to show, one item per
 * line: several addresses (one per line, or separated by commas, semicolons
 * or spaces) become separate links, shown without https:// and www. and cut
 * short when long; a description like "Fb: nazwa profilu" stays as text, and
 * a description with one address in it links to that address.
 */
export function websiteItems(website: string): WebsiteItem[] {
  const items: WebsiteItem[] = [];
  for (const part of website.split(/[\n;,]+/).map((p) => p.trim()).filter(Boolean)) {
    const tokens = part.split(/\s+/);
    const urls = tokens.filter((t) => URL_TOKEN.test(t));
    if (urls.length === tokens.length) items.push(...urls.map((t) => urlItem(t)));
    else if (urls.length === 1) items.push(urlItem(urls[0], part.replace(urls[0], shortUrl(urls[0]))));
    else items.push({ text: part });
  }
  return items;
}
