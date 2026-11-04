-- Consent log: proof of marketing consent (GDPR art. 7(1) — the controller
-- has to be able to show that, when and how someone agreed).
--
-- Append-only: one row every time an address gives or withdraws consent to
-- newsletter mailings — the newsletter card, the marketing checkbox on a
-- booking, an import, an unsubscribe, a removal in the panel, a bounce or spam
-- complaint reported by the e-mail provider. `wording` is the exact text the
-- person agreed to (src/lib/clauwi/consent.ts), `ref` the booking / import /
-- admin it relates to, `ip` the address the consent was given from.
--
-- The current state still lives where it did (newsletter_subscribers,
-- course_bookings.marketing_consent, newsletter_suppressions); this table is
-- the history behind it.

CREATE TABLE IF NOT EXISTS consent_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL COLLATE NOCASE,
  action      TEXT NOT NULL, -- granted | withdrawn
  source      TEXT NOT NULL, -- see ConsentSource in src/lib/clauwi/consent.ts
  ref         TEXT NOT NULL DEFAULT '',
  wording     TEXT NOT NULL DEFAULT '',
  ip          TEXT NOT NULL DEFAULT '',
  note        TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consent_log_email ON consent_log (email, created_at);

-- Everything collected before the log existed, with the wording the forms
-- showed at the time (unchanged since they were added) and the original dates.
INSERT INTO consent_log (email, action, source, wording, note, created_at)
SELECT email, 'granted', 'widget',
       'Wyrażam zgodę na otrzymywanie newslettera zgodnie z polityką prywatności.',
       'uzupełnione przy założeniu rejestru zgód', created_at
  FROM newsletter_subscribers;

INSERT INTO consent_log (email, action, source, ref, wording, note, created_at)
SELECT email, 'granted', 'booking', id,
       'Chcę otrzymywać e-mailem informacje o kolejnych kursach i ofertach ClauWi® (opcjonalnie).',
       'uzupełnione przy założeniu rejestru zgód', created_at
  FROM course_bookings
 WHERE marketing_consent = 1;

INSERT INTO consent_log (email, action, source, note, created_at)
SELECT email, 'withdrawn', reason, 'uzupełnione przy założeniu rejestru zgód', created_at
  FROM newsletter_suppressions;
