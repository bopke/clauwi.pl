// Model i pomocnicy listy doradców noszenia ClauWi®.
// Dane przechowywane są w D1 (zob. advisors-repo.ts) — ten moduł zawiera tylko
// typy, metadane (województwa) i bezstanowe helpery widoku.
//
// UWAGA: pola są SPECYFICZNE dla ClauWi i NIE pokrywają się z modelem doradcy
// w specjalisci-easybaby (tam: imię/nazwisko osobno, wiele statusów, wiele
// województw na doradcę, zdjęcie; tu: jedno pełne imię i nazwisko w polu
// `nazwa`, jeden "poziom", jedno województwo, bez zdjęcia).

import { POLAND } from "./poland-map";

export type Advisor = {
  id: string;
  nazwa: string; // pełne imię i nazwisko, np. "Agnieszka Feliks-Długosz"
  poziom: string; // np. "Kurs podstawowy", "Kurs zaawansowany", "Certyfikat" (dla zagranicy bywa nazwą kraju)
  wojewodztwo: string; // slug — jedno z WOJ_META (w tym "zagranica")
  miejscowosc: string; // wolny tekst, np. "Kraków i okolice, Gdów, Wieliczka"
  email: string;
  www: string; // adres strony lub link/opis (np. "Fb: ...")
  telefon: string;
  oferta: string; // "Oferta dodatkowa"
  aktywny: boolean; // odpowiada koncepcji strony "lista aktywnych doradców"
};

export type WojMeta = { slug: string; name: string };

// Poziomy podpowiadane w formularzu — dane źródłowe pokazują, że pole bywa
// też używane na wolny tekst (kraj dla "zagranica"), więc formularz NIE
// wymusza jednego z tych wartości — to tylko szybki wybór.
export const POZIOM_SUGGESTIONS = ["Kurs podstawowy", "Kurs zaawansowany", "Certyfikat"];

export const WOJ_META: WojMeta[] = [
  ...POLAND.regions.map((r) => ({ slug: r.slug, name: r.name })),
  { slug: "zagranica", name: "Doradcy konsultujący za granicą" },
];

// Wpis allowlisty (współdzielony typ, bez efektów ubocznych — używany też po stronie serwera).
export type AllowEntry = { email: string; added: string };

export const AdvisorUtil = {
  wojName(slug: string): string {
    const m = WOJ_META.find((w) => w.slug === slug);
    return m ? m.name : slug;
  },
  countByWoj(advisors: Advisor[]): Record<string, number> {
    const m: Record<string, number> = {};
    advisors.forEach((a) => { m[a.wojewodztwo] = (m[a.wojewodztwo] || 0) + 1; });
    return m;
  },
};
