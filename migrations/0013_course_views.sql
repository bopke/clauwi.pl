-- When each admin last opened a course's bookings in the panel, so the panel
-- can flag bookings that came in since ("2 nowe"). Per admin: one person
-- reading the list doesn't clear the flag for the others.

CREATE TABLE IF NOT EXISTS course_views (
  admin_email TEXT NOT NULL,             -- lower-case, as in allowlist
  course_id   TEXT NOT NULL,
  seen_at     TEXT NOT NULL DEFAULT (datetime('now')), -- UTC, same format as course_bookings.created_at
  PRIMARY KEY (admin_email, course_id)
);

-- Start from "everything so far has been seen" for the current admins, so
-- the panel doesn't light up every existing booking on the first visit.
INSERT OR IGNORE INTO course_views (admin_email, course_id)
SELECT lower(a.email), c.id FROM allowlist a CROSS JOIN courses c;
