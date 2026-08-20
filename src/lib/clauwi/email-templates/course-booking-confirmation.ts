// Customer-facing course booking confirmation e-mail.
//
// Text carried over verbatim from the legacy WordPress site's Amelia booking
// plugin ("customer_event_approved" notification, the one used for regular
// courses — Kurs podstawowy/zaawansowany/Refresh; a couple of one-off past
// events had their own custom variants that aren't reproduced here since
// they were specific to those single events, not the recurring course types).
//
// Edit the strings below to change what customers receive. The surrounding
// look — logo, colours, footer — comes from layout.ts, not from here.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export function courseBookingConfirmationEmail(params: {
  customerName: string;
  courseName: string;
  location: string;
  dateTime: string;
  price: number;
  seats: number;
}): EmailContent {
  const { customerName, courseName, location, dateTime, price, seats } = params;

  return {
    subject: `${courseName} - rezerwacja przyjęta`,
    preheader: `Dziękujemy za zapis. Termin: ${dateTime}.`,
    heading: "Rezerwacja przyjęta",
    body: `
<p style="${S.p}">Dzień dobry <strong>${customerName}</strong>,</p>
<p style="${S.p}">Dziękuję za zapis na szkolenie <strong>${courseName}</strong>. Już się cieszę na nasze spotkanie!</p>
${detailsBox([
  { label: "Termin", value: dateTime },
  { label: "Miejsce", value: location },
  { label: "Liczba osób", value: String(seats) },
  { label: "Cena", value: `${price} zł` },
])}
<p style="${S.p}">Warunkiem skuttecznej rezerwacji miejsca na kursie jest wplata zaliczki:</p>
<p style="${S.p}">Dla <strong>REFRESHU</strong> - należy wpłacić od razu całość<br>
Dla <strong>KURSÓW</strong> (podstawowy i zaawansowany) - <strong>zaliczka w kwocie 600 zł.</strong></p>
<p style="${S.p}">Wpłaty należy dokonać <strong>do 5 dni</strong> od daty wysłania zgłoszenia na konto bankowe:</p>
<p style="${S.p}">mBank Naturalnie <strong>03 1140 2004 0000 3502 7462 4427</strong></p>
<p style="${S.p}">Proszę o wypełnienie <a href="https://tiny.pl/d4tr7" style="${S.link}">ANKIETY</a> przed wpłatą zaliczki.</p>
<p style="${S.small}">W załączniku znajdziesz termin kursu do dodania w kalendarzu.</p>
<p style="${S.p}">Do zobaczenia,<br><strong>ClauWi®</strong></p>`,
  };
}
