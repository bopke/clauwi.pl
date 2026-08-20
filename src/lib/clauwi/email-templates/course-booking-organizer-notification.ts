// Organizer-facing "new course booking" notification e-mail.
//
// The original Amelia template ("provider_event_approved") was in English —
// the plugin never localised the organizer-only notifications. Rewritten in
// Polish, since the only person who reads it is the ClauWi® office.
//
// Unlike the participant's copy, this one carries the full booking: Amelia
// showed those details in its own dashboard, and this is the notice that has
// to stand on its own.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export function courseBookingOrganizerEmail(params: {
  courseName: string;
  location: string;
  startDateTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seats: number;
  message: string;
}): EmailContent {
  const { courseName, location, startDateTime, customerName, customerEmail, customerPhone, seats, message } = params;

  return {
    subject: `${courseName} - nowe zgłoszenie`,
    preheader: `${customerName} — ${seats} os.`,
    heading: "Nowe zgłoszenie",
    body: `
<p style="${S.p}">Dzień dobry,</p>
<p style="${S.p}">Na szkolenie <strong>${courseName}</strong> wpłynęło nowe zgłoszenie.</p>
${detailsBox([
  { label: "Termin", value: startDateTime },
  { label: "Miejsce", value: location },
  { label: "Uczestnik", value: customerName },
  { label: "E-mail", value: `<a href="mailto:${customerEmail}" style="${S.link}">${customerEmail}</a>` },
  ...(customerPhone ? [{ label: "Telefon", value: customerPhone }] : []),
  { label: "Liczba osób", value: String(seats) },
  ...(message ? [{ label: "Wiadomość", value: message }] : []),
])}
<p style="${S.small}">Zgłoszenie czeka w panelu, w zakładce „Kursy” → „Zgłoszenia”. Tam można potwierdzić udział albo anulować zgłoszenie — i przy okazji powiadomić o tym uczestnika.</p>`,
  };
}
