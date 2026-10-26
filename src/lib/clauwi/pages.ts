// The site's static pages — originally WordPress pages, now hand-built React
// routes. Keys are URL paths without leading/trailing slash and MUST stay
// exactly as they were in WordPress (they carry the SEO history), typos
// included: "regulam-i-zasady-naboru", "/strona-glowna/…".
//
// Titles are the pages' original WordPress titles (minus the "– CLAUWI®"
// suffix the root layout's title template adds back).

import type { Metadata } from "next";
import type { Crumb } from "./breadcrumbs";
import { SEO_DESCRIPTIONS } from "./seo-descriptions";
import { getBlogPostMeta } from "./blog-meta";

export type PageKind = "page" | "blog" | "category" | "post";

export type StaticPage = { key: string; title: string; kind: PageKind };

export const STATIC_PAGES: StaticPage[] = [
  { key: "o-nas", title: "O nas", kind: "page" },
  { key: "strona-glowna/system-ksztalcenia", title: "System kształcenia", kind: "page" },
  { key: "regulam-i-zasady-naboru", title: "Zasady naboru", kind: "page" },
  { key: "strona-glowna/faq", title: "FAQ", kind: "page" },
  { key: "kontakt", title: "Kontakt", kind: "page" },
  { key: "opinie", title: "Opinie", kind: "page" },
  { key: "wsparcie-na-starcie", title: "Wsparcie na Starcie", kind: "page" },
  { key: "konferencja-clauwi2025", title: "Konferencja Doradców Noszenia Dzieci ClauWi®", kind: "page" },
  { key: "polityka-prywatnosci", title: "Polityka prywatności", kind: "page" },
  { key: "blog", title: "Blog", kind: "blog" },
  { key: "siegnij-po-spelnienie-marzen-dobro-wraca", title: "Sięgnij po spełnienie marzeń! dobro wraca!", kind: "post" },
  { key: "nowa-odslona-clauwi", title: "Nowa odsłona ClauWI", kind: "post" },
  { key: "nie-nos-bo-rozpiescisz", title: "Nie noś, bo rozpieścisz.", kind: "post" },
  { key: "noszenie-na-wsi", title: "Noszenie na wsi.", kind: "post" },
  { key: "noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa", title: "Noszenie w chuście przez rodzica z dyskopatią lędźwiową", kind: "post" },
  { key: "a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go", title: "A co na to fizjoterapeuta, osteopata, ortopeda, pediatra? zapytaj go!", kind: "post" },
  { key: "jak-dlugo-mozna-nosic-dziecko-w-chuscie", title: "Jak długo można nosić dziecko w chuście?", kind: "post" },
  { key: "chustonoszenie-jako-profilaktyka-problemow-logopedycznych", title: "Chustonoszenie jako profilaktyka problemów logopedycznych", kind: "post" },
  { key: "category/bez-kategorii", title: "Brak kategorii", kind: "category" },
  { key: "category/doradcy-pisza", title: "doradcy piszą", kind: "category" },
];

export function getStaticPage(key: string): StaticPage {
  const page = STATIC_PAGES.find((p) => p.key === key);
  if (!page) throw new Error(`Unknown static page: ${key}`);
  return page;
}

/** Metadata exactly as the WordPress-mirror catch-all produced it, so SEO output is unchanged. */
export function staticPageMetadata(key: string): Metadata {
  const { title } = getStaticPage(key);
  const description = SEO_DESCRIPTIONS[key];
  const url = `/${key}`;
  const post = getBlogPostMeta(key);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: post
      ? { title, description, url, type: "article", publishedTime: post.datePublished, modifiedTime: post.dateModified, authors: [post.author], images: [post.image] }
      : { title, description, url, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

// Blog posts and categories nest under Blog; everything else sits directly
// under the home page.
export function staticPageBreadcrumbs(key: string): Crumb[] {
  const { title, kind } = getStaticPage(key);
  const home = { name: "Strona główna", url: "/" };
  if (kind === "blog") return [home, { name: "Blog", url: "/blog" }];
  if (kind === "category" || kind === "post") return [home, { name: "Blog", url: "/blog" }, { name: title, url: `/${key}` }];
  return [home, { name: title, url: `/${key}` }];
}
