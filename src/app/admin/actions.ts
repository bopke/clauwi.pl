"use server";

import { auth, signIn, signOut } from "@/auth";
import { addAllow, listAllow, removeAllow } from "@/lib/clauwi/allowlist";
import { adminListAdvisors, createAdvisor, getAdvisorById, removeAdvisor, updateAdvisor } from "@/lib/clauwi/advisors-repo";
import type { AllowEntry, Advisor } from "@/lib/clauwi/advisors";
import {
  adminListCourses, createCourse, getCourseById, removeCourse, updateCourse,
  adminListBookingsForCourse, updateBookingStatus, removeBooking,
} from "@/lib/clauwi/courses-repo";
import type { Course, CourseBooking, CourseBookingStatus } from "@/lib/clauwi/courses";

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

export async function updateBookingStatusAction(id: string, status: CourseBookingStatus): Promise<void> {
  await requireAdmin();
  await updateBookingStatus(id, status);
}

export async function deleteBookingAction(id: string): Promise<void> {
  await requireAdmin();
  await removeBooking(id);
}
