import { POLAND } from "@/lib/clauwi/poland-map";

// Clickable Poland voivodeship map — matches the blue interactive map on the
// live site's advisor index (there, a 2009-era CSS-sprite plugin; here, a
// real inline SVG built from the region geometry already in poland-map.ts).
export function PolandMap() {
  return (
    <svg
      viewBox={POLAND.viewBox}
      role="img"
      aria-label="Mapa Polski — wybierz województwo, aby zobaczyć listę doradców"
      className="mx-auto h-auto w-full max-w-sm"
    >
      {POLAND.regions.map((r) => (
        <a key={r.slug} href={`/o-nas/lista-doradcow/${r.slug}`}>
          <path
            d={r.d}
            className="cursor-pointer fill-[#6699cc] stroke-white stroke-[1.5] transition-colors hover:fill-[#4d7aa8]"
          >
            <title>{r.name}</title>
          </path>
        </a>
      ))}
    </svg>
  );
}
