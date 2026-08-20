// .ics (iCalendar, RFC 5545) generator for course dates.
//
// Attached to the e-mails participants receive — one click and the course is
// in their calendar (Google/Outlook/Apple). We send METHOD:PUBLISH (a plain
// "add this event") rather than REQUEST: we don't run RSVP invitations, and
// PUBLISH is what mail clients handle most predictably. Cancelling a booking
// sends the same UID with METHOD:CANCEL, so the event disappears or is marked
// cancelled in the participant's calendar.

import { localSqlToDate } from "./time";

export type IcsMethod = "PUBLISH" | "CANCEL";

export type CourseIcsParams = {
  /** Booking id — the UID has to stay the same across every e-mail about one booking. */
  bookingId: string;
  courseId: string;
  courseName: string;
  location: string;
  description: string;
  /** "YYYY-MM-DD HH:MM:SS" in Polish time. */
  startsAt: string;
  endsAt: string;
  organizerEmail: string;
  organizerName?: string;
  method?: IcsMethod;
  /**
   * The event's revision number. It has to grow with every further message
   * carrying the same UID, otherwise calendars ignore the update.
   */
  sequence?: number;
};

/** A date in the UTC form iCalendar requires: 20260807T080000Z */
function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escaping for text values (RFC 5545 §3.3.11). */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folding lines at 75 octets (RFC 5545 §3.1) — counted in UTF-8 bytes rather
 * than characters, because Polish letters take two bytes each.
 */
function fold(line: string): string {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const bytes = enc.encode(line);
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Don't cut in the middle of a multi-byte character.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    chunks.push(dec.decode(bytes.subarray(start, end)));
    start = end;
    limit = 74; // continuation lines carry a leading space
  }
  return chunks.join("\r\n ");
}

export function buildCourseIcs(params: CourseIcsParams): string {
  const method: IcsMethod = params.method ?? "PUBLISH";
  const start = localSqlToDate(params.startsAt);
  const end = localSqlToDate(params.endsAt);
  // Zero-length events are sometimes ignored by calendars — fall back to an hour.
  const safeEnd = end.getTime() > start.getTime() ? end : new Date(start.getTime() + 60 * 60 * 1000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClauWi//Kalendarz kursow//PL",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:kurs-${params.courseId}-zgloszenie-${params.bookingId}@clauwi.pl`,
    `SEQUENCE:${params.sequence ?? 0}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(safeEnd)}`,
    `SUMMARY:${esc(params.courseName)}`,
    `LOCATION:${esc(params.location)}`,
    `DESCRIPTION:${esc(params.description)}`,
    `ORGANIZER;CN=${esc(params.organizerName ?? "ClauWi")}:mailto:${params.organizerEmail}`,
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // iCalendar requires CRLF at the end of every line, including the last one.
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Attachment file name — kept safe for mail clients. */
export function icsFileName(courseName: string): string {
  const slug = courseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/gi, "l")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
  return `${slug || "kurs"}.ics`;
}
