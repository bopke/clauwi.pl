import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { courseBookingConfirmationEmail } from "./email-templates/course-booking-confirmation";
import { courseBookingOrganizerEmail } from "./email-templates/course-booking-organizer-notification";
import { courseBookingCancelledEmail, courseBookingConfirmedEmail } from "./email-templates/course-booking-status-update";
import { courseBookingUpdatedEmail, type BookingChange } from "./email-templates/course-booking-updated";
import { courseBookingRemovedEmail } from "./email-templates/course-booking-removed";
import { contactFormEmail } from "./email-templates/contact-form";
import { renderEmail, resolveEmailBaseUrl, type EmailContent } from "./email-templates/layout";
import { buildCourseIcs, icsFileName, type IcsMethod } from "./ics";
import { formatRange } from "./time";
import type { Course, CourseBooking } from "./courses";

type Attachment = { name: string; content: string };

type SendArgs = {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: { email: string; name?: string };
  attachments?: Attachment[];
};

/** Brevo expects attachments as base64. btoa() works on bytes, not characters. */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Low-level Brevo transactional email send (https://api.brevo.com/v3/smtp/email).
// Requires BREVO_API_KEY and BREVO_SENDER_EMAIL (a sender verified in the
// Brevo account) — set via `wrangler secret put` in production, .dev.vars
// locally.
async function sendViaBrevo(args: SendArgs): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.BREVO_API_KEY;
  const senderEmail = env.BREVO_SENDER_EMAIL;
  const senderName = env.BREVO_SENDER_NAME || "ClauWi®";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo is not configured — missing BREVO_API_KEY or BREVO_SENDER_EMAIL");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: args.to, name: args.toName }],
      replyTo: args.replyTo,
      subject: args.subject,
      htmlContent: args.html,
      textContent: args.text,
      attachment: args.attachments?.length ? args.attachments : undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

/**
 * Sends one of the templates from ./email-templates. The template supplies the
 * subject and its own content; layout.ts wraps it in the site's look and
 * derives the plain-text alternative, so every e-mail we send goes out as both
 * HTML and text without the templates having to write it twice.
 */
async function sendTemplate(args: {
  to: string;
  toName?: string;
  content: EmailContent;
  replyTo?: { email: string; name?: string };
  attachments?: Attachment[];
}): Promise<void> {
  // Until the domain cutover the logo has to be fetched from wherever this
  // build is actually deployed — clauwi.pl is still the old WordPress site —
  // so fall back to the request's own host rather than the future domain.
  const { env } = await getCloudflareContext({ async: true });
  let host: string | null = null;
  let protocol: string | null = null;
  try {
    const h = await headers();
    host = h.get("host");
    protocol = h.get("x-forwarded-proto");
  } catch {
    // Not in a request scope (e.g. a script) — the defaults below cover it.
  }
  const baseUrl = resolveEmailBaseUrl({ configured: env.EMAIL_BASE_URL, host, protocol });
  const { subject, html, text } = renderEmail(args.content, { baseUrl });
  await sendViaBrevo({
    to: args.to,
    toName: args.toName,
    subject,
    html,
    text,
    replyTo: args.replyTo,
    attachments: args.attachments,
  });
}

type ContactSubmission = { name: string; email: string; message: string };

// Contact form (src/app/api/contact/route.ts) — recipient is CONTACT_FORM_TO,
// Reply-To is the visitor so a reply reaches them directly.
export async function sendContactEmail(submission: ContactSubmission): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const to = env.CONTACT_FORM_TO;
  if (!to) throw new Error("Brevo is not configured — missing CONTACT_FORM_TO");

  await sendTemplate({
    to,
    content: contactFormEmail(submission),
    replyTo: { email: submission.email, name: submission.name },
  });
}

// ----- Courses -----

async function organizerRecipient(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  const { CONTACT } = await import("./site");
  return env.COURSE_ORGANIZER_EMAIL || CONTACT.email;
}

/**
 * The .ics attachment carrying the course date — clicking it in the e-mail
 * adds the event to the participant's calendar. SEQUENCE comes from
 * `booking.version` (bumped on every change): calendars ignore a message
 * whose sequence isn't higher than the last one they saw, so it can't be a
 * constant per e-mail type. `sequenceOffset` covers deletion, where the row
 * is already gone and the counter can't be bumped in the database.
 */
