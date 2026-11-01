"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStyle, rememberDismissed, subscribe, wasDismissed, type NewsletterStyle } from "./newsletter-store";

/** How long the thank-you note stays up before the bar goes away. */
const THANKS_MS = 3500;

/**
 * Per-style classes. Every style shares the same markup; they differ only in
 * these. Up for evaluation on staging (picker in the staging bar) — once one
 * is chosen the rest go.
 */
type Skin = {
  /** Outer wrapper: position, width, colours. */
  root: string;
  inner: string;
  heading: string;
  /** Short pitch — hidden on phones to keep the bar low. */
  pitch: string;
  field: string;
  button: string;
  consent: string;
  close: string;
  thanks: string;
};

const SKINS: Record<NewsletterStyle, Skin> = {
  // 1. Solid brand terracotta, white type — like the site's buttons, stretched.
  1: {
    root: "inset-x-0 bg-[#cb8c7c] text-white",
    inner: "max-w-[1100px] px-4 py-3",
    heading: "font-heading text-[24px] italic leading-tight",
    pitch: "font-heading text-[17px] leading-snug text-white/90",
    field: "border border-white/70 bg-white/95 text-[#2d3748] placeholder:text-[#718096]",
    button: "bg-[#692d2c] text-white uppercase tracking-[0.08em] hover:bg-[#561f1e]",
    consent: "text-white/90 [&_a]:text-white",
    close: "text-white/80 hover:text-white",
    thanks: "font-heading text-[20px] italic",
  },
  // 2. Floating white card in the corner — the page stays visible around it.
  2: {
    root: "right-0 left-0 m-3 min-[640px]:left-auto min-[640px]:m-5 min-[640px]:w-[400px] border-t-4 border-[#cb8c7c] bg-white text-[#2D3748] shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
    inner: "flex-col! items-stretch! gap-3! px-5 py-4 text-left!",
    heading: "font-heading text-[26px] leading-tight text-[#692d2c]",
    pitch: "font-heading text-[17px] leading-snug",
    field: "border-2 border-[#f2b6ab] bg-white text-[#2d3748] placeholder:text-[#718096]",
    button: "bg-[#cb8c7c] text-white uppercase tracking-[0.08em] hover:bg-[#b87565]",
    consent: "text-[#4a5568]",
    close: "text-[#692d2c]/60 hover:text-[#692d2c]",
    thanks: "font-heading text-[20px] text-[#692d2c]",
  },
  // 3. Slim white strip, hairline on top, underlined field — barely there.
  3: {
    root: "inset-x-0 border-t border-[#e8d6d1] bg-white/95 text-[#2D3748] backdrop-blur",
    inner: "max-w-[1100px] px-4 py-2.5",
    heading: "font-heading text-[20px] leading-tight text-[#692d2c]",
    pitch: "font-heading text-[16px] leading-snug text-[#4a5568]",
    field: "border-0 border-b-2 border-[#cb8c7c] bg-transparent px-1! text-[#2d3748] placeholder:text-[#718096]",
    button: "bg-transparent text-[#cb8c7c] uppercase tracking-[0.1em] font-semibold hover:text-[#692d2c] shadow-none!",
    consent: "text-[#718096]",
    close: "text-[#718096] hover:text-[#2d3748]",
    thanks: "font-heading text-[19px] text-[#692d2c]",
  },
  // 4. Deep burgundy (the headings' colour), cream type, terracotta button.
  4: {
    root: "inset-x-0 bg-[#692d2c] text-[#fbf1ed]",
    inner: "max-w-[1100px] px-4 py-3.5",
    heading: "font-heading text-[26px] font-light leading-tight",
    pitch: "font-heading text-[17px] leading-snug text-[#fbf1ed]/85",
    field: "border border-[#cb8c7c] bg-[#fbf1ed] text-[#2d3748] placeholder:text-[#718096]",
    button: "bg-[#cb8c7c] text-white uppercase tracking-[0.08em] hover:bg-[#d89c8c]",
    consent: "text-[#fbf1ed]/80 [&_a]:text-[#fbf1ed]",
    close: "text-[#fbf1ed]/70 hover:text-white",
    thanks: "font-heading text-[21px] font-light",
  },
  // 5. The site's own grey band, uppercase light heading like its sections.
  5: {
    root: "inset-x-0 border-t-2 border-[#cb8c7c] bg-[#f4f4f4] text-[#2D3748]",
    inner: "max-w-[1100px] px-4 py-3",
    heading: "font-heading text-[24px] font-light uppercase tracking-[0.12em] leading-tight text-[#692d2c]",
    pitch: "font-heading text-[17px] leading-snug",
    field: "border border-[#d9d9d9] bg-white text-[#2d3748] placeholder:text-[#718096]",
    button: "bg-[#cb8c7c] text-white uppercase tracking-[0.08em] hover:bg-[#b87565]",
    consent: "text-[#4a5568]",
    close: "text-[#692d2c]/60 hover:text-[#692d2c]",
    thanks: "font-heading text-[20px] text-[#692d2c]",
  },
};

