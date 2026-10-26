"use client";

import Link from "next/link";
import Script from "next/script";
import { useTurnstile } from "./use-turnstile";
import { FormStatusMessage } from "./form-status-message";

const FIELD =
  "block min-h-10 w-full rounded-[3px] border-2 border-[#f2b6ab] bg-white px-3 py-2.5 text-[#2d3748] placeholder:text-[#718096] focus:outline-none";

/**
 * The contact form (contact page and home page), styled as the original
 * Kadence form. It posts natively to /api/contact — field names are the ones
 * that route expects — and works without JavaScript; the route redirects back
 * with ?contact=ok|error, which shows a status line above the form.
 */
export function ContactForm() {
  const { containerRef } = useTurnstile();
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <FormStatusMessage
        param="contact"
        ok="Dziękujemy! Wiadomość została wysłana."
        error="Nie udało się wysłać wiadomości. Sprawdź, czy wszystkie pola są wypełnione, i spróbuj ponownie."
      />
      <form action="/api/contact" method="post" className="relative -mx-[5px] flex flex-wrap items-end text-left">
        <div className="mb-4 w-full px-[5px]">
          <input name="kb_field_0" type="text" placeholder="Imię" aria-label="Imię" autoComplete="name" required className={FIELD} />
        </div>
        <div className="mb-4 w-full px-[5px]">
          <input name="kb_field_1" type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email" required className={FIELD} />
        </div>
        <div className="mb-4 w-full px-[5px]">
          <textarea name="kb_field_2" rows={4} placeholder="Treść wiadomości" aria-label="Treść wiadomości" required className={FIELD} />
        </div>
        <div className="mb-4 flex w-full flex-wrap items-start px-[5px]">
          <Link href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="block basis-full">
            Polityka prywatności
          </Link>
          <input type="checkbox" id="contact-consent" name="kb_field_3" value="accept" required className="mt-2 mr-2" />
          <label htmlFor="contact-consent" className="flex-1 leading-[30.6px]">
            Wyrażam zgodę na przetwarzanie moich danych zgodnie z polityką prywatności.
            <span className="ml-[5px] text-[#e53e3e]">*</span>
          </label>
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
            className="mt-[30px] flex w-[116px] cursor-pointer justify-center bg-[#cb8c7c] px-4 py-2 font-sans text-[18px] leading-[33px] text-white shadow-[3px_4px_5px_0_rgba(0,0,0,0.2)]"
          >
            Wyślij
          </button>
        </div>
      </form>
    </>
  );
}
