// E-mails sent when an administrator changes a booking's status in the panel.
//
// Newly written (the old Amelia plugin had no such step — courses were
// approved automatically, so the only templates in its database covered the
// booking itself). Sending is NOT automatic: the panel asks every time
// whether to notify the participant — see
// src/components/clauwi/admin/CoursesTab.tsx.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

type StatusEmailParams = {
  customerName: string;
  courseName: string;
  location: string;
  /** The date, already formatted for display (Polish time). */
  dateTime: string;
};

export function courseBookingConfirmedEmail(params: StatusEmailParams): EmailContent {
  const { customerName, courseName, location, dateTime } = params;
  return {
    subject: `${courseName} - potwierdzenie udziału`,
    preheader: `Twój udział jest potwierdzony. Termin: ${dateTime}.`,
    heading: "Udział potwierdzony",
    body: `
<p style="${S.p}">Dzień dobry <strong>${customerName}</strong>,</p>
<p style="${S.p}">Potwierdzamy Twój udział w szkoleniu <strong>${courseName}</strong>.</p>
${detailsBox([
  { label: "Termin", value: dateTime },
  { label: "Miejsce", value: location },
])}
<p style="${S.p}">W załączniku znajdziesz plik z terminem, który możesz dodać do swojego kalendarza.</p>
<p style="${S.p}">Do zobaczenia,<br><strong>ClauWi®</strong></p>`,
  };
}

export function courseBookingCancelledEmail(params: StatusEmailParams): EmailContent {
  const { customerName, courseName, location, dateTime } = params;
  return {
    subject: `${courseName} - anulowanie zgłoszenia`,
    preheader: "Twoje zgłoszenie zostało anulowane.",
    heading: "Zgłoszenie anulowane",
    body: `
<p style="${S.p}">Dzień dobry <strong>${customerName}</strong>,</p>
<p style="${S.p}">Informujemy, że Twoje zgłoszenie na szkolenie <strong>${courseName}</strong> zostało anulowane.</p>
${detailsBox([
  { label: "Termin", value: dateTime },
  { label: "Miejsce", value: location },
])}
<p style="${S.p}">Jeśli to pomyłka albo chcesz zapisać się na inny termin — napisz do nas, chętnie pomożemy.</p>
<p style="${S.p}">Pozdrawiamy,<br><strong>ClauWi®</strong></p>`,
  };
}
