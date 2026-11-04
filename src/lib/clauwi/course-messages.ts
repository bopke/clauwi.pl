import "server-only";

// Messages to a course's participants, written in the admin panel's composer
// ("Napisz do zaznaczonych" on a course's booking list). These are about the
// participant's own booking — practical information — so unlike newsletter
// mailings they need no marketing consent and carry no unsubscribe link.

import { adminListBookingsForCourse, getCourseById } from "./courses-repo";
import type { Course, CourseBooking } from "./courses";
import type { NewsletterRecipient } from "./newsletter";
import type { NewsletterDraft } from "./newsletter-template";
import { createCourseMailing } from "./mailings-repo";

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
 * Records the message and its recipients (see mailings-repo.ts); sending
 * then happens chunk by chunk from the mailing's page. Returns its id.
 */
export async function createCourseMessage(
  courseId: string,
  bookingIds: string[],
  draft: NewsletterDraft,
  opts: { createdBy: string; baseUrl: string },
): Promise<string> {
  if (!draft.subject.trim() || !draft.body.trim()) throw new Error("empty message");
  const found = await courseMessageRecipients(courseId, bookingIds);
  if (!found || found.recipients.length === 0) throw new Error("no recipients");
  const { course } = found;
  return createCourseMailing(
    {
      kind: "course",
      draft,
      audience: `uczestnicy kursu ${course.name} (${course.startsAt.slice(0, 10).split("-").reverse().join(".")})`,
      courseId,
      ...opts,
    },
    found.recipients.map((recipient, i) => ({ bookingId: found.bookingIds[i], recipient })),
  );
}
