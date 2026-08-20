-- Rebuild course_bookings so its column DEFAULT is English too.
--
-- 0011 renamed the columns and rewrote the stored values, but the table's own
-- definition still carried `status TEXT NOT NULL DEFAULT 'nowe'` — SQLite has
-- no ALTER COLUMN, so a default can only be changed by recreating the table.
-- Same reason the old Polish enum comment was still sitting in the schema.
--
-- Standard SQLite table rebuild: create the replacement, copy every row, drop
-- the original, rename into place, recreate the indexes.

CREATE TABLE course_bookings_new (
  id            TEXT PRIMARY KEY,
  course_id     TEXT NOT NULL REFERENCES courses(id),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  seats         INTEGER NOT NULL DEFAULT 1,
  message       TEXT NOT NULL DEFAULT '',
  -- GDPR consent, collected by the public booking form.
  gdpr_consent  INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'new', -- new | confirmed | cancelled
  -- Bumped on every change; feeds SEQUENCE in the .ics attachment.
  version       INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO course_bookings_new
  (id, course_id, first_name, last_name, email, phone, seats, message, gdpr_consent, status, version, created_at)
SELECT
   id, course_id, first_name, last_name, email, phone, seats, message, gdpr_consent, status, version, created_at
FROM course_bookings;

DROP TABLE course_bookings;
ALTER TABLE course_bookings_new RENAME TO course_bookings;

CREATE INDEX IF NOT EXISTS idx_course_bookings_course ON course_bookings (course_id);
CREATE INDEX IF NOT EXISTS idx_course_bookings_course_email ON course_bookings (course_id, email);
