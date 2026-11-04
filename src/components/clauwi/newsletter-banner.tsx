"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { subscribeNewsletterAction } from "@/lib/clauwi/newsletter-actions";

const DISMISSED_KEY = "clauwi-newsletter-dismissed";
const EVENT = "clauwi-newsletter-change";
/** How long the thank-you note stays up before the card goes away. */
const THANKS_MS = 3500;

// Storage can be missing or throw (private mode, blocked site data) — then
// the card simply shows again on the next visit.
function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) != null;
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Newsletter sign-up card, floating in the bottom-right corner of the public
 * site (full width with a small margin on phones). Closing it (×) or signing
 * up hides it for good in this browser. The consent checkbox only unfolds
 * once the visitor starts on the e-mail field, so the idle card stays small.
 */
export function NewsletterBanner() {
  // Server render and hydration treat it as dismissed, so visitors who closed
  // it never see it flash in; the real value is read on the client.
  const dismissed = useSyncExternalStore(subscribe, wasDismissed, () => true);
  // Not on the newsletter's own pages (unsubscribing) — it would be absurd there.
  const onNewsletterPage = usePathname().startsWith("/newsletter/");
  const [engaged, setEngaged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  // The card is fixed, so an equally tall spacer at the end of the page keeps
  // the footer from ending up underneath it.
  const [height, setHeight] = useState(0);
  const measure = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if ((dismissed && !done) || gone || onNewsletterPage) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(false);
    try {
      const res = await subscribeNewsletterAction(new FormData(e.currentTarget));
      if (!res.ok) throw new Error("rejected");
      setDone(true);
      rememberDismissed();
      setTimeout(() => setGone(true), THANKS_MS);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div aria-hidden style={{ height }} className="shrink-0" />
      <section
        ref={measure}
        aria-labelledby="newsletter-heading"
        className="fixed right-0 bottom-0 left-0 z-[100000] m-3 border-t-4 border-[#cb8c7c] bg-white text-[#2D3748] shadow-[0_8px_30px_rgba(0,0,0,0.18)] min-[640px]:left-auto min-[640px]:m-5 min-[640px]:w-[400px]"
      >
        <button
          type="button"
          onClick={rememberDismissed}
          aria-label="Zamknij"
          className="absolute top-1 right-2 cursor-pointer p-1 font-sans text-[24px] leading-none text-[#692d2c]/60 hover:text-[#692d2c]"
        >
          ×
        </button>
        <div className="flex flex-col gap-3 px-5 py-4 pr-8">
          <div>
            <h2 id="newsletter-heading" className="font-heading text-[26px] leading-tight text-[#692d2c]">
              Newsletter ClauWi®
            </h2>
            <p className="font-heading text-[17px] leading-snug max-[639px]:hidden">Nowe terminy kursów i oferty — prosto na Twoją skrzynkę.</p>
          </div>
          {done ? (
            <p role="status" className="font-heading text-[20px] text-[#692d2c]">
              Dziękujemy za zapis!
            </p>
          ) : (
            <form onFocus={() => setEngaged(true)} onSubmit={onSubmit}>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Twój e-mail"
                  aria-label="E-mail"
                  autoComplete="email"
                  className="block min-h-10 w-full min-w-0 rounded-none border-2 border-[#f2b6ab] bg-white px-3 py-2 font-sans text-[16px] text-[#2d3748] placeholder:text-[#718096] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="shrink-0 cursor-pointer bg-[#cb8c7c] px-4 font-sans text-[14px] tracking-[0.08em] text-white uppercase shadow-[3px_4px_5px_0_rgba(0,0,0,0.15)] hover:bg-[#b87565] disabled:opacity-60"
                >
                  Zapisz się
                </button>
              </div>
              {/* Honeypot — see subscribeNewsletterAction. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              {/* Wording kept in step with NEWSLETTER_CONSENT_TEXT (consent log). */}
              {engaged && (
                <label className="mt-1.5 flex items-start gap-2 text-left font-sans text-[12px] leading-[1.4] text-[#4a5568]">
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
              {error && <p className="mt-1.5 font-sans text-[12px] text-red-600">Nie udało się zapisać. Spróbuj ponownie.</p>}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
