-- Optional marketing consent on the course booking form.
--
-- Separate from gdpr_consent (required to book at all): this one is the
-- visitor's opt-in to e-mails about further courses and offers. It is
-- unchecked by default and never required; created_at doubles as the date
-- the consent was given. Existing bookings never saw the checkbox, so 0.

ALTER TABLE course_bookings ADD COLUMN marketing_consent INTEGER NOT NULL DEFAULT 0;
