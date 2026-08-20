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
