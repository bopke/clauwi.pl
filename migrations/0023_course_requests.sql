-- "Don't see a course in your city? Let us know" — the widget under the
-- public course calendar: which courses and where, so the admins can see
-- where to plan the next dates. The e-mail is optional — given only by people
-- who want to hear when a course is planned there, with `consent` holding the
-- exact wording they agreed to (src/lib/clauwi/consent.ts).

CREATE TABLE IF NOT EXISTS course_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  city       TEXT NOT NULL,
  types      TEXT NOT NULL,                        -- JSON array of course types
  email      TEXT NOT NULL DEFAULT '',
  consent    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')) -- UTC
);

CREATE INDEX IF NOT EXISTS course_requests_created ON course_requests (created_at);
