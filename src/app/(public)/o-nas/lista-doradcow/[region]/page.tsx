import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { AdvisorSearchTable } from "@/components/clauwi/advisor-search-table";
import { REGION_META } from "@/lib/clauwi/advisors";
import { listPublicAdvisors } from "@/lib/clauwi/advisors-repo";

// Advisor data lives in D1 and is managed from the admin panel — never
// prerender this at build time, always read the current rows.
export const dynamic = "force-dynamic";

function findRegion(slug: string) {
  return REGION_META.find((w) => w.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const m = findRegion(region);
  if (!m) return { title: "Doradcy" };
  const title = `Doradcy noszenia — ${m.name}`;
  const description = `Lista aktywnych Doradców Noszenia ClauWi® w regionie: ${m.name}. Kontakt, poziom certyfikacji i oferta każdego doradcy.`;
  const url = `/o-nas/lista-doradcow/${region}`;
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
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const meta = findRegion(region);
  if (!meta) notFound();

  const { items } = await listPublicAdvisors({ region, q: "", sort: "name", offset: 0, limit: 500 });

  return (
    <div className="flex min-h-full flex-col">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Strona główna", url: "/" },
          { name: "Doradcy", url: "/o-nas/lista-doradcow" },
          { name: meta.name, url: `/o-nas/lista-doradcow/${region}` },
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

          {items.length > 0 && <AdvisorSearchTable items={items} />}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
