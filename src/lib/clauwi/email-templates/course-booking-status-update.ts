// E-mails sent when an administrator changes a booking's status in the panel.
//
// Newly written (the old Amelia plugin had no such step — courses were
// approved automatically, so the only templates in its database covered the
// booking itself). Sending is NOT automatic: the panel asks every time
// whether to notify the participant — see
// src/components/clauwi/admin/CoursesTab.tsx.
// Edit the wording here; src/lib/clauwi/brevo.ts only sends it.

type StatusEmailParams = {
  customerName: string;
  courseName: string;
  location: string;
  /** The date, already formatted for display (Polish time). */
  dateTime: string;
};

export function courseBookingConfirmedEmail(params: StatusEmailParams) {
  const { customerName, courseName, location, dateTime } = params;
  return {
    subject: `${courseName} - potwierdzenie udziału`,
    html: `
<p>Dzień dobry <strong>${customerName}</strong>,</p>
<p>Potwierdzamy Twój udział w szkoleniu <strong>${courseName}</strong>.</p>
<p><strong>Termin:</strong> ${dateTime}<br/>
<strong>Miejsce:</strong> ${location}</p>
<p>W załączniku znajdziesz plik z terminem, który możesz dodać do swojego kalendarza.</p>
<p>Do zobaczenia,</p>
<p><strong>ClauWi®</strong></p>
`.trim(),
  };
}

export function courseBookingCancelledEmail(params: StatusEmailParams) {
  const { customerName, courseName, location, dateTime } = params;
  return {
    subject: `${courseName} - anulowanie zgłoszenia`,
    html: `
<p>Dzień dobry <strong>${customerName}</strong>,</p>
<p>Informujemy, że Twoje zgłoszenie na szkolenie <strong>${courseName}</strong> (${dateTime}, ${location}) zostało anulowane.</p>
<p>Jeśli to pomyłka albo chcesz zapisać się na inny termin — napisz do nas, chętnie pomożemy.</p>
<p>Pozdrawiamy,</p>
<p><strong>ClauWi®</strong></p>
`.trim(),
  };
}
