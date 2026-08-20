// Sent when an administrator deletes a booking from the list.
//
// Deliberately worded differently from the "cancelled" status e-mail: there
// the booking stays in the system with a changed status, here it is gone
// entirely and the participant has no record of the course at all. The .ics
// attachment uses METHOD:CANCEL so the date leaves their calendar too.
//
// Sending is not automatic — the panel asks when deleting.
// Edit the wording here; src/lib/clauwi/brevo.ts only sends it.

export function courseBookingRemovedEmail(params: {
  customerName: string;
  courseName: string;
  location: string;
  dateTime: string;
}) {
  const { customerName, courseName, location, dateTime } = params;
  return {
    subject: `${courseName} - zgłoszenie usunięte`,
    html: `
<p>Dzień dobry <strong>${customerName}</strong>,</p>
<p>Informujemy, że Twoje zgłoszenie na szkolenie <strong>${courseName}</strong> (${dateTime}, ${location}) zostało usunięte z listy uczestników.</p>
<p>Termin został też odwołany w Twoim kalendarzu. Jeśli to pomyłka albo chcesz zapisać się ponownie — napisz do nas, chętnie pomożemy.</p>
<p>Pozdrawiamy,</p>
<p><strong>ClauWi®</strong></p>
`.trim(),
  };
}
