"use client";

import { useActionState } from "react";
import { submitBookingAction, type BookingFormResult } from "@/app/(public)/kalendarz-wydarzen/actions";

const INITIAL: BookingFormResult = { ok: false, error: "" };

export function BookingForm({ courseId, spotsLeft }: { courseId: string; spotsLeft: number }) {
  const [state, formAction, pending] = useActionState(async (_prev: BookingFormResult, formData: FormData) => {
    return submitBookingAction(formData);
  }, INITIAL);

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
        <input name="imie" required placeholder="Imię" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
        <input name="nazwisko" required placeholder="Nazwisko" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" required placeholder="E-mail" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
        <input name="telefon" placeholder="Telefon" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink/70">
        Liczba osób
        <input name="liczbaOsob" type="number" min={1} max={Math.min(10, spotsLeft)} defaultValue={1} className="w-20 rounded-[1px] border border-border px-3 py-2 outline-none focus:border-brand" />
      </label>
      <textarea name="wiadomosc" rows={4} placeholder="Wiadomość (opcjonalnie)" className="w-full rounded-[1px] border border-border px-4 py-3 outline-none focus:border-brand" />
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
