-- Sent-message log and sending queue for messages written in the admin panel:
-- newsletter mailings and messages to a course's participants.
--
-- mailings: one row per message — its content, who it was addressed to, who
-- sent it and how far along it is. `send_after` (UTC) is when sending may
-- start; until then a mailing is "scheduled".
--
-- mailing_recipients: one row per address, created when the message is sent
-- (so the list is frozen at that moment), with the recipient's details as
-- they were then (`data`, for the placeholders) and their own status:
--   queued → sending → sent | failed | skipped (unsubscribed meanwhile,
--   cancelled), and later bounced / complained if the provider reports it.
-- A row is claimed ("sending") before its e-mail goes out, so two senders
-- running at once (the cron and an open browser tab) can't double-send.
--
-- app_settings: small key/value settings changed from the panel (the daily
-- newsletter limit).

CREATE TABLE IF NOT EXISTS mailings (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL,               -- newsletter | course
  subject       TEXT NOT NULL,
  heading       TEXT NOT NULL DEFAULT '',
  body          TEXT NOT NULL,
  audience      TEXT NOT NULL DEFAULT '',    -- who it's for, in words, as shown when sending
  filters       TEXT NOT NULL DEFAULT '',    -- newsletter: the list filters (JSON)
  course_id     TEXT NOT NULL DEFAULT '',    -- course: the course
  base_url      TEXT NOT NULL,               -- site address for links and the logo
  campaign      TEXT NOT NULL DEFAULT '',    -- utm_campaign of links to the site
  status        TEXT NOT NULL DEFAULT 'sending', -- sending | paused | done | cancelled
  pause_reason  TEXT NOT NULL DEFAULT '',
  send_after    TEXT NOT NULL DEFAULT (datetime('now')),
  created_by    TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_mailings_status ON mailings (status, send_after);

CREATE TABLE IF NOT EXISTS mailing_recipients (
  mailing_id  TEXT NOT NULL REFERENCES mailings(id) ON DELETE CASCADE,
  email       TEXT NOT NULL COLLATE NOCASE,
  ref         TEXT NOT NULL DEFAULT '',      -- course: the booking id
  data        TEXT NOT NULL,                 -- NewsletterRecipient (JSON)
  ord         INTEGER NOT NULL,              -- sending order
  status      TEXT NOT NULL DEFAULT 'queued',
  error       TEXT NOT NULL DEFAULT '',
  updated_at  TEXT,
  PRIMARY KEY (mailing_id, email)
);

CREATE INDEX IF NOT EXISTS idx_mailing_recipients_queue ON mailing_recipients (mailing_id, status, ord);
CREATE INDEX IF NOT EXISTS idx_mailing_recipients_email ON mailing_recipients (email, status);
CREATE INDEX IF NOT EXISTS idx_mailing_recipients_sent ON mailing_recipients (status, updated_at);

CREATE TABLE IF NOT EXISTS app_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

-- Brevo's free plan allows 300 e-mails a day; raise it in the panel on a paid plan.
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('newsletter_daily_limit', '300');
