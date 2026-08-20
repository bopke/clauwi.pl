// Organizer-facing "new course booking" notification e-mail.
//
// Text carried over verbatim from the legacy WordPress site's Amelia booking
// plugin ("provider_event_approved" notification) — kept in English, matching
// the original, since it was only ever seen by the organizer and never
// localised. The participant's own details are added below it: the old plugin
// had them in its dashboard, we don't.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export function courseBookingOrganizerEmail(params: {
  organizerName: string;
  courseName: string;
  location: string;
  startDateTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seats: number;
  message: string;
}): EmailContent {
  const { organizerName, courseName, location, startDateTime, customerName, customerEmail, customerPhone, seats, message } = params;

  return {
    subject: `${courseName} Event Booked`,
    preheader: `${customerName} — ${seats} os.`,
    heading: "Nowe zgłoszenie",
    body: `
<p style="${S.p}">Hi <strong>${organizerName}</strong>,</p>
<p style="${S.p}">You have one confirmed <strong>${courseName}</strong> Event at <strong>${location}</strong> on <strong>${startDateTime}</strong>. The event is added to your schedule.</p>
${detailsBox([
  { label: "Uczestnik", value: customerName },
  { label: "E-mail", value: `<a href="mailto:${customerEmail}" style="${S.link}">${customerEmail}</a>` },
  ...(customerPhone ? [{ label: "Telefon", value: customerPhone }] : []),
  { label: "Liczba osób", value: String(seats) },
  ...(message ? [{ label: "Wiadomość", value: message }] : []),
])}
<p style="${S.p}">Thank you,<br><strong>ClauWi®</strong></p>`,
  };
}
