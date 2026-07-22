import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { WOJ_META } from "@/lib/clauwi/advisors";
import { getWojCounts } from "@/lib/clauwi/advisors-repo";

const TITLE = "Lista Doradców Noszenia";
const DESCRIPTION = "Znajdź aktywnych doradców noszenia ClauWi® działających w Twoim województwie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/o-nas/lista-doradcow" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/o-nas/lista-doradcow", type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

// Liczniki czytane z D1 per-request — dane zmieniają się z panelu admina.
export const dynamic = "force-dynamic";

export default async function ListaDoradcowPage() {
  const counts = await getWojCounts();

  return (
    <div className="flex min-h-full flex-col">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Strona główna", url: "/" },
          { name: "Doradcy", url: "/o-nas/lista-doradcow" },
        ])}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-medium uppercase text-brand md:text-5xl">
            Lista Doradców Noszenia
          </h1>
          <p className="mt-6 text-ink/75">
            Znajdź aktywnych doradców działających w Twoim województwie.
          </p>

          <ul className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-2">
            {WOJ_META.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/o-nas/lista-doradcow/${m.slug}`}
                  className="flex items-center justify-between rounded-[1px] border border-border px-5 py-3 text-left transition-colors hover:border-brand hover:text-brand"
                >
                  <span>{m.name}</span>
                  <span className="text-sm text-ink/50">{counts[m.slug] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
