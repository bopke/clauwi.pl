export type Crumb = { name: string; url: string };

/** BreadcrumbList JSON-LD (https://schema.org/BreadcrumbList) from a crumb trail. */
export function breadcrumbListJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `https://clauwi.pl${c.url}`,
    })),
  };
}
