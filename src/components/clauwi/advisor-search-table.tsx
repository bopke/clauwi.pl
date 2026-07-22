"use client";

import { useMemo, useState } from "react";
import type { Advisor } from "@/lib/clauwi/advisors";

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
    return items.filter((a) => normalize(a.nazwa).includes(q) || normalize(a.miejscowosc).includes(q));
  }, [items, query]);

  return (
    <>
      <div className="mt-8 max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj po imieniu i nazwisku lub miejscowości…"
          className="w-full rounded-[1px] border border-border px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none"
        />
      </div>

      <p className="mt-4 text-sm text-ink/60">
        {filtered.length === 0
          ? "Brak doradców spełniających kryteria wyszukiwania."
          : `Znaleziono: ${filtered.length}`}
      </p>

      {filtered.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left uppercase tracking-wide text-ink/50">
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
                  <td className="py-3 pr-4 font-medium">{a.nazwa}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.poziom}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.miejscowosc}</td>
                  <td className="py-3 pr-4 text-ink/75">
                    {a.email && <a href={`mailto:${a.email}`} className="hover:text-brand">{a.email}</a>}
                  </td>
                  <td className="py-3 pr-4 text-ink/75">{a.www}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.telefon}</td>
                  <td className="py-3 pr-4 text-ink/75">{a.oferta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
