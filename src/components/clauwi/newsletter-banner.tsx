"use client";

import { useState } from "react";
import Link from "next/link";

const FIELD =
  "block min-h-10 w-full rounded-[3px] border-2 border-[#f2b6ab] bg-white px-3 py-2.5 font-sans text-[16px] text-[#2d3748] placeholder:text-[#718096] focus:outline-none";

/**
 * Newsletter sign-up band, shown above the footer on every public page.
 *
 * Frontend only for now: submitting just swaps the form for a thank-you
 * note — nothing is stored or sent until collection is built.
 */
export function NewsletterBanner() {
  const [done, setDone] = useState(false);

  return (
    <section aria-labelledby="newsletter-heading" className="bg-[#f9efec] px-6 py-[30px] text-[#2D3748]">
      <div className="mx-auto flex max-w-[1050px] flex-col items-center gap-5 min-[900px]:flex-row min-[900px]:gap-10">
        <div className="text-center min-[900px]:flex-1 min-[900px]:text-left">
          <h2 id="newsletter-heading" className="font-heading text-[30px] leading-[1.2] text-[#692d2c]">
            Bądź na bieżąco
          </h2>
          <p className="mt-1 font-heading text-[17px] leading-[27.2px]">
            Zapisz się do newslettera — damy znać o nowych terminach kursów i ofertach ClauWi®.
          </p>
        </div>
        {done ? (
          <p role="status" className="font-heading text-[19px] leading-[27.2px] w-full max-w-[480px] text-center text-[#692d2c] min-[900px]:flex-1 min-[900px]:text-left">
            Dziękujemy! Sprawdź skrzynkę, aby potwierdzić zapis.
          </p>
        ) : (
          <form
            className="w-full max-w-[480px] min-[900px]:flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <div className="flex gap-2">
              <input type="email" name="email" required placeholder="Twój e-mail" aria-label="E-mail" autoComplete="email" className={FIELD} />
              <button
                type="submit"
                className="shrink-0 cursor-pointer bg-[#cb8c7c] px-5 font-sans text-[17px] text-white shadow-[3px_4px_5px_0_rgba(0,0,0,0.2)] hover:bg-[#b87565]"
              >
                Zapisz się
              </button>
            </div>
            <label className="mt-2 flex items-start gap-2 font-sans text-[13px] leading-[1.4] text-[#4a5568]">
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
