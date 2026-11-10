"use client";

import { useMemo, useState } from "react";
import { websiteItems, type Advisor } from "@/lib/clauwi/advisors";

// Instant client-side filter by name or city — the full region's advisors
// (at most ~100 rows, see listPublicAdvisors) are already loaded server-side,
// so filtering here avoids a page reload per keystroke.
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics — "Krakow" matches "Kraków"
    .toLocaleLowerCase("pl-PL");
}

export function AdvisorSearchTable({ items }: { items: Advisor[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    return items.filter(
      (a) => normalize(a.name).includes(q) || normalize(a.locality).includes(q) || normalize(a.services).includes(q)
    );
  }, [items, query]);

  return (
    <>
      <div className="mt-8 max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj po imieniu i nazwisku, miejscowości lub ofercie…"
          className="w-full rounded-[1px] border border-border px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none"
        />
      </div>

      <p className="mt-4 text-sm text-ink/60">
        {filtered.length === 0
          ? "Brak doradców spełniających kryteria wyszukiwania."
          : `Znaleziono: ${filtered.length}`}
      </p>

      {filtered.length > 0 && (
        // The header row sticks to the top while scrolling. A sticky element
        // only sticks inside its nearest scroll box, so on wide screens the
        // wrapper doesn't scroll (the page does); on phones, where the table
        // needs sideways scrolling, the wrapper scrolls both ways instead.
        <div className="mt-4 max-h-[75svh] overflow-auto md:max-h-none md:overflow-visible">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_var(--color-border)]">
              <tr className="text-left uppercase tracking-wide text-ink/50">
                <th className="py-3 pr-4">Doradca</th>
                <th className="py-3 pr-4">Poziom</th>
                <th className="py-3 pr-4">Miejscowość</th>
                <th className="py-3 pr-4">Adres e-mail</th>
                <th className="py-3 pr-4">Strona WWW</th>
                <th className="py-3 pr-4">Telefon</th>
                <th className="py-3 pr-4">Oferta dodatkowa</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">{a.name}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.level}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.locality}</td>
                  <td className="py-3 pr-4 text-ink/75">
                    {a.email && <a href={`mailto:${a.email}`} className="hover:text-brand">{a.email}</a>}
                  </td>
                  <td className="min-w-[10rem] space-y-1.5 py-3 pr-4 text-ink/75 [overflow-wrap:anywhere]">
                    {websiteItems(a.website).map((w, i) =>
                      w.href ? (
                        <a key={i} href={w.href} title={w.title} target="_blank" rel="noopener" className="block hover:text-brand">{w.text}</a>
                      ) : (
                        <span key={i} className="block">{w.text}</span>
                      )
                    )}
                  </td>
                  <td className="py-3 pr-4 text-ink/75">{a.phone}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.services}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
