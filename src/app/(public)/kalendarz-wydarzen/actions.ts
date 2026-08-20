"use server";

// Public (unauthenticated) course booking — replaces the old Amelia form with
// its online payment. All this does is store the booking in D1; confirmation
// and payment are arranged by the administrator outside the system.

import { headers } from "next/headers";
import { createBooking } from "@/lib/clauwi/courses-repo";
import { verifyTurnstileToken } from "@/lib/clauwi/turnstile";
import { sendCourseBookingEmails } from "@/lib/clauwi/brevo";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const BOOKING_ERRORS = {
  full: "Brak wolnych miejsc na ten kurs.",
  duplicate: "Zgłoszenie z tego adresu e-mail na ten kurs zostało już wysłane. Jeśli chcesz je zmienić, napisz do nas.",
  "not-found": "Nie znaleziono kursu.",
} as const;

export type BookingFormResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitBookingAction(formData: FormData): Promise<BookingFormResult> {
  const courseId = String(formData.get("courseId") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);
  const gdprConsent = formData.get("gdprConsent") != null;
  // Hard cap — protects the public endpoint from abuse.
  const seats = Math.min(Math.max(Number(formData.get("seats") ?? 1) | 0, 1), 10);

  if (!courseId) return { ok: false, error: "Nieprawidłowe zgłoszenie." };
  if (!firstName || !lastName) return { ok: false, error: "Podaj imię i nazwisko." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Podaj poprawny adres e-mail." };
  if (!gdprConsent) return { ok: false, error: "Wymagana jest zgoda na przetwarzanie danych." };

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  const ip = (await headers()).get("cf-connecting-ip") ?? undefined;
  if (!(await verifyTurnstileToken(turnstileToken, ip))) {
    return { ok: false, error: "Weryfikacja bezpieczeństwa nie powiodła się. Spróbuj ponownie." };
  }

  const result = await createBooking({ courseId, firstName, lastName, email, phone, seats, message, gdprConsent });
  if (!result.ok) {
    return { ok: false, error: BOOKING_ERRORS[result.reason] };
  }

  // The booking is already saved — don't fail the user-facing result if the
  // notification emails have trouble sending, just log it.
  try {
    await sendCourseBookingEmails({ booking: result.booking, course: result.course });
  } catch (e) {
    console.error("course booking emails failed to send", e);
  }

  return { ok: true };
}
