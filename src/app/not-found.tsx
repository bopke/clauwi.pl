import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="font-heading text-6xl font-medium text-brand">404</p>
          <h1 className="mt-4 font-heading text-3xl font-medium uppercase text-ink md:text-4xl">
            Nie znaleziono strony
          </h1>
          <p className="mt-4 text-ink/75">
            Strona, której szukasz, nie istnieje albo została przeniesiona. Sprawdź adres
            lub wróć na stronę główną.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-[1px] border border-brand bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand/90"
            >
              Strona główna
            </Link>
            <Link
              href="/kalendarz-wydarzen"
              className="rounded-[1px] border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Kalendarz kursów
            </Link>
            <Link
              href="/o-nas/lista-doradcow"
              className="rounded-[1px] border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Lista doradców
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
