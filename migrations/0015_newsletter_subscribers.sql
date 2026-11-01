-- Sign-ups from the newsletter bar on the public site.
--
-- One row per address (compared case-insensitively); signing up again is a
-- no-op. Course participants who ticked the marketing checkbox stay in
-- course_bookings.marketing_consent — the admin "Newsletter" tab lists both.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email       TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