/**
 * Newsletter sign-up bar along the bottom of the viewport on the public site.
 * Closing it (×) or signing up hides it for good in this browser. The consent
 * checkbox only unfolds once the visitor starts on the e-mail field, so the
 * idle bar stays low.
 *
 * Frontend only for now: submitting just shows a thank-you note — nothing is
 * stored or sent until collection is built.
 */
export function NewsletterBanner() {
  // Server render and hydration treat it as dismissed, so visitors who closed
  // it never see it flash in; the real value is read on the client.
  const dismissed = useSyncExternalStore(subscribe, wasDismissed, () => true);
  const style = useSyncExternalStore(subscribe, getStyle, () => 1 as NewsletterStyle);
  const [engaged, setEngaged] = useState(false);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  // The bar is fixed, so an equally tall spacer at the end of the page keeps
  // the footer from ending up underneath it.
  const [height, setHeight] = useState(0);
  const measure = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (dismissed && !done) return null;
  if (gone) return null;
  const s = SKINS[style];

  return (
    <>
      <div aria-hidden style={{ height }} className="shrink-0" />
      <section ref={measure} aria-labelledby="newsletter-heading" className={cn("fixed bottom-0 z-[100000]", s.root)}>
        <button
          type="button"
          onClick={rememberDismissed}
          aria-label="Zamknij"
          className={cn("absolute top-1 right-2 cursor-pointer p-1 font-sans text-[24px] leading-none", s.close)}
        >
          ×
        </button>
        <div className={cn("mx-auto flex flex-col items-center gap-2 pr-8 text-center min-[900px]:flex-row min-[900px]:gap-8 min-[900px]:text-left", s.inner)}>
          <div className="min-[900px]:flex-1">
            <h2 id="newsletter-heading" className={s.heading}>
              Newsletter ClauWi®
            </h2>
            <p className={cn("max-[639px]:hidden", s.pitch)}>Nowe terminy kursów i oferty — prosto na Twoją skrzynkę.</p>
          </div>
          {done ? (
            <p role="status" className={cn("w-full max-w-[480px] min-[900px]:flex-1", s.thanks)}>
              Dziękujemy! Sprawdź skrzynkę, aby potwierdzić zapis.
            </p>
          ) : (
            <form
              className="w-full max-w-[480px] min-[900px]:flex-1"
              onFocus={() => setEngaged(true)}
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
                rememberDismissed();
                setTimeout(() => setGone(true), THANKS_MS);
              }}
            >
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Twój e-mail"
                  aria-label="E-mail"
                  autoComplete="email"
                  className={cn("block min-h-10 w-full min-w-0 rounded-none px-3 py-2 font-sans text-[16px] focus:outline-none", s.field)}
                />
                <button type="submit" className={cn("shrink-0 cursor-pointer px-4 font-sans text-[14px] shadow-[3px_4px_5px_0_rgba(0,0,0,0.15)]", s.button)}>
                  Zapisz się
                </button>
              </div>
              {engaged && (
                <label className={cn("mt-1.5 flex items-start gap-2 text-left font-sans text-[12px] leading-[1.4]", s.consent)}>
                  <input type="checkbox" name="consent" required className="mt-0.5 shrink-0 accent-[#cb8c7c]" />
                  <span>
                    Wyrażam zgodę na otrzymywanie newslettera zgodnie z{" "}
                    <Link href="/polityka-prywatnosci" target="_blank" className="underline underline-offset-2">
                      polityką prywatności
                    </Link>
                    .
                  </span>
                </label>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
