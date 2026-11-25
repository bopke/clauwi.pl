"use client";

import { useActionState, useEffect } from "react";
import { MapPinned } from "lucide-react";
import { submitCourseRequestAction, type CourseRequestResult } from "@/app/(public)/kalendarz-wydarzen/actions";
import { REQUESTABLE_TYPES } from "@/lib/clauwi/courses";
import { useTurnstile } from "./use-turnstile";

const INITIAL: CourseRequestResult = { ok: false, error: "" };

/** "No course in your city? Let us know" — under the course calendar. */
export function CourseRequestForm() {
  const { containerRef: turnstileContainerRef, reset: resetTurnstile } = useTurnstile();
  const [state, formAction, pending] = useActionState(
    async (_prev: CourseRequestResult, formData: FormData) => submitCourseRequestAction(formData),
    INITIAL,
  );

  // A failed attempt consumed the Turnstile token — get a fresh one (see BookingForm).
  useEffect(() => {
    if (!state.ok && state.error) resetTurnstile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the result changes
  }, [state]);

  return (
    <section aria-labelledby="course-request-heading" className="mx-auto mt-16 max-w-3xl rounded-[1px] border border-brand/30 bg-brand/5 px-6 py-8 sm:px-10">
      <div className="flex flex-col items-center text-center">
        <MapPinned className="size-8 text-brand" aria-hidden />
        <h2 id="course-request-heading" className="mt-3 font-heading text-2xl font-medium text-ink md:text-3xl">
          Nie widzisz kursu w swojej okolicy?
        </h2>
        <p className="mt-2 text-ink/70">Daj nam znać, jaki kurs i gdzie — to pomoże nam zaplanować kolejne terminy.</p>
      </div>

      {state.ok ? (
        <p role="status" className="mt-6 rounded-[1px] border border-green-200 bg-green-50 p-5 text-center text-green-700">
          Dziękujemy! Weźmiemy to pod uwagę, planując kolejne kursy.
        </p>
      ) : (
        <form action={formAction} className="mt-6 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink/80">Jaki kurs Cię interesuje?</legend>
            <div className="flex flex-wrap gap-2">
              {REQUESTABLE_TYPES.map((t) => (
                <label key={t} className="cursor-pointer">
                  <input type="checkbox" name="types" value={t} className="peer sr-only" />
                  <span className="inline-block rounded-[1px] border border-border bg-white px-3 py-2 text-sm text-ink/80 transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:border-brand">
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Miejscowość</span>
              <input
                name="city"
                required
                minLength={2}
                maxLength={80}
                placeholder="Twoja miejscowość, np. Wrocław"
                autoComplete="address-level2"
                className="w-full rounded-[1px] border border-border bg-white px-4 py-3 outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[1px] bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#b87565] disabled:opacity-60"
            >
              {pending ? "Wysyłanie…" : "Daj nam znać"}
            </button>
          </div>
          {/* Honeypot — see submitCourseRequestAction. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <div ref={turnstileContainerRef} className="turnstile-widget" />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>
      )}
    </section>
  );
}
