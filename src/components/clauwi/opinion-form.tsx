"use client";

import Script from "next/script";
import { useTurnstile } from "./use-turnstile";
import { FormStatusMessage } from "./form-status-message";

const FIELD =
  "block w-full rounded-[3px] border border-[#a0aec0] bg-white px-3 py-2.5 text-[#2d3748] placeholder:text-[#718096] focus:outline-none";

/**
 * The testimonial form on /opinie, styled as the original Kadence form. It
 * posts natively to /api/opinion, which e-mails the opinion to the ClauWi®
 * inbox (publishing stays manual). In the WordPress mirror this form posted
 * nowhere and silently dropped what people wrote.
 */
export function OpinionForm() {
  const { containerRef } = useTurnstile();

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <FormStatusMessage
        param="opinion"
        ok="Dziękujemy za opinię! Trafiła do nas i wkrótce ją przeczytamy."
        error="Nie udało się wysłać opinii. Sprawdź, czy pole z treścią jest wypełnione, i spróbuj ponownie."
      />
      <form action="/api/opinion" method="post" className="relative -mx-[5px] flex flex-wrap items-end text-left">
        <div className="mb-4 w-full px-[5px]">
          <input name="kb_field_0" type="text" placeholder="Imię i nazwisko" aria-label="Imię i nazwisko" autoComplete="name" className={FIELD} />
        </div>
        <div className="mb-4 w-full px-[5px]">
          <input name="kb_field_1" type="text" placeholder="Miejsce i data kursu" aria-label="Miejsce i data kursu" className={FIELD} />
        </div>
        <div className="mb-4 w-full px-[5px]">
          <input name="kb_field_2" type="email" placeholder="Adres e-mail" aria-label="Adres e-mail" autoComplete="email" className={FIELD} />
        </div>
        <div className="mb-4 w-full px-[5px]">
          <textarea name="kb_field_3" rows={4} placeholder="Treść opinii" aria-label="Treść opinii" required className={FIELD} />
        </div>
        {/* Honeypot: hidden from people, filled in by bots; the route ignores such submissions. */}
        <input
          type="text"
          name="_kb_verify_email"
          tabIndex={-1}
          autoComplete="new-password"
          aria-hidden="true"
          className="absolute top-0 left-0 -z-10 opacity-0"
        />
        <div ref={containerRef} className="min-h-[73px]" />
        <div className="w-full px-[5px]">
          <button
            type="submit"
            className="flex cursor-pointer justify-center rounded-[3px] bg-[#cb8c7c] px-4 py-2 text-[18px] leading-[32.4px] text-white"
          >
            Wyślij opinię
          </button>
        </div>
      </form>
    </>
  );
}
