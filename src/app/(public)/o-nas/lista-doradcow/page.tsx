import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { PolandMap } from "@/components/clauwi/poland-map";
import { WOJ_META } from "@/lib/clauwi/advisors";
import { getWojCounts } from "@/lib/clauwi/advisors-repo";

const ZAGRANICA_SLUG = "zagranica";

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
  const regions = WOJ_META.filter((m) => m.slug !== ZAGRANICA_SLUG);
  const zagranica = WOJ_META.find((m) => m.slug === ZAGRANICA_SLUG);

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
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-center font-heading text-4xl font-medium uppercase text-brand md:text-5xl">
            Lista Aktywnych Doradców
          </h1>
          <p className="mt-6 text-center text-ink/75">
            Znajdź aktywnych doradców działających w Twoim województwie.
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-center">
            <PolandMap />

            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {regions.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/o-nas/lista-doradcow/${m.slug}`}
                    className="flex items-center gap-2 text-ink/85 transition-colors hover:text-brand"
                  >
                    <CircleCheck className="size-4 shrink-0 text-brand" />
                    <span className="truncate underline decoration-brand/40 underline-offset-2">
                      {m.name}
                    </span>
                    <span className="ml-auto text-sm text-ink/50">{counts[m.slug] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {zagranica && (
            <div className="mt-10 text-center">
              <Link
                href={`/o-nas/lista-doradcow/${zagranica.slug}`}
                className="inline-flex items-center gap-2 rounded-[1px] border border-brand px-6 py-3 text-sm uppercase tracking-wide text-brand transition-colors hover:bg-brand hover:text-white"
              >
                {zagranica.name}
                <span className="text-xs text-inherit opacity-70">({counts[zagranica.slug] ?? 0})</span>
              </Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
