import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { WOJ_META } from "@/lib/clauwi/advisors";
import { listPublicAdvisors } from "@/lib/clauwi/advisors-repo";

// Advisor data lives in D1 and is managed from the admin panel — never
// prerender this at build time, always read the current rows.
export const dynamic = "force-dynamic";

function findWoj(slug: string) {
  return WOJ_META.find((w) => w.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ woj: string }>;
}): Promise<Metadata> {
  const { woj } = await params;
  const m = findWoj(woj);
  if (!m) return { title: "Doradcy" };
  const title = `Doradcy noszenia — ${m.name}`;
  const description = `Lista aktywnych Doradców Noszenia ClauWi® w regionie: ${m.name}. Kontakt, poziom certyfikacji i oferta każdego doradcy.`;
  const url = `/o-nas/lista-doradcow/${woj}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ woj: string }>;
}) {
  const { woj } = await params;
  const meta = findWoj(woj);
  if (!meta) notFound();

  const { items } = await listPublicAdvisors({ woj, q: "", sort: "nazwa", offset: 0, limit: 500 });

  return (
    <div className="flex min-h-full flex-col">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Strona główna", url: "/" },
          { name: "Doradcy", url: "/o-nas/lista-doradcow" },
          { name: meta.name, url: `/o-nas/lista-doradcow/${woj}` },
        ])}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16">
          <Link href="/o-nas/lista-doradcow" className="text-sm text-ink/60 hover:text-brand">
            ← Wszystkie województwa
          </Link>
          <h1 className="mt-4 font-heading text-4xl font-medium uppercase text-brand md:text-5xl">
            {meta.name}
          </h1>
          <p className="mt-3 text-ink/75">
            {items.length === 0
              ? "Brak aktywnych doradców w tym regionie."
              : `Aktywni doradcy: ${items.length}`}
          </p>

          {items.length > 0 && (
            <div className="mt-10 overflow-x-auto">
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
                  {items.map((a) => (
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
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
