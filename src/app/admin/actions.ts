"use server";

import { auth, signIn, signOut } from "@/auth";
import { addAllow, listAllow, removeAllow } from "@/lib/clauwi/allowlist";
import { adminListAdvisors, createAdvisor, getAdvisorById, removeAdvisor, updateAdvisor } from "@/lib/clauwi/advisors-repo";
import type { AllowEntry, Advisor } from "@/lib/clauwi/advisors";
import {
  adminListCourses, createCourse, getCourseById, removeCourse, updateCourse,
  adminListBookingsForCourse, updateBookingStatus, removeBooking, adminGetBookingWithCourse,
  adminUpdateBooking, getCourseById as getCourse, adminUnseenBookingCounts, markCourseSeen,
} from "@/lib/clauwi/courses-repo";
import { emailBaseUrl, sendBookingStatusEmail, sendBookingUpdatedEmail, sendBookingRemovedEmail, sendEmail } from "@/lib/clauwi/brevo";
import { BOOKING_FIELD_LABELS } from "@/lib/clauwi/courses";
import type { Course, CourseBooking, CourseBookingEdit, CourseBookingStatus } from "@/lib/clauwi/courses";
import type { BookingChange } from "@/lib/clauwi/email-templates/course-booking-updated";
import {
  adminListNewsletter, adminListNewsletterCourses, adminNewsletterRecipient, adminRemoveFromNewsletter, consentHistory,
  createNewsletterImport, importNewsletterChunk, listNewsletterImports, undoNewsletterImport,
  adminListSuppressions, adminRestoreSubscriber, type SuppressionRow,
} from "@/lib/clauwi/newsletter-repo";
import type { ConsentEntry } from "@/lib/clauwi/consent";
import { courseMessageRecipients, createCourseMessage } from "@/lib/clauwi/course-messages";
import { buildMessageEmail, unsubscribeUrl, type NewsletterDraft } from "@/lib/clauwi/newsletter-template";
import {
  cancelMailing, createNewsletterMailing, getDailyLimit, getMailing, listMailingRecipients, mailingPreview, listMailings, pauseMailing,
  processMailing, resumeMailing, retryFailed, sentLast24h, setDailyLimit, type ProcessResult,
} from "@/lib/clauwi/mailings-repo";
import type { Mailing, MailingRecipientRow, RecipientStatus } from "@/lib/clauwi/mailings";
import { CONTACT, SITE } from "@/lib/clauwi/site";
import { deleteTemplate, listTemplates, saveTemplate, type MessageTemplate } from "@/lib/clauwi/message-templates-repo";
import { IMPORT_CHUNK, type ImportRow, type NewsletterCourse, type NewsletterFilters, type NewsletterImport, type NewsletterPage, type NewsletterQuery, type NewsletterRecipient } from "@/lib/clauwi/newsletter";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function signInGoogle() {
  await signIn("google", { redirectTo: "/admin" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin" });
}

// A signed-in user is, by construction, on the allowlist (login is gated on it),
// so a valid session is sufficient authority to manage the allowlist.
async function requireAdmin(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthorized");
  return email;
}

export async function getAllowlistAction(): Promise<AllowEntry[]> {
  await requireAdmin();
  return listAllow();
}

export async function addAllowAction(email: string): Promise<AllowEntry[]> {
  await requireAdmin();
  const em = email.trim().toLowerCase();
  if (!EMAIL_RE.test(em)) throw new Error("Invalid email");
  await addAllow(em);
  return listAllow();
}

export async function removeAllowAction(email: string): Promise<AllowEntry[]> {
  const me = await requireAdmin();
  if (email.toLowerCase() === me.toLowerCase()) throw new Error("Cannot remove self");
  await removeAllow(email);
  return listAllow();
}

// ----- Advisor CRUD (D1) -----

export async function getAdvisorsAdminAction(): Promise<Advisor[]> {
  await requireAdmin();
  return adminListAdvisors();
}

export async function createAdvisorAction(draft: Omit<Advisor, "id">): Promise<Advisor> {
  await requireAdmin();
  return createAdvisor(draft);
}

export async function updateAdvisorAction(advisor: Advisor): Promise<void> {
  await requireAdmin();
  await updateAdvisor(advisor);
}

export async function deleteAdvisorAction(id: string): Promise<void> {
  await requireAdmin();
  const existing = await getAdvisorById(id);
  if (!existing) return;
  await removeAdvisor(id);
}

// ----- Course CRUD (D1) -----

export async function getCoursesAdminAction(): Promise<Course[]> {
  await requireAdmin();
  return adminListCourses();
}

export async function createCourseAction(draft: Omit<Course, "id">): Promise<Course> {
  await requireAdmin();
  return createCourse(draft);
}

export async function updateCourseAction(course: Course): Promise<void> {
  await requireAdmin();
  await updateCourse(course);
}

export async function deleteCourseAction(id: string): Promise<void> {
  await requireAdmin();
  const existing = await getCourseById(id);
  if (!existing) return;
  await removeCourse(id);
}

// ----- Course bookings (admin view) -----

/** Bookings each course got since the signed-in admin last opened its list, keyed by course id. */
export async function getUnseenBookingCountsAction(): Promise<Record<string, number>> {
  const me = await requireAdmin();
  return adminUnseenBookingCounts(me);
}

/** Called when the admin opens a course's bookings; returns when they last looked before (null: never). */
export async function markCourseSeenAction(courseId: string): Promise<string | null> {
  const me = await requireAdmin();
  return markCourseSeen(me, courseId);
}

export async function getBookingsForCourseAction(courseId: string): Promise<CourseBooking[]> {
  await requireAdmin();
  return adminListBookingsForCourse(courseId);
}

/**
 * Changes a booking's status. The participant is e-mailed ONLY when `notify`
 * is set — the panel asks every time, so ordinary tidying of the list never
 * mails anyone. Returns whether the e-mail actually went out (the change is
 * already saved, so a send failure can't undo it).
 */
export async function updateBookingStatusAction(
  id: string,
  status: CourseBookingStatus,
  notify = false,
): Promise<{ emailSent: boolean }> {
  await requireAdmin();
  const booking = await updateBookingStatus(id, status);
  if (!booking || !notify || status === "new") return { emailSent: false };

  const course = await getCourse(booking.courseId);
  if (!course) return { emailSent: false };

  return sendOrLog(() => sendBookingStatusEmail({ booking, course, status }));
}

/**
 * Edits a booking's details. As above — the e-mail only goes out on request,
 * and its contents come from comparing the booking before and after, so the
 * participant sees exactly what changed.
 */
export async function updateBookingAction(
  id: string,
  patch: CourseBookingEdit,
  notify = false,
): Promise<{ ok: true; emailSent: boolean } | { ok: false; reason: "full" | "duplicate" | "not-found" }> {
  await requireAdmin();

  const previous = await adminGetBookingWithCourse(id);
  if (!previous) return { ok: false, reason: "not-found" };

  const result = await adminUpdateBooking(id, patch);
  if (!result.ok) return result;

  if (!notify) return { ok: true, emailSent: false };

  const changes = diffBooking(previous.booking, result.booking);
  if (!changes.length) return { ok: true, emailSent: false };

  // Note: the e-mail goes to the address AFTER the change. If the address is
  // what changed, the old one gets nothing — usually the point (fixing a
  // typo), but worth remembering.
  const { emailSent } = await sendOrLog(() =>
    sendBookingUpdatedEmail({ booking: result.booking, course: previous.course, changes }),
  );
  return { ok: true, emailSent };
}

/** The fields that actually changed — used to fill in the e-mail. */
function diffBooking(before: CourseBooking, after: CourseBooking): BookingChange[] {
  const fields = Object.keys(BOOKING_FIELD_LABELS) as (keyof typeof BOOKING_FIELD_LABELS)[];
  return fields
    .filter((field) => String(before[field] ?? "") !== String(after[field] ?? ""))
    .map((field) => ({
      label: BOOKING_FIELD_LABELS[field],
      from: String(before[field] ?? ""),
      to: String(after[field] ?? ""),
    }));
}

/** A failed e-mail never undoes an already-saved change — just log it. */
async function sendOrLog(send: () => Promise<void>): Promise<{ emailSent: boolean }> {
  try {
    await send();
    return { emailSent: true };
  } catch (e) {
    console.error("booking notification email failed to send", e);
    return { emailSent: false };
  }
}

/**
 * Deletes a booking. The data comes from the DELETE ... RETURNING itself, so
 * the e-mail can be sent after the row is gone, with no separate read first.
 */
export async function deleteBookingAction(id: string, notify = false): Promise<{ emailSent: boolean }> {
  await requireAdmin();
  const booking = await removeBooking(id);
  if (!booking || !notify) return { emailSent: false };

  const course = await getCourse(booking.courseId);
  if (!course) return { emailSent: false };

  return sendOrLog(() => sendBookingRemovedEmail({ booking, course }));
}

// ----- Newsletter -----

export async function getNewsletterAction(query: NewsletterQuery): Promise<NewsletterPage> {
  await requireAdmin();
  return adminListNewsletter(query);
}

export async function getNewsletterRecipientAction(
  filters: NewsletterFilters,
  index: number,
): Promise<{ recipient: NewsletterRecipient | null; total: number }> {
  await requireAdmin();
  return adminNewsletterRecipient(filters, index);
}

export async function getNewsletterCoursesAction(): Promise<NewsletterCourse[]> {
  await requireAdmin();
  return adminListNewsletterCourses();
}

export async function removeFromNewsletterAction(email: string): Promise<void> {
  const me = await requireAdmin();
  await adminRemoveFromNewsletter(email, me);
}

// ----- Importing a list -----

const DATE_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export async function createImportAction(label: string, fileName: string, consentBasis: string): Promise<string> {
  const me = await requireAdmin();
  if (!label.trim() || !consentBasis.trim()) throw new Error("label and consent basis required");
  return createNewsletterImport(label.trim().slice(0, 200), fileName.slice(0, 200), consentBasis.trim().slice(0, 2000), me);
}

export async function importChunkAction(importId: string, rows: ImportRow[]): Promise<{ added: number; existing: number; suppressed: number }> {
  await requireAdmin();
  if (rows.length > IMPORT_CHUNK) throw new Error("chunk too large");
  // The file was parsed in the browser — check every row again here.
  const clean = rows
    .map((r) => ({
      email: String(r.email ?? "").trim().slice(0, 254),
      firstName: String(r.firstName ?? "").trim().slice(0, 100),
      lastName: String(r.lastName ?? "").trim().slice(0, 100),
      consentAt: DATE_RE.test(String(r.consentAt ?? "")) ? String(r.consentAt) : "",
    }))
    .filter((r) => EMAIL_RE.test(r.email));
  const seen = new Set<string>();
  const unique = clean.filter((r) => !seen.has(r.email.toLowerCase()) && !!seen.add(r.email.toLowerCase()));
  return importNewsletterChunk(importId, unique);
}

export async function getImportsAction(): Promise<NewsletterImport[]> {
  await requireAdmin();
  return listNewsletterImports();
}

export async function undoImportAction(id: string): Promise<NewsletterImport[]> {
  const me = await requireAdmin();
  await undoNewsletterImport(id, me);
  return listNewsletterImports();
}

export async function getSuppressionsAction(opts: { page: number; q: string }): Promise<{ rows: SuppressionRow[]; total: number }> {
  await requireAdmin();
  return adminListSuppressions(opts);
}

export async function restoreSubscriberAction(email: string): Promise<void> {
  const me = await requireAdmin();
  await adminRestoreSubscriber(email, me);
}

export async function getConsentHistoryAction(email: string): Promise<ConsentEntry[]> {
  await requireAdmin();
  return consentHistory(email);
}

// ----- Messages to course participants -----

export async function getCourseMessageAction(
  courseId: string,
  bookingIds: string[],
): Promise<{ course: Course; recipients: NewsletterRecipient[]; bookingIds: string[] } | null> {
  await requireAdmin();
  return courseMessageRecipients(courseId, bookingIds);
}

/** Records the message; its page (/admin/wysylki/<id>) then sends it. */
export async function createCourseMessageAction(courseId: string, bookingIds: string[], draft: NewsletterDraft): Promise<string> {
  const me = await requireAdmin();
  return createCourseMessage(courseId, bookingIds, draft, { createdBy: me, baseUrl: await emailBaseUrl() });
}

// ----- Mailings (sent-message log and queue) -----

/**
 * Queues a newsletter mailing to everyone matching the filters. `sendAfter`
 * (UTC "YYYY-MM-DD HH:MM:SS") schedules it; the cron starts it then.
 */
export async function createNewsletterMailingAction(
  filters: NewsletterFilters,
  draft: NewsletterDraft,
  audience: string,
  sendAfter?: string,
): Promise<string> {
  const me = await requireAdmin();
  if (!draft.subject.trim() || !draft.body.trim()) throw new Error("empty message");
  if (sendAfter && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(sendAfter)) throw new Error("bad date");
  return createNewsletterMailing({
    kind: "newsletter", draft, audience: audience.slice(0, 300), filters, sendAfter, createdBy: me, baseUrl: await emailBaseUrl(),
  });
}

export async function getMailingsAction(): Promise<Mailing[]> {
  await requireAdmin();
  return listMailings();
}

export async function getMailingAction(id: string): Promise<Mailing | null> {
  await requireAdmin();
  return getMailing(id);
}

export async function getMailingRecipientsAction(
  id: string,
  opts: { page: number; status: RecipientStatus | ""; q: string },
): Promise<{ rows: MailingRecipientRow[]; total: number }> {
  await requireAdmin();
  return listMailingRecipients(id, opts);
}

export async function getMailingPreviewAction(id: string): Promise<{ html: string; subject: string; email: string } | null> {
  await requireAdmin();
  return mailingPreview(id);
}

/** Sends the next chunk — the mailing's page calls this while it's open. */
export async function processMailingAction(id: string): Promise<ProcessResult> {
  await requireAdmin();
  return processMailing(id);
}

export async function mailingControlAction(id: string, action: "pause" | "resume" | "cancel" | "retry"): Promise<void> {
  await requireAdmin();
  if (action === "pause") await pauseMailing(id);
  else if (action === "resume") await resumeMailing(id);
  else if (action === "cancel") await cancelMailing(id);
  else await retryFailed(id);
}

export async function getSendingSettingsAction(): Promise<{ dailyLimit: number; sentLast24h: number }> {
  await requireAdmin();
  const [dailyLimit, sent] = await Promise.all([getDailyLimit(), sentLast24h()]);
  return { dailyLimit, sentLast24h: sent };
}

export async function setDailyLimitAction(n: number): Promise<void> {
  await requireAdmin();
  await setDailyLimit(n);
}

// ----- Saved message templates -----

export async function getTemplatesAction(): Promise<MessageTemplate[]> {
  await requireAdmin();
  return listTemplates();
}

export async function saveTemplateAction(name: string, draft: NewsletterDraft): Promise<MessageTemplate[]> {
  const me = await requireAdmin();
  if (!name.trim()) throw new Error("empty name");
  await saveTemplate(name, draft, me);
  return listTemplates();
}

export async function deleteTemplateAction(id: string): Promise<MessageTemplate[]> {
  await requireAdmin();
  await deleteTemplate(id);
  return listTemplates();
}

/** The signed-in administrator's address — the default for test sends. */
export async function getMeAction(): Promise<string> {
  return requireAdmin();
}

/**
 * Sends the draft, as rendered for the previewed recipient, to one address —
 * to check it in a real inbox. Not logged as a mailing.
 */
export async function sendTestAction(
  kind: "newsletter" | "course",
  draft: NewsletterDraft,
  recipient: NewsletterRecipient,
  to: string,
): Promise<void> {
  await requireAdmin();
  const address = to.trim();
  if (!EMAIL_RE.test(address)) throw new Error("Invalid email");
  const baseUrl = await emailBaseUrl();
  const { subject, html, text } = buildMessageEmail(
    draft,
    recipient,
    kind === "newsletter" ? { baseUrl, unsubscribeUrl: unsubscribeUrl(baseUrl, "test") } : { baseUrl },
  );
  await sendEmail({ to: address, subject: `[TEST] ${subject}`, html, text, replyTo: { email: CONTACT.email, name: SITE.name } });
}
