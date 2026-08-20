// Model and helpers for the ClauWi® course calendar.
// The data lives in D1 (see courses-repo.ts) — this module only holds types
// and metadata.

export type Course = {
  id: string;
  name: string;
  type: string; // e.g. "Kurs podstawowy", "Kurs zaawansowany", "Refresh", "Konferencja"
  location: string; // a city or "Online"
  description: string;
  price: number; // PLN
  capacity: number;
  startsAt: string; // local Warsaw wall clock, "YYYY-MM-DD HH:MM:SS" — see time.ts
  endsAt: string;
  active: boolean;
};

// Quick picks for the admin form. These are display values, not identifiers,
// so they stay Polish — and the form does not restrict input to them, because
// the source data shows other variants too.
export const TYPE_SUGGESTIONS = ["Kurs podstawowy", "Kurs zaawansowany", "Refresh", "Konferencja", "Wsparcie na starcie"];

export type CourseBookingStatus = "new" | "confirmed" | "cancelled";

export type CourseBooking = {
  id: string;
  courseId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  seats: number;
  message: string;
  /** Consent to process personal data — required when booking (GDPR). */
  gdprConsent: boolean;
  status: CourseBookingStatus;
  /**
   * Bumped on every change to the booking — feeds the SEQUENCE field of the
   * .ics attachment so the participant's calendar accepts the update.
   */
  version: number;
  createdAt: string;
};

/** The booking fields an administrator can edit in the panel. */
export type CourseBookingEdit = Pick<
  CourseBooking,
  "firstName" | "lastName" | "email" | "phone" | "seats" | "message"
>;

/** Polish labels for those fields — used in the panel and in the "what changed" email. */
export const BOOKING_FIELD_LABELS: Record<keyof CourseBookingEdit, string> = {
  firstName: "Imię",
  lastName: "Nazwisko",
  email: "E-mail",
  phone: "Telefon",
  seats: "Liczba osób",
  message: "Wiadomość",
};

export const CourseUtil = {
  spotsLeft(course: Course, booked: number): number {
    return Math.max(0, course.capacity - booked);
  },
};
