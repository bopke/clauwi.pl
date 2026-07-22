import type { Metadata } from "next";
import "@/legacy/base.css";
import { LegacyPage } from "@/components/clauwi/legacy-page";
import { JsonLd } from "@/components/clauwi/json-ld";
import { CONTACT } from "@/lib/clauwi/site";
import * as home from "@/legacy/home";

export const metadata: Metadata = {
  title: "ClauWi® — Szkoła doradców noszenia",
  description:
    "ClauWi® — szkoła kształcąca doradców noszenia. Kursy podstawowe i zaawansowane, certyfikacja, lista aktywnych doradców w Twoim województwie.",
  alternates: { canonical: "/" },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "ClauWi®",
  alternateName: "Szkoła Doradców Noszenia ClauWi®",
  url: "https://clauwi.pl",
  logo: "https://clauwi.pl/brand/logo-clauwi.png",
  description:
    "ClauWi® — szkoła kształcąca doradców noszenia. Kursy podstawowe i zaawansowane, certyfikacja, refresh.",
  email: CONTACT.email,
  telephone: CONTACT.phoneHref.replace("tel:", ""),
  address: {
    "@type": "PostalAddress",
    streetAddress: "ul. Obozowa 56",
    postalCode: "01-423",
    addressLocality: "Warszawa",
    addressCountry: "PL",
  },
  sameAs: [CONTACT.facebook],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={ORGANIZATION_JSON_LD} />
      <LegacyPage css={home.css} html={home.html} bodyClass={home.bodyClass} />
    </>
  );
}
