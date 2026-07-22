"use server";

// Publiczne (bez logowania) zgłoszenie na kurs — zastępuje dawny formularz
// Amelia (płatność online). Tutaj tylko zapisujemy zgłoszenie do D1;
// potwierdzenie i płatność ustalane są przez administratora poza systemem.

import { createBooking } from "@/lib/clauwi/courses-repo";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type BookingFormResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitBookingAction(formData: FormData): Promise<BookingFormResult> {
  const courseId = String(formData.get("courseId") ?? "").trim();
  const imie = String(formData.get("imie") ?? "").trim();
  const nazwisko = String(formData.get("nazwisko") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const wiadomosc = String(formData.get("wiadomosc") ?? "").trim().slice(0, 2000);
  // Hard cap — protects the public endpoint from abuse.
  const liczbaOsob = Math.min(Math.max(Number(formData.get("liczbaOsob") ?? 1) | 0, 1), 10);

  if (!courseId) return { ok: false, error: "Nieprawidłowe zgłoszenie." };
  if (!imie || !nazwisko) return { ok: false, error: "Podaj imię i nazwisko." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Podaj poprawny adres e-mail." };

  const result = await createBooking({ courseId, imie, nazwisko, email, telefon, liczbaOsob, wiadomosc });
  if (!result.ok) {
    return {
      ok: false,
      error: result.reason === "full" ? "Brak wolnych miejsc na ten kurs." : "Nie znaleziono kursu.",
    };
  }
  return { ok: true };
}
