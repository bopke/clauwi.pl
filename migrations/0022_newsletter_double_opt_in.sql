-- Double opt-in for the newsletter card on the site: signing up only sends
-- a "confirm your sign-up" e-mail; the address joins newsletter_subscribers
-- once its link is used. Proves the address belongs to the person who
-- signed up, and keeps typos, fake sign-ups and spam traps off the list.
--
-- One row per sign-up attempt; `token` is the link's secret, `ip` and
-- `wording` what the consent was given from and to, `confirmed_at` when the
-- link was used. Links expire after 7 days.

CREATE TABLE IF NOT EXISTS newsletter_pending (
  token         TEXT PRIMARY KEY,
  email         TEXT NOT NULL COLLATE NOCASE,
  wording       TEXT NOT NULL,
  ip            TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_pending_email ON newsletter_pending (email, created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_pending_ip ON newsletter_pending (ip, created_at);
