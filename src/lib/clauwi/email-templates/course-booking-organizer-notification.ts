// Organizer-facing "new course booking" notification email.
//
// Text carried over verbatim from the legacy WordPress site's Amelia booking
// plugin ("provider_event_approved" notification) — kept in English,
// matching the original, since it was only ever seen by the organizer and
// never localized. Edit the strings below directly to change what the
// organizer receives — this is the only place that needs editing;
// src/lib/clauwi/brevo.ts just sends it.
export function courseBookingOrganizerEmail(params: {
  organizerName: string;
  courseName: string;
  location: string;
  startDateTime: string;
}) {
  const { organizerName, courseName, location, startDateTime } = params;
  return {
    subject: `${courseName} Event Booked`,
    html: `
<p>Hi <strong>${organizerName}</strong>,</p>
<p>You have one confirmed <strong>${courseName}</strong> Event at <strong>${location}</strong> on <strong>${startDateTime}</strong>. The event is added to your schedule.</p>
<p>Thank you,</p>
<p><strong>ClauWi®</strong></p>
`.trim(),
  };
}
