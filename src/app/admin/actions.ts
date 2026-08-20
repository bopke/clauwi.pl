"use server";

import { auth, signIn, signOut } from "@/auth";
import { addAllow, listAllow, removeAllow } from "@/lib/clauwi/allowlist";
import { adminListAdvisors, createAdvisor, getAdvisorById, removeAdvisor, updateAdvisor } from "@/lib/clauwi/advisors-repo";
import type { AllowEntry, Advisor } from "@/lib/clauwi/advisors";
import {
  adminListCourses, createCourse, getCourseById, removeCourse, updateCourse,
  adminListBookingsForCourse, updateBookingStatus, removeBooking, adminGetBookingWithCourse,
  adminUpdateBooking, getCourseById as getCourse,
} from "@/lib/clauwi/courses-repo";
import { sendBookingStatusEmail, sendBookingUpdatedEmail, sendBookingRemovedEmail } from "@/lib/clauwi/brevo";
import { BOOKING_FIELD_LABELS } from "@/lib/clauwi/courses";
import type { Course, CourseBooking, CourseBookingEdit, CourseBookingStatus } from "@/lib/clauwi/courses";
import type { BookingChange } from "@/lib/clauwi/email-templates/course-booking-updated";

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
