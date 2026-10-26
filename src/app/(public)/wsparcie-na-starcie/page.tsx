import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "wsparcie-na-starcie";

export const metadata: Metadata = staticPageMetadata(KEY);

const inter = Inter({ subsets: ["latin", "latin-ext"], weight: "600" });

/**
 * Standalone landing page (it had its own template in WordPress: no site
 * header, no footer). The heading and the line under it declare Belleza and
 * Open Sans, exactly as the original did — neither font was ever loaded, so
 * both render in the browser's default serif, which is how the page looks.
 */
export default function WsparcieNaStarciePage() {
  return (
    <main id="main" className="font-heading text-[17px] leading-[27.2px] text-[#2d3748] [word-break:break-word]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-1.5 focus:top-1.5 focus:z-[100001] focus:bg-white focus:px-6 focus:py-4 focus:text-sm focus:font-bold focus:text-[#21759b]"
      >
        Skip to content
      </a>
      <PageJsonLd pageKey={KEY} />
      <div
        className="relative bg-[#647354] bg-cover bg-[position:56%_57%]"
        style={{ backgroundImage: "url(/assets/wp-content/uploads/2021/07/PB081157-kopia-scaled.jpg)" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#647354_68%,rgba(100,115,84,0)_98%)] opacity-[0.86]" />
        {/* 89px = the row's 73px top padding plus the 16px gap after its empty first column. */}
        <div className="relative z-[1] mx-auto max-w-[1290px] px-6 pt-[89px] min-[768px]:pb-[59px]">
          <div className="text-center">
            <h2
              className="mb-[15px] text-[68px] leading-[102px] tracking-[1px] text-white uppercase"
              style={{ fontFamily: "Belleza" }}
            >
              Wsparcie rodzica na Starcie
            </h2>
            <p className="mb-[15px] text-[18px] leading-[28.8px] text-[#fefefe]" style={{ fontFamily: '"Open Sans"' }}>
              Kalendarz kursów rozwijających kompetencje specjalistów
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-[8.5px]">
            <a
              href="https://izabelabanach.pl/szkolenia-dla-specjalistow/"
              className={`${inter.className} inline-block rounded-[60px] bg-white px-9 py-[10.72px] text-center text-[16px] font-semibold leading-[25.6px] text-[#647354] uppercase transition-shadow hover:text-[#647354] hover:shadow-[0_15px_25px_-7px_rgba(0,0,0,0.1)]`}
            >
              Wróć do Strefy Specjalisty
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