async function courseIcsAttachment(
  booking: Pick<CourseBooking, "id" | "version">,
  course: Course,
  opts: { method?: IcsMethod; sequenceOffset?: number } = {},
): Promise<Attachment> {
  const ics = buildCourseIcs({
    bookingId: booking.id,
    courseId: course.id,
    courseName: course.name,
    location: course.location,
    description: course.description || `${course.type} — Szkoła Noszenia ClauWi®.`,
    startsAt: course.startsAt,
    endsAt: course.endsAt,
    organizerEmail: await organizerRecipient(),
    organizerName: "ClauWi®",
    method: opts.method,
    sequence: booking.version + (opts.sequenceOffset ?? 0),
  });
  return { name: icsFileName(course.name), content: toBase64(ics) };
}

// Sent right after a successful booking (src/app/(public)/kalendarz-wydarzen/actions.ts):
// a confirmation to the participant (with the .ics attached) and a notice to
// the organizer. The wording is carried over 1:1 from the old Amelia
// templates — edit src/lib/clauwi/email-templates/*.ts, not this file.
export async function sendCourseBookingEmails(params: {
  booking: CourseBooking;
  course: Course;
}): Promise<void> {
  const { booking, course } = params;
  const customerName = `${booking.firstName} ${booking.lastName}`;
  const dateTime = formatRange(course.startsAt, course.endsAt, { withTime: true });

  const confirmation = courseBookingConfirmationEmail({
    customerName,
    courseName: course.name,
    location: course.location,
    dateTime,
    price: course.price,
    seats: booking.seats,
  });
  const organizerNotice = courseBookingOrganizerEmail({
    courseName: course.name,
    location: course.location,
    startDateTime: dateTime,
    customerName,
    customerEmail: booking.email,
    customerPhone: booking.phone,
    seats: booking.seats,
    message: booking.message,
  });
  const ics = await courseIcsAttachment(booking, course);

  await Promise.all([
    sendTemplate({ to: booking.email, toName: customerName, content: confirmation, attachments: [ics] }),
    sendTemplate({ to: await organizerRecipient(), content: organizerNotice, attachments: [ics] }),
  ]);
}

// Sent from the admin panel when a booking's status changes — only when the
// administrator deliberately asks for it, never automatically on every pick
// from the dropdown. Confirmation carries an updated .ics; cancellation sends
// the same event with METHOD:CANCEL so it disappears from the calendar.
export async function sendBookingStatusEmail(params: {
  booking: CourseBooking;
  course: Course;
  status: "confirmed" | "cancelled";
}): Promise<void> {
  const { booking, course, status } = params;
  const customerName = `${booking.firstName} ${booking.lastName}`;
  const dateTime = formatRange(course.startsAt, course.endsAt, { withTime: true });
  const templateParams = { customerName, courseName: course.name, location: course.location, dateTime };

  const email = status === "confirmed"
    ? courseBookingConfirmedEmail(templateParams)
    : courseBookingCancelledEmail(templateParams);

  const ics = await courseIcsAttachment(booking, course, {
    method: status === "cancelled" ? "CANCEL" : "PUBLISH",
  });

  await sendTemplate({ to: booking.email, toName: customerName, content: email, attachments: [ics] });
}

// Sent from the admin panel after a booking is edited — again only when the
// administrator ticks "notify the participant". `changes` lists what actually
// changed (computed in src/app/admin/actions.ts by comparing before and
// after) so the e-mail is specific rather than vague.
// Note: it goes to the NEW address — if the address itself was what changed,
// the old one gets nothing (see the comment in the action).
export async function sendBookingUpdatedEmail(params: {
  booking: CourseBooking;
  course: Course;
  changes: BookingChange[];
}): Promise<void> {
  const { booking, course, changes } = params;
  const customerName = `${booking.firstName} ${booking.lastName}`;
  const email = courseBookingUpdatedEmail({
    customerName,
    courseName: course.name,
    location: course.location,
    dateTime: formatRange(course.startsAt, course.endsAt, { withTime: true }),
    changes,
  });
  const ics = await courseIcsAttachment(booking, course);

  await sendTemplate({ to: booking.email, toName: customerName, content: email, attachments: [ics] });
}

// Sent after a booking is deleted from the panel (again, only on request).
// The row is gone, so `version` can't be bumped in the database — SEQUENCE is
// raised by 1 on the fly so the cancellation is newer than the last .ics.
export async function sendBookingRemovedEmail(params: {
  booking: CourseBooking;
  course: Course;
}): Promise<void> {
  const { booking, course } = params;
  const customerName = `${booking.firstName} ${booking.lastName}`;
  const email = courseBookingRemovedEmail({
    customerName,
    courseName: course.name,
    location: course.location,
    dateTime: formatRange(course.startsAt, course.endsAt, { withTime: true }),
  });
  const ics = await courseIcsAttachment(booking, course, { method: "CANCEL", sequenceOffset: 1 });

  await sendTemplate({ to: booking.email, toName: customerName, content: email, attachments: [ics] });
}
