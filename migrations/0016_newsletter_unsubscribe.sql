-- Unsubscribing from newsletter mailings.
--
-- newsletter_suppressions: addresses that must not get mailings — they used
-- the unsubscribe link, were removed in the admin panel, or the e-mail
-- provider reported an unsubscribe, spam complaint or hard bounce. Kept
-- instead of just deleting the address so a later import (or the old data)
-- can't quietly put it back. Fresh consent — the newsletter card or the
-- marketing checkbox on a booking — lifts the suppression.
--
-- newsletter_tokens: one random token per address for the unsubscribe link,
-- so the link carries no e-mail address and can't be guessed.

CREATE TABLE IF NOT EXISTS newsletter_suppressions (
  email       TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
  reason      TEXT NOT NULL, -- link | one-click | admin | provider-unsubscribe | provider-spam | provider-bounce
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS newsletter_tokens (
  token       TEXT NOT NULL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
