-- Importing an existing list (the old newsletter system's archive) into
-- newsletter_subscribers, with where each address came from.
--
-- newsletter_subscribers gains:
--   source     — widget (the card on the site), import, or admin (restored
--                in the panel at the person's request)
--   import_id  — the import it came with (newsletter_imports.id)
--   first_name / last_name — when the imported file had them, for {{imie}}
--
-- newsletter_imports: one row per imported file — a label, the file name,
-- and `consent_basis`: how those people originally agreed to the newsletter
-- (also written into each address's consent_log entry), so the import can
-- be justified later. Undoing an import removes its addresses again.

ALTER TABLE newsletter_subscribers ADD COLUMN source TEXT NOT NULL DEFAULT 'widget';
ALTER TABLE newsletter_subscribers ADD COLUMN import_id TEXT NOT NULL DEFAULT '';
ALTER TABLE newsletter_subscribers ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE newsletter_subscribers ADD COLUMN last_name TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_import ON newsletter_subscribers (import_id);

CREATE TABLE IF NOT EXISTS newsletter_imports (
  id             TEXT PRIMARY KEY,
  label          TEXT NOT NULL,
  file_name      TEXT NOT NULL DEFAULT '',
  consent_basis  TEXT NOT NULL,
  added          INTEGER NOT NULL DEFAULT 0,
  existing       INTEGER NOT NULL DEFAULT 0,
  suppressed     INTEGER NOT NULL DEFAULT 0,
  created_by     TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  undone_at      TEXT
);
