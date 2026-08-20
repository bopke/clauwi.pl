import "server-only";

// D1 access for courses and bookings — the single source of truth for the
// public calendar and the admin panel.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Course, CourseBooking, CourseBookingEdit, CourseBookingStatus } from "./courses";
import { nowLocalSql } from "./time";

const COLUMNS = ["id", "name", "type", "location", "description", "price", "capacity", "starts_at", "ends_at", "active"] as const;

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, unknown>;

function rowToCourse(r: Row): Course {
  return {
    id: String(r.id),
    name: (r.name as string) ?? "",
    type: (r.type as string) ?? "",
    location: (r.location as string) ?? "",
    description: (r.description as string) ?? "",
    price: Number(r.price ?? 0),
    capacity: Number(r.capacity ?? 0),
    startsAt: (r.starts_at as string) ?? "",
    endsAt: (r.ends_at as string) ?? "",
    active: !!r.active,
  };
}

function rowToBooking(r: Row): CourseBooking {
  return {
    id: String(r.id),
    courseId: String(r.course_id),
    firstName: (r.first_name as string) ?? "",
    lastName: (r.last_name as string) ?? "",
    email: (r.email as string) ?? "",
    phone: (r.phone as string) ?? "",
    seats: Number(r.seats ?? 1),
    message: (r.message as string) ?? "",
    gdprConsent: !!r.gdpr_consent,
    status: (r.status as CourseBookingStatus) ?? "new",
    version: Number(r.version ?? 0),
    createdAt: (r.created_at as string) ?? "",
  };
}

// ----- Public reads -----

/** Active, upcoming courses, in chronological order. */
export async function listUpcomingCourses(): Promise<Course[]> {
  const DB = await db();
  // starts_at/ends_at hold Warsaw wall-clock time while SQLite's
  // datetime('now') is UTC, so "now" has to be converted to the courses' own
  // timezone — otherwise a finished course lingers on the list for another
  // hour or two.
  const { results } = await DB.prepare(
    `SELECT * FROM courses WHERE active = 1 AND ends_at >= ? ORDER BY starts_at ASC`,
  ).bind(nowLocalSql()).all<Row>();
  return (results ?? []).map(rowToCourse);
}

export async function getCourseById(id: string): Promise<Course | null> {
  const DB = await db();
  const row = await DB.prepare("SELECT * FROM courses WHERE id = ?").bind(id).first<Row>();
  return row ? rowToCourse(row) : null;
}

/** Seats taken by new and confirmed bookings (both count towards capacity). */
export async function getBookedCount(courseId: string): Promise<number> {
  const DB = await db();
  const row = await DB.prepare(
    `SELECT COALESCE(SUM(seats), 0) AS n FROM course_bookings WHERE course_id = ? AND status != 'cancelled'`,
  ).bind(courseId).first<{ n: number }>();
  return row?.n ?? 0;
}

/**
 * Creates a course booking.
 *
 * The capacity and duplicate checks happen inside ONE statement
 * (INSERT ... SELECT ... WHERE) rather than as a read followed by a comparison
 * in JS — otherwise two bookings submitted at the same moment could both pass
 * the check and overbook the course.
 */
export async function createBooking(
  draft: Omit<CourseBooking, "id" | "status" | "version" | "createdAt">,
): Promise<
  | { ok: true; booking: CourseBooking; course: Course }
  | { ok: false; reason: "full" | "not-found" | "duplicate" }
> {
  const DB = await db();
  const course = await getCourseById(draft.courseId);
  if (!course) return { ok: false, reason: "not-found" };

  const id = "bkg" + crypto.randomUUID();
  const inserted = await DB.prepare(
    `INSERT INTO course_bookings
       (id, course_id, first_name, last_name, email, phone, seats, message, gdpr_consent, status)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new'
     WHERE (
       SELECT COALESCE(SUM(seats), 0) FROM course_bookings
        WHERE course_id = ? AND status != 'cancelled'
     ) + ? <= (SELECT capacity FROM courses WHERE id = ?)
     AND NOT EXISTS (
       SELECT 1 FROM course_bookings
        WHERE course_id = ? AND lower(email) = lower(?) AND status != 'cancelled'
     )
     RETURNING id`,
  ).bind(
    id, draft.courseId, draft.firstName, draft.lastName, draft.email, draft.phone,
    draft.seats, draft.message, draft.gdprConsent ? 1 : 0,
    draft.courseId, draft.seats, draft.courseId,
    draft.courseId, draft.email,
  ).first<{ id: string }>();

  if (!inserted) {
    // The statement doesn't say which of the two conditions failed — find out
    // so the visitor gets the right message.
    const dup = await DB.prepare(
      `SELECT 1 AS x FROM course_bookings
        WHERE course_id = ? AND lower(email) = lower(?) AND status != 'cancelled' LIMIT 1`,
    ).bind(draft.courseId, draft.email).first<{ x: number }>();
    return { ok: false, reason: dup ? "duplicate" : "full" };
  }

  const booking: CourseBooking = { ...draft, id, status: "new", version: 0, createdAt: new Date().toISOString() };
  return { ok: true, booking, course };
}

// ----- Admin CRUD (courses) -----

