"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitBookingAction, type BookingFormResult } from "@/app/(public)/kalendarz-wydarzen/actions";
import { TURNSTILE_SITEKEY } from "@/lib/clauwi/turnstile-sitekey";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; action?: string }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const INITIAL: BookingFormResult = { ok: false, error: "" };

export function BookingForm({ courseId, spotsLeft }: { courseId: string; spotsLeft: number }) {
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [state, formAction, pending] = useActionState(async (_prev: BookingFormResult, formData: FormData) => {
    return submitBookingAction(formData);
  }, INITIAL);

  // Turnstile's implicit `data-sitekey` auto-render only scans the DOM once,
  // when its script first loads — it never picks up this form when it mounts
  // later (e.g. inside the @modal overlay, added well after that initial
  // scan). Render explicitly here instead, every time this component mounts,
  // polling briefly in case the script (loaded lazily) isn't ready yet.
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const render = () => {
      if (cancelled || !turnstileContainerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile?.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        action: "turnstile-spin-v1",
      });
    };

    if (window.turnstile) {
      render();
    } else {
      interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          render();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      // Reset the ref (not just remove the widget) so a remount — e.g. React
      // Strict Mode's dev-only double-invoke, or this form mounting again
      // later — re-renders instead of seeing a stale id and skipping.
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, []);

  // This form doesn't reload the page on error (useActionState keeps it
  // mounted), so a failed attempt would otherwise leave a stale, already-
  // consumed Turnstile token behind — reset the widget so retrying works.
  useEffect(() => {
    if (!state.ok && state.error) window.turnstile?.reset(widgetIdRef.current);
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
