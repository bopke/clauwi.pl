// Shared helpers for building page metadata (mirrored legacy titles come as
// raw HTML-entity-encoded strings with a trailing "– CLAUWI®" that would
// double up with the root layout's own title template).
export function cleanMirroredTitle(raw: string): string {
  return raw
    .replace(/&#8211;|&ndash;|&#8212;|&mdash;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/\s*-\s*CLAUWI®\s*$/i, "")
    .trim();
}
