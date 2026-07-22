-- Advisors (doradcy noszenia) — single source for the public directory and
-- the admin panel. Field names/shape are ClauWi-specific (NOT the same as
-- specjalisci-easybaby's advisor model): the legacy site stores one region
-- per advisor (not a multi-region array) and has no photo/verification badge.
--
-- Columns match the live regional table columns 1:1:
--   nazwa (Doradca), poziom (Poziom), miejscowosc (Miejscowość),
--   email (Adres E-Mail), www (Strona WWW), telefon (Telefon),
--   oferta (Oferta Dodatkowa)
-- `wojewodztwo` is the region slug (16 voivodeships + "zagranica").
-- `aktywny` mirrors the site's own "lista aktywnych doradców" concept — lets
-- an admin hide an advisor without deleting their record.

CREATE TABLE IF NOT EXISTS advisors (
  id            TEXT PRIMARY KEY,
  nazwa         TEXT NOT NULL,
  poziom        TEXT NOT NULL DEFAULT '',
  wojewodztwo   TEXT NOT NULL,
  miejscowosc   TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  www           TEXT NOT NULL DEFAULT '',
  telefon       TEXT NOT NULL DEFAULT '',
  oferta        TEXT NOT NULL DEFAULT '',
  aktywny       INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_advisors_woj ON advisors (wojewodztwo, nazwa COLLATE NOCASE);
