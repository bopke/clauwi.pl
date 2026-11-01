"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const FIELD =
  "block min-h-10 w-full min-w-0 rounded-[3px] border-2 border-[#f2b6ab] bg-white px-3 py-2 font-sans text-[16px] text-[#2d3748] placeholder:text-[#718096] focus:outline-none";

const STORAGE_KEY = "clauwi-newsletter-dismissed";
/** How long the thank-you note stays up before the banner goes away. */
const THANKS_MS = 3500;

// Storage can be missing or throw (private mode, blocked site data) — then the
// banner simply shows again on the next visit.
function wasDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) != null;
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {}
}

const noSubscribe = () => () => {};

/**
 * Newsletter sign-up bar, stuck to the bottom of the viewport on the public
 * site (sticky rather than fixed, so at the end of the page it sits below
 * the footer instead of covering it). Closing it (×) or signing up hides it
 * for good in this browser.
 *
 * Frontend only for now: submitting just shows a thank-you note — nothing is
 * stored or sent until collection is built.
 */
export function NewsletterBanner() {
  // Server render and hydration treat it as dismissed, so visitors who closed
  // it never see it flash in; the real value is read once on the client.
  const dismissedBefore = useSyncExternalStore(noSubscribe, wasDismissed, () => true);
  const [closed, setClosed] = useState(false);
  const [done, setDone] = useState(false);

  if (dismissedBefore || closed) return null;

  function close() {
    rememberDismissed();
    setClosed(true);
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="sticky bottom-0 z-[100000] border-t border-[#f2b6ab] bg-[#f9efec] px-4 py-3 text-[#2D3748] shadow-[0_-4px_14px_rgba(0,0,0,0.08)]"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Zamknij"
        className="absolute top-1 right-2 cursor-pointer p-1 font-sans text-[24px] leading-none text-[#692d2c]/70 hover:text-[#692d2c]"
      >
        ×
      </button>
      <div className="mx-auto flex max-w-[1050px] flex-col items-center gap-2 pr-6 min-[900px]:flex-row min-[900px]:gap-8">
        <div className="text-center min-[900px]:flex-1 min-[900px]:text-left">
          <h2 id="newsletter-heading" className="font-heading text-[24px] leading-[1.2] text-[#692d2c]">
            Bądź na bieżąco
          </h2>
          <p className="font-heading text-[16px] leading-[1.4]">
            Zapisz się do newslettera — damy znać o nowych terminach kursów i ofertach ClauWi®.
          </p>
        </div>
        {done ? (
          <p role="status" className="w-full max-w-[480px] text-center font-heading text-[19px] leading-[27.2px] text-[#692d2c] min-[900px]:flex-1 min-[900px]:text-left">
            Dziękujemy! Sprawdź skrzynkę, aby potwierdzić zapis.
          </p>
        ) : (
          <form
            className="w-full max-w-[480px] min-[900px]:flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              rememberDismissed();
              setDone(true);
              setTimeout(() => setClosed(true), THANKS_MS);
            }}
          >
            <div className="flex gap-2">
              <input type="email" name="email" required placeholder="Twój e-mail" aria-label="E-mail" autoComplete="email" className={FIELD} />
              <button
                type="submit"
                className="shrink-0 cursor-pointer bg-[#cb8c7c] px-4 font-sans text-[16px] text-white shadow-[3px_4px_5px_0_rgba(0,0,0,0.2)] hover:bg-[#b87565]"
              >
                Zapisz się
              </button>
            </div>
            <label className="mt-1.5 flex items-start gap-2 font-sans text-[12px] leading-[1.4] text-[#4a5568]">
              <input type="checkbox" name="consent" required className="mt-0.5 shrink-0 accent-[#cb8c7c]" />
              <span>
                Wyrażam zgodę na otrzymywanie newslettera zgodnie z{" "}
                <Link href="/polityka-prywatnosci" target="_blank" className="underline underline-offset-2">
                  polityką prywatności
                </Link>
                .
              </span>
            </label>
          </form>
        )}
      </div>
    </section>
  );
}
