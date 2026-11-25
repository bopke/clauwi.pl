"use server";

// Public (unauthenticated) course booking — replaces the old Amelia form with
// its online payment. All this does is store the booking in D1; confirmation
// and payment are arranged by the administrator outside the system.

import { headers } from "next/headers";
import { createBooking } from "@/lib/clauwi/courses-repo";
import { verifyTurnstileToken } from "@/lib/clauwi/turnstile";
import { sendCourseBookingEmails } from "@/lib/clauwi/brevo";
import { recordConsent, unsuppressNewsletterEmail } from "@/lib/clauwi/newsletter-repo";
import { BOOKING_MARKETING_CONSENT_TEXT, COURSE_REQUEST_CONSENT_TEXT } from "@/lib/clauwi/consent";
import { addCourseRequest } from "@/lib/clauwi/course-requests-repo";
import { REQUEST_CITIES, REQUESTABLE_TYPES } from "@/lib/clauwi/courses";

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
  const marketingConsent = formData.get("marketingConsent") != null;
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

  const result = await createBooking({ courseId, firstName, lastName, email, phone, seats, message, gdprConsent, marketingConsent });
  if (!result.ok) {
    return { ok: false, error: BOOKING_ERRORS[result.reason] };
  }

  // Ticking the marketing box is fresh consent — it lifts an earlier unsubscribe.
  if (marketingConsent) {
    try {
      await unsuppressNewsletterEmail(email);
      await recordConsent({
        email, action: "granted", source: "booking", ref: result.booking.id, wording: BOOKING_MARKETING_CONSENT_TEXT, ip: ip ?? "",
      });
    } catch (e) {
      console.error("booking: recording marketing consent failed", e);
    }
  }

  // The booking is already saved — don't fail the user-facing result if the
  // notification emails have trouble sending, just log it.
  try {
    await sendCourseBookingEmails({ booking: result.booking, course: result.course });
  } catch (e) {
    console.error("booking: confirmation e-mails failed to send", e);
  }

  return { ok: true };
}

export type CourseRequestResult = { ok: true } | { ok: false; error: string };

/** "No course in your city? Let us know" — which courses and where, plus an e-mail if they want to hear back. */
export async function submitCourseRequestAction(formData: FormData): Promise<CourseRequestResult> {
  // Honeypot — real visitors never fill it in; pretend success to a bot.
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const city = String(formData.get("city") ?? "");
  // One course per request; stored as a list (course_requests.types).
  const type = String(formData.get("type") ?? "");
  if (!REQUESTABLE_TYPES.includes(type)) return { ok: false, error: "Wybierz kurs." };
  const types = [type];
  if (!REQUEST_CITIES.includes(city)) return { ok: false, error: "Wybierz miasto z listy." };
  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "Podaj poprawny adres e-mail albo zostaw to pole puste." };
  if (email && formData.get("consent") == null) return { ok: false, error: "Zaznacz zgodę na kontakt albo usuń adres e-mail." };

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  const ip = (await headers()).get("cf-connecting-ip") ?? undefined;
  if (!(await verifyTurnstileToken(turnstileToken, ip))) {
    return { ok: false, error: "Weryfikacja bezpieczeństwa nie powiodła się. Spróbuj ponownie." };
  }

  try {
    await addCourseRequest({ city, types, email, consent: email ? COURSE_REQUEST_CONSENT_TEXT : "" });
  } catch (e) {
    console.error("course-request: saving failed", e);
    return { ok: false, error: "Nie udało się wysłać. Spróbuj ponownie za chwilę." };
  }
  return { ok: true };
}
