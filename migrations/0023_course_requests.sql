-- "Don't see a course in your city? Let us know" — the widget under the
-- public course calendar. Anonymous on purpose: just which courses and where,
-- so the admins can see where to plan the next dates.

CREATE TABLE IF NOT EXISTS course_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  city       TEXT NOT NULL,
  types      TEXT NOT NULL,                        -- JSON array of course types
  created_at TEXT NOT NULL DEFAULT (datetime('now')) -- UTC
);

CREATE INDEX IF NOT EXISTS course_requests_created ON course_requests (created_at);
