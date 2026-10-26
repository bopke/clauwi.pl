"use client";

import { useActionState, useEffect } from "react";
import { submitBookingAction, type BookingFormResult } from "@/app/(public)/kalendarz-wydarzen/actions";
import { useTurnstile } from "./use-turnstile";

const INITIAL: BookingFormResult = { ok: false, error: "" };

export function BookingForm({ courseId, spotsLeft }: { courseId: string; spotsLeft: number }) {
  const { containerRef: turnstileContainerRef, reset: resetTurnstile } = useTurnstile();
  const [state, formAction, pending] = useActionState(async (_prev: BookingFormResult, formData: FormData) => {
    return submitBookingAction(formData);
  }, INITIAL);

  // This form doesn't reload the page on error (useActionState keeps it
  // mounted), so a failed attempt would otherwise leave a stale, already-
  // consumed Turnstile token behind — reset the widget so retrying works.
  useEffect(() => {
    if (!state.ok && state.error) resetTurnstile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the result changes
  }, [state]);

  if (spotsLeft === 0) {
    return <p className="rounded-[1px] border border-red-200 bg-red-50 p-6 text-center text-red-700">Brak wolnych miejsc na ten kurs.</p>;
  }

  if (state.ok) {
    return (
      <p className="rounded-[1px] border border-green-200 bg-green-50 p-6 text-center text-green-700">
        Dziękujemy za zgłoszenie! Skontaktujemy się w sprawie potwierdzenia i płatności.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="firstName" required placeholder="Imię" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
        <input name="lastName" required placeholder="Nazwisko" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" required placeholder="E-mail" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
        <input name="phone" placeholder="Telefon" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink/70">
        Liczba osób
        <input name="seats" type="number" min={1} max={Math.min(10, spotsLeft)} defaultValue={1} className="w-20 rounded-[1px] border border-border px-3 py-2 outline-none focus:border-brand" />
      </label>
      <textarea name="message" rows={4} placeholder="Wiadomość (opcjonalnie)" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
      <label className="flex items-start gap-3 text-sm text-ink/70">
        <input type="checkbox" name="gdprConsent" required value="1" className="mt-1 size-4 shrink-0 accent-[#cb8c7c]" />
        <span>
          Wyrażam zgodę na przetwarzanie moich danych zgodnie z{" "}
          <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="text-brand underline decoration-brand/40 underline-offset-2">
            polityką prywatności
          </a>
          .
        </span>
      </label>
      <div ref={turnstileContainerRef} className="turnstile-widget" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[1px] bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#b87565] disabled:opacity-60"
      >
        {pending ? "Wysyłanie…" : "Zapisz się"}
      </button>
    </form>
  );
}
