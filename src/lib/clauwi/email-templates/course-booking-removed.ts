// Sent when an administrator deletes a booking from the list.
//
// Deliberately worded differently from the "cancelled" status e-mail: there
// the booking stays in the system with a changed status, here it is gone
// entirely and the participant has no record of the course at all. The .ics
// attachment uses METHOD:CANCEL so the date leaves their calendar too.
//
// Sending is not automatic — the panel asks when deleting.
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export function courseBookingRemovedEmail(params: {
  customerName: string;
  courseName: string;
  location: string;
  dateTime: string;
}): EmailContent {
  const { customerName, courseName, location, dateTime } = params;
  return {
    subject: `${courseName} - zgłoszenie usunięte`,
    preheader: "Twoje zgłoszenie zostało usunięte z listy uczestników.",
    heading: "Zgłoszenie usunięte",
    body: `
<p style="${S.p}">Dzień dobry <strong>${customerName}</strong>,</p>
<p style="${S.p}">Informujemy, że Twoje zgłoszenie na szkolenie <strong>${courseName}</strong> zostało usunięte z listy uczestników.</p>
${detailsBox([
  { label: "Termin", value: dateTime },
  { label: "Miejsce", value: location },
])}
<p style="${S.p}">Termin został też odwołany w Twoim kalendarzu. Jeśli to pomyłka albo chcesz zapisać się ponownie — napisz do nas, chętnie pomożemy.</p>
<p style="${S.p}">Pozdrawiamy,<br><strong>ClauWi®</strong></p>`,
  };
}
