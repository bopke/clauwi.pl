import "server-only";

// Dostęp do kursów i zgłoszeń w D1 — jedyne źródło prawdy dla publicznego
// kalendarza i panelu admina.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Course, CourseBooking, CourseBookingStatus } from "./courses";

const COLUMNS = ["id", "nazwa", "typ", "miejsce", "opis", "cena", "limit_miejsc", "data_od", "data_do", "aktywny"] as const;

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, unknown>;

function rowToCourse(r: Row): Course {
  return {
    id: String(r.id),
    nazwa: (r.nazwa as string) ?? "",
    typ: (r.typ as string) ?? "",
    miejsce: (r.miejsce as string) ?? "",
    opis: (r.opis as string) ?? "",
    cena: Number(r.cena ?? 0),
    limitMiejsc: Number(r.limit_miejsc ?? 0),
    dataOd: (r.data_od as string) ?? "",
    dataDo: (r.data_do as string) ?? "",
    aktywny: !!r.aktywny,
  };
}

function rowToBooking(r: Row): CourseBooking {
  return {
    id: String(r.id),
    courseId: String(r.course_id),
    imie: (r.imie as string) ?? "",
    nazwisko: (r.nazwisko as string) ?? "",
    email: (r.email as string) ?? "",
    telefon: (r.telefon as string) ?? "",
    liczbaOsob: Number(r.liczba_osob ?? 1),
    wiadomosc: (r.wiadomosc as string) ?? "",
    status: (r.status as CourseBookingStatus) ?? "nowe",
    createdAt: (r.created_at as string) ?? "",
  };
}

// ----- Public reads -----

/** Aktywne, nadchodzące kursy (posortowane chronologicznie). */
export async function listUpcomingCourses(): Promise<Course[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    `SELECT * FROM courses WHERE aktywny = 1 AND data_do >= datetime('now') ORDER BY data_od ASC`,
  ).all<Row>();
  return (results ?? []).map(rowToCourse);
}

export async function getCourseById(id: string): Promise<Course | null> {
  const DB = await db();
  const row = await DB.prepare("SELECT * FROM courses WHERE id = ?").bind(id).first<Row>();
  return row ? rowToCourse(row) : null;
}

/** Suma osób zaakceptowanych/nowych zgłoszeń (obie liczą się do limitu miejsc). */
export async function getBookedCount(courseId: string): Promise<number> {
  const DB = await db();
  const row = await DB.prepare(
    `SELECT COALESCE(SUM(liczba_osob), 0) AS n FROM course_bookings WHERE course_id = ? AND status != 'anulowane'`,
  ).bind(courseId).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Tworzy zgłoszenie, odrzuca jeśli przekroczy limit miejsc (sprawdzane atomowo w D1). */
export async function createBooking(
  draft: Omit<CourseBooking, "id" | "status" | "createdAt">,
): Promise<{ ok: true; booking: CourseBooking } | { ok: false; reason: "full" | "not-found" }> {
  const DB = await db();
  const course = await getCourseById(draft.courseId);
  if (!course) return { ok: false, reason: "not-found" };

  const booked = await getBookedCount(draft.courseId);
  if (booked + draft.liczbaOsob > course.limitMiejsc) return { ok: false, reason: "full" };

  const booking: CourseBooking = { ...draft, id: "bkg" + crypto.randomUUID(), status: "nowe", createdAt: new Date().toISOString() };
  await DB.prepare(
    `INSERT INTO course_bookings (id, course_id, imie, nazwisko, email, telefon, liczba_osob, wiadomosc, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    booking.id, booking.courseId, booking.imie, booking.nazwisko, booking.email, booking.telefon, booking.liczbaOsob, booking.wiadomosc, booking.status,
  ).run();
  return { ok: true, booking };
}

// ----- Admin CRUD (courses) -----

export async function adminListCourses(): Promise<Course[]> {
  const DB = await db();
  const { results } = await DB.prepare("SELECT * FROM courses ORDER BY data_od DESC").all<Row>();
  return (results ?? []).map(rowToCourse);
}

export async function createCourse(draft: Omit<Course, "id">): Promise<Course> {
  const DB = await db();
  const course: Course = { ...draft, id: "crs" + crypto.randomUUID() };
  await DB.prepare(
    `INSERT INTO courses (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
  ).bind(
    course.id, course.nazwa, course.typ, course.miejsce, course.opis, course.cena, course.limitMiejsc, course.dataOd, course.dataDo, course.aktywny ? 1 : 0,
  ).run();
  return course;
}

export async function updateCourse(c: Course): Promise<void> {
  const DB = await db();
  await DB.prepare(
    `UPDATE courses SET nazwa=?, typ=?, miejsce=?, opis=?, cena=?, limit_miejsc=?, data_od=?, data_do=?, aktywny=? WHERE id=?`,
  ).bind(c.nazwa, c.typ, c.miejsce, c.opis, c.cena, c.limitMiejsc, c.dataOd, c.dataDo, c.aktywny ? 1 : 0, c.id).run();
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

export async function adminListAllBookings(): Promise<(CourseBooking & { courseNazwa: string })[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    `SELECT b.*, c.nazwa AS course_nazwa FROM course_bookings b JOIN courses c ON c.id = b.course_id ORDER BY b.created_at DESC`,
  ).all<Row>();
  return (results ?? []).map((r) => ({ ...rowToBooking(r), courseNazwa: (r.course_nazwa as string) ?? "" }));
}

export async function updateBookingStatus(id: string, status: CourseBookingStatus): Promise<void> {
  const DB = await db();
  await DB.prepare("UPDATE course_bookings SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function removeBooking(id: string): Promise<void> {
  const DB = await db();
  await DB.prepare("DELETE FROM course_bookings WHERE id = ?").bind(id).run();
}
