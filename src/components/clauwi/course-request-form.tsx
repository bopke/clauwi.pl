"use client";

import { useActionState, useEffect, useState } from "react";
import { ChevronDown, MapPinned } from "lucide-react";
import { submitCourseRequestAction, type CourseRequestResult } from "@/app/(public)/kalendarz-wydarzen/actions";
import { REQUEST_CITIES, REQUESTABLE_TYPES } from "@/lib/clauwi/courses";
import { COURSE_REQUEST_CONSENT_TEXT } from "@/lib/clauwi/consent";
import { useTurnstile } from "./use-turnstile";

const INITIAL: CourseRequestResult = { ok: false, error: "" };
const FIELD = "w-full rounded-[1px] border border-border bg-white px-4 py-2.5 outline-none focus:border-brand";

/**
 * "No course in your city? Let us know" — under the course calendar. Starts
 * as a one-line bar; the button unfolds the form, so the list stays the focus.
 */
export function CourseRequestForm() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="course-request-heading" className="mx-auto mt-14 max-w-3xl rounded-[1px] border border-brand/30 bg-brand/5">
      <div className="flex flex-col items-center gap-3 px-5 py-4 text-center sm:flex-row sm:text-left">
        <MapPinned className="size-5 shrink-0 text-brand max-sm:hidden" aria-hidden />
        <h2 id="course-request-heading" className="flex-1 font-heading text-lg font-medium text-ink">
          Nie widzisz kursu w swojej okolicy?
        </h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="course-request-body"
          className="flex items-center gap-1.5 rounded-[1px] border border-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Daj nam znać <ChevronDown className={"size-4 transition-transform" + (open ? " rotate-180" : "")} aria-hidden />
        </button>
      </div>
      {/* Mounted only once opened — the Turnstile widget renders on mount. */}
      {open && (
        <div id="course-request-body" className="border-t border-brand/20 px-5 pt-4 pb-5">
          <RequestForm />
        </div>
      )}
    </section>
  );
}

function RequestForm() {
  const { containerRef: turnstileContainerRef, reset: resetTurnstile } = useTurnstile();
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_prev: CourseRequestResult, formData: FormData) => submitCourseRequestAction(formData),
    INITIAL,
  );

  // A failed attempt consumed the Turnstile token — get a fresh one (see BookingForm).
  useEffect(() => {
    if (!state.ok && state.error) resetTurnstile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the result changes
  }, [state]);

  if (state.ok) {
    return (
      <p role="status" className="rounded-[1px] border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
        Dziękujemy! Weźmiemy to pod uwagę, planując kolejne kursy{email ? " — i damy znać, gdy pojawi się termin w Twojej okolicy" : ""}.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm text-ink/75">Jaki kurs Cię interesuje?</legend>
        <div className="flex flex-wrap gap-2">
          {REQUESTABLE_TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="checkbox" name="types" value={t} className="peer sr-only" />
              <span className="inline-block rounded-[1px] border border-border bg-white px-3 py-1.5 text-sm text-ink/80 transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:border-brand">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="sr-only">Miasto</span>
          <select name="city" required defaultValue="" className={FIELD + " invalid:text-ink/45"}>
            <option value="" disabled>Wybierz miasto…</option>
            {REQUEST_CITIES.map((c) => <option key={c} value={c} className="text-ink">{c}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">E-mail (opcjonalnie)</span>
          <input
            name="email"
            type="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Twój e-mail (opcjonalnie)"
            autoComplete="email"
            className={FIELD}
          />
        </label>
      </div>
      {/* Wording kept in step with COURSE_REQUEST_CONSENT_TEXT, which is stored with the request. */}
      {email.trim() && (
        <label className="flex items-start gap-2.5 text-xs leading-snug text-ink/70">
          <input type="checkbox" name="consent" required value="1" className="mt-0.5 size-4 shrink-0 accent-[#cb8c7c]" />
          <span>
            {COURSE_REQUEST_CONSENT_TEXT.replace(/polityką prywatności\.$/, "")}
            <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="text-brand underline decoration-brand/40 underline-offset-2">
              polityką prywatności
            </a>
            .
          </span>
        </label>
      )}
      {/* Honeypot — see submitCourseRequestAction. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div ref={turnstileContainerRef} className="turnstile-widget" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-[1px] bg-brand px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#b87565] disabled:opacity-60"
        >
          {pending ? "Wysyłanie…" : "Wyślij"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
