// Maps a URL path (matching the live WordPress permalink structure, so
// existing links/SEO keep working) to its mirrored page module.
// "home" (the "/" route) is handled separately by src/app/(public)/page.tsx —
// everything else goes through the [...slug] catch-all route.


export type LegacyModule = {
  title: string;
  bodyClass: string;
  css: string;
  html: string;
};

// Key = URL path with no leading/trailing slash (matches params.slug.join("/")).
export const registry: Record<string, LegacyModule> = {
};
