-- Courses/events (kursy, refreshe, konferencje) — single source for the
-- public calendar and the admin panel. Migrated from the legacy Amelia
-- booking plugin (events + events_periods, 1:1 in the source data — each
-- event has exactly one date range, no true recurrence in practice).
--
-- Columns:
--   nazwa         full display name as it existed in Amelia (e.g. "kurs
--                 podstawowy WARSZAWA") — kept verbatim, admin can rename.
--   typ           free text, mostly "Kurs podstawowy" / "Kurs zaawansowany" /
--                 "Refresh" / "Konferencja" / "Wsparcie na starcie" / "Inne".
--   miejsce       city or "Online" — best-effort parsed from the legacy
--                 event name, some are odd one-offs the admin should clean up.
--   opis          description (plain text, HTML stripped).
--   cena          price in PLN.
--   limit_miejsc  capacity.
--   data_od/data_do  start/end datetime.
--   aktywny       visible on the public calendar (mirrors advisors' pattern).

CREATE TABLE IF NOT EXISTS courses (
  id            TEXT PRIMARY KEY,
  nazwa         TEXT NOT NULL,
  typ           TEXT NOT NULL DEFAULT '',
  miejsce       TEXT NOT NULL DEFAULT '',
  opis          TEXT NOT NULL DEFAULT '',
  cena          REAL NOT NULL DEFAULT 0,
  limit_miejsc  INTEGER NOT NULL DEFAULT 0,
  data_od       TEXT NOT NULL,
  data_do       TEXT NOT NULL,
  aktywny       INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_courses_data_od ON courses (data_od);
