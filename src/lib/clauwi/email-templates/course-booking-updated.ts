// Sent when an administrator edits a booking's details in the panel
// (first name, last name, address, phone, seat count, message).
//
// Sending is not automatic — the edit form has its own "notify the
// participant" checkbox, see src/components/clauwi/admin/CoursesTab.tsx.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export type BookingChange = { label: string; from: string; to: string };

export function courseBookingUpdatedEmail(params: {
  customerName: string;
  courseName: string;
  location: string;
  dateTime: string;
  changes: BookingChange[];
}): EmailContent {
  const { customerName, courseName, location, dateTime, changes } = params;

  const changeList = changes.length
    ? `<p style="${S.p}">Co się zmieniło:</p>
<ul style="margin: 0 0 16px; padding-left: 20px;">
${changes
  .map(
    (c) => `  <li style="${S.p} margin-bottom: 6px;"><strong>${c.label}:</strong> <span style="color: #a09892; text-decoration: line-through;">${c.from || "—"}</span> &rarr; ${c.to || "—"}</li>`,
  )
  .join("\n")}
</ul>`
    : "";

  return {
    subject: `${courseName} - zmiana w zgłoszeniu`,
    preheader: "Twoje zgłoszenie zostało zaktualizowane.",
    heading: "Zmiana w zgłoszeniu",
    body: `
<p style="${S.p}">Dzień dobry <strong>${customerName}</strong>,</p>
<p style="${S.p}">Twoje zgłoszenie na szkolenie <strong>${courseName}</strong> zostało zaktualizowane.</p>
${changeList}
${detailsBox([
  { label: "Termin", value: dateTime },
  { label: "Miejsce", value: location },
])}
<p style="${S.p}">W załączniku znajdziesz aktualny termin do dodania w kalendarzu. Jeśli któraś z tych zmian jest pomyłką — daj nam znać.</p>
<p style="${S.p}">Pozdrawiamy,<br><strong>ClauWi®</strong></p>`,
  };
}