export async function adminListCourses(): Promise<Course[]> {
  const DB = await db();
  const { results } = await DB.prepare("SELECT * FROM courses ORDER BY starts_at DESC").all<Row>();
  return (results ?? []).map(rowToCourse);
}

export async function createCourse(draft: Omit<Course, "id">): Promise<Course> {
  const DB = await db();
  const course: Course = { ...draft, id: "crs" + crypto.randomUUID() };
  await DB.prepare(
    `INSERT INTO courses (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
  ).bind(
    course.id, course.name, course.type, course.location, course.description, course.price, course.capacity, course.startsAt, course.endsAt, course.active ? 1 : 0,
  ).run();
  return course;
}

export async function updateCourse(c: Course): Promise<void> {
  const DB = await db();
  await DB.prepare(
    `UPDATE courses SET name=?, type=?, location=?, description=?, price=?, capacity=?, starts_at=?, ends_at=?, active=? WHERE id=?`,
  ).bind(c.name, c.type, c.location, c.description, c.price, c.capacity, c.startsAt, c.endsAt, c.active ? 1 : 0, c.id).run();
}

export async function removeCourse(id: string): Promise<void> {
  const DB = await db();
  await DB.prepare("DELETE FROM course_bookings WHERE course_id = ?").bind(id).run();
  await DB.prepare("DELETE FROM courses WHERE id = ?").bind(id).run();
}

// ----- Admin reads (bookings) -----

export async function adminListBookingsForCourse(courseId: string): Promise<CourseBooking[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    "SELECT * FROM course_bookings WHERE course_id = ? ORDER BY created_at DESC",
  ).bind(courseId).all<Row>();
  return (results ?? []).map(rowToBooking);
}

/** Changes the status and bumps `version`; returns the updated booking (null if it's gone). */
export async function updateBookingStatus(id: string, status: CourseBookingStatus): Promise<CourseBooking | null> {
  const DB = await db();
  const row = await DB.prepare(
    "UPDATE course_bookings SET status = ?, version = version + 1 WHERE id = ? RETURNING *",
  ).bind(status, id).first<Row>();
  return row ? rowToBooking(row) : null;
}

/**
 * Edits a booking from the admin panel. Capacity and e-mail uniqueness are
 * checked inside the UPDATE itself (same approach as when booking), because
 * raising the seat count can exceed the course capacity and changing the
 * address can collide with another booking on the same course. The booking
 * being edited is excluded from both checks (`id != ?`) so it can't block
 * itself.
 */
export async function adminUpdateBooking(
  id: string,
  patch: CourseBookingEdit,
): Promise<{ ok: true; booking: CourseBooking } | { ok: false; reason: "full" | "duplicate" | "not-found" }> {
  const DB = await db();
  const before = await DB.prepare("SELECT * FROM course_bookings WHERE id = ?").bind(id).first<Row>();
  if (!before) return { ok: false, reason: "not-found" };
  const courseId = String(before.course_id);

  const row = await DB.prepare(
    `UPDATE course_bookings
        SET first_name = ?, last_name = ?, email = ?, phone = ?, seats = ?, message = ?,
            version = version + 1
      WHERE id = ?
        AND (
          status = 'cancelled'
          OR (
            SELECT COALESCE(SUM(seats), 0) FROM course_bookings
             WHERE course_id = ? AND status != 'cancelled' AND id != ?
          ) + ? <= (SELECT capacity FROM courses WHERE id = ?)
        )
        AND NOT EXISTS (
          SELECT 1 FROM course_bookings
           WHERE course_id = ? AND lower(email) = lower(?) AND status != 'cancelled' AND id != ?
        )
      RETURNING *`,
  ).bind(
    patch.firstName, patch.lastName, patch.email, patch.phone, patch.seats, patch.message,
    id,
    courseId, id, patch.seats, courseId,
    courseId, patch.email, id,
  ).first<Row>();

  if (!row) {
    const dup = await DB.prepare(
      `SELECT 1 AS x FROM course_bookings
        WHERE course_id = ? AND lower(email) = lower(?) AND status != 'cancelled' AND id != ? LIMIT 1`,
    ).bind(courseId, patch.email, id).first<{ x: number }>();
    return { ok: false, reason: dup ? "duplicate" : "full" };
  }

  return { ok: true, booking: rowToBooking(row) };
}

/** A booking together with its course — needed for the status-change e-mails. */
export async function adminGetBookingWithCourse(
  id: string,
): Promise<{ booking: CourseBooking; course: Course } | null> {
  const DB = await db();
  const row = await DB.prepare("SELECT * FROM course_bookings WHERE id = ?").bind(id).first<Row>();
  if (!row) return null;
  const booking = rowToBooking(row);
  const course = await getCourseById(booking.courseId);
  return course ? { booking, course } : null;
}

/** Deletes a booking and returns its data — needed for the e-mail sent afterwards. */
export async function removeBooking(id: string): Promise<CourseBooking | null> {
  const DB = await db();
  const row = await DB.prepare("DELETE FROM course_bookings WHERE id = ? RETURNING *").bind(id).first<Row>();
  return row ? rowToBooking(row) : null;
}
