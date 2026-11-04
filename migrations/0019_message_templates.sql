-- Reusable message templates for the composer ("Szablony"): a subject,
-- heading and body saved under a name, for messages that come back — a
-- reminder before a course, a schedule change, a seasonal offer. Shared by
-- newsletter mailings and course messages; saving under an existing name
-- overwrites it.

CREATE TABLE IF NOT EXISTS message_templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
  subject     TEXT NOT NULL DEFAULT '',
  heading     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  updated_by  TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
