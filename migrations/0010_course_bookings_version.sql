-- Booking revision counter.
--
-- Every e-mail about a booking carries an .ics attachment with the same UID so
-- the participant's calendar updates the existing event instead of adding
-- another one. Calendars compare the SEQUENCE field and ignore any message
-- with an older (or equal) number — until now that number was hardcoded per
-- e-mail type (booking 0, confirmation 1, cancellation 2), which breaks as
-- soon as a booking is edited or changed twice in a row.
--
-- This column is the source of SEQUENCE: it grows by 1 on every status change
-- and on every edit of the booking's details.

-- NOTE: this file was renamed from 0010_course_bookings_wersja.sql when the
-- schema was translated to English (see 0011). It had not yet been applied to
-- production; a local d1_migrations row was updated to match the new name.

ALTER TABLE course_bookings ADD COLUMN wersja INTEGER NOT NULL DEFAULT 0;
