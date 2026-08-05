// Customer-facing course booking confirmation email.
//
// Text carried over verbatim from the legacy WordPress site's Amelia booking
// plugin ("customer_event_approved" notification, the one used for regular
// courses — Kurs podstawowy/zaawansowany/Refresh; a couple of one-off past
// events had their own custom variants that aren't reproduced here since
// they were specific to those single events, not the recurring course types).
// Edit the strings below directly to change what customers receive — this is
// the only place that needs editing; src/lib/clauwi/brevo.ts just sends it.
export function courseBookingConfirmationEmail(params: {
  customerName: string;
  courseName: string;
}) {
  const { customerName, courseName } = params;
  return {
    subject: `${courseName} - rezerwacja przyjęta`,
    html: `
<p>Dzień dobry <strong>${customerName}</strong>,</p>
<p>Dziękuję za zapis na szkolenie <strong>${courseName}</strong>. Już się cieszę na nasze spotkanie! Warunkiem skuttecznej rezerwacji miejsca na kursie jest wplata zaliczki:</p>
<p>Dla <strong>REFRESHU</strong> - należy wpłacić od razu całość</p>
<p>Dla <strong>KURSÓW</strong> (podstawowy i zaawansowany) - <strong>zaliczka w kwocie 600 zł.</strong></p>
<p>Wpłaty należy dokonać <strong>do 5 dni</strong> od daty wysłania zgłoszenia na konto bankowe:</p>
<p>mBank Naturalnie <strong>03 1140 2004 0000 3502 7462 4427</strong></p>
<p>Proszę o wypełnienie <a href="https://tiny.pl/d4tr7" target="_blank" rel="noopener noreferrer">ANKIETY</a> przed wpłatą zaliczki.</p>
<p>Do zobaczenia,</p>
<p><strong>ClauWi®</strong></p>
`.trim(),
  };
}
