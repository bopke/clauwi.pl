-- Course sign-ups (course_bookings) — replaces Amelia's online-payment
-- booking flow with a simple registration: pick a course, submit contact
-- details, admin follows up and arranges payment offline (bank transfer/
-- invoice, per the "no online payment gateway" decision). No customer
-- accounts, no payment processing — just a request queue the admin can see
-- and act on from the panel.

CREATE TABLE IF NOT EXISTS course_bookings (
  id            TEXT PRIMARY KEY,
  course_id     TEXT NOT NULL REFERENCES courses(id),
  imie          TEXT NOT NULL,
  nazwisko      TEXT NOT NULL,
  email         TEXT NOT NULL,
  telefon       TEXT NOT NULL DEFAULT '',
  liczba_osob   INTEGER NOT NULL DEFAULT 1,
  wiadomosc     TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'nowe', -- nowe | potwierdzone | anulowane
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_course_bookings_course ON course_bookings (course_id);
