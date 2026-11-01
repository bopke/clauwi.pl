import "server-only";

// Messages to a course's participants, written in the admin panel's composer
// ("Napisz do zaznaczonych" on a course's booking list). These are about the
// participant's own booking — practical information — so unlike newsletter
// mailings they need no marketing consent and carry no unsubscribe link.

import { adminListBookingsForCourse, getCourseById } from "./courses-repo";
import { COURSE_MESSAGE_CHUNK, type Course, type CourseBooking } from "./courses";
import type { NewsletterRecipient } from "./newsletter";
import { buildMessageEmail, type NewsletterDraft } from "./newsletter-template";
import { emailBaseUrl, sendEmail } from "./brevo";
import { CONTACT, SITE } from "./site";

function toRecipient(b: CourseBooking, c: Course): NewsletterRecipient {
  return {
    email: b.email,
    firstName: b.firstName,
    lastName: b.lastName,
    course: { name: c.name, type: c.type, location: c.location, startsAt: c.startsAt, endsAt: c.endsAt },
  };
}

/**
 * The chosen participants of a course, read fresh from the database — the
 * ids come from the browser, so only bookings that really belong to this
 * course count. One recipient per address.
 */
export async function courseMessageRecipients(
  courseId: string,
  bookingIds: string[],
): Promise<{ course: Course; recipients: NewsletterRecipient[]; bookingIds: string[] } | null> {
  const course = await getCourseById(courseId);
  if (!course) return null;
  const wanted = new Set(bookingIds);
  const seen = new Set<string>();
  const chosen: CourseBooking[] = [];
  for (const b of await adminListBookingsForCourse(courseId)) {
    const key = b.email.toLowerCase();
    if (!wanted.has(b.id) || seen.has(key)) continue;
    seen.add(key);
    chosen.push(b);
  }
  chosen.sort((a, b) => a.email.localeCompare(b.email));
  // bookingIds: one per address — what the composer sends to, chunk by chunk.
  return { course, recipients: chosen.map((b) => toRecipient(b, course)), bookingIds: chosen.map((b) => b.id) };
}

/**
 * Sends the message to the given participants (one chunk), each with their
 * own placeholders filled in. Replies go to the school's address. Returns
 * who it failed for, so the composer can report it.
 */
export async function sendCourseMessage(
  courseId: string,
  bookingIds: string[],
  draft: NewsletterDraft,
): Promise<{ sent: number; failed: string[] }> {
  if (!draft.subject.trim() || !draft.body.trim()) throw new Error("empty message");
  const found = await courseMessageRecipients(courseId, bookingIds.slice(0, COURSE_MESSAGE_CHUNK));
  if (!found) throw new Error("course not found");

  const baseUrl = await emailBaseUrl();
  let sent = 0;
  const failed: string[] = [];
  for (const r of found.recipients) {
    const { subject, html, text } = buildMessageEmail(draft, r, { baseUrl });
    try {
      await sendEmail({
        to: r.email,
        toName: `${r.firstName} ${r.lastName}`.trim() || undefined,
        subject,
        html,
        text,
        replyTo: { email: CONTACT.email, name: SITE.name },
      });
      sent++;
    } catch (e) {
      console.error("course message failed to send", r.email, e);
      failed.push(r.email);
    }
  }
  return { sent, failed };
}
