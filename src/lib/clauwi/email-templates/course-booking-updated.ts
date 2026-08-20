// Sent when an administrator edits a booking's details in the panel
// (first name, last name, address, phone, seat count, message).
//
// Sending is not automatic — the edit form has its own "notify the
// participant" checkbox, see src/components/clauwi/admin/CoursesTab.tsx.
// Edit the wording here; src/lib/clauwi/brevo.ts only sends it.

export type BookingChange = { label: string; from: string; to: string };

export function courseBookingUpdatedEmail(params: {
  customerName: string;
  courseName: string;
  location: string;
  dateTime: string;
  changes: BookingChange[];
}) {
  const { customerName, courseName, location, dateTime, changes } = params;

  const changeRows = changes
    .map(
      (c) => `<li><strong>${c.label}:</strong> <span style="text-decoration:line-through;color:#888">${c.from || "—"}</span> → ${c.to || "—"}</li>`,
    )
    .join("\n");

  return {
    subject: `${courseName} - zmiana w zgłoszeniu`,
    html: `
<p>Dzień dobry <strong>${customerName}</strong>,</p>
<p>Twoje zgłoszenie na szkolenie <strong>${courseName}</strong> zostało zaktualizowane.</p>
${changes.length ? `<p>Co się zmieniło:</p>\n<ul>\n${changeRows}\n</ul>` : ""}
<p><strong>Termin:</strong> ${dateTime}<br/>
<strong>Miejsce:</strong> ${location}</p>
<p>W załączniku znajdziesz aktualny termin do dodania w kalendarzu. Jeśli któraś z tych zmian jest pomyłką — daj nam znać.</p>
<p>Pozdrawiamy,</p>
<p><strong>ClauWi®</strong></p>
`.trim(),
  };
}
