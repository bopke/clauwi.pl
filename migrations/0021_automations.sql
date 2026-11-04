-- Automatic e-mails, each switched on and worded in the admin panel
-- ("Automatyczne"):
--   welcome           — right after someone confirms a newsletter sign-up
--   course-reminder   — `days` before a course starts, to its participants
--   course-thanks     — `days` after a course ends, to confirmed participants
--   course-next-step  — `days` after a course ends, an offer of the next
--                       course; marketing, so only with consent, with an
--                       unsubscribe link. options: { afterType, skipIfType }
-- All start switched OFF. A course e-mail only ever goes out for courses
-- that end after it was switched on (`enabled_at`, UTC) — turning one on
-- never mails the whole history.
--
-- automation_sends: one row per e-mail an automation sent (or tried to), so
-- nobody gets the same one twice. `ref` is the booking id, or the address
-- for the welcome e-mail.

CREATE TABLE IF NOT EXISTS automations (
  key         TEXT PRIMARY KEY,
  enabled     INTEGER NOT NULL DEFAULT 0,
  days        INTEGER NOT NULL DEFAULT 0,
  subject     TEXT NOT NULL,
  heading     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL,
  options     TEXT NOT NULL DEFAULT '{}',
  enabled_at  TEXT,
  updated_by  TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS automation_sends (
  automation  TEXT NOT NULL,
  ref         TEXT NOT NULL,
  email       TEXT NOT NULL COLLATE NOCASE,
  status      TEXT NOT NULL, -- sending | sent | failed | skipped
  error       TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (automation, ref)
);

CREATE INDEX IF NOT EXISTS idx_automation_sends_recent ON automation_sends (automation, created_at);

INSERT OR IGNORE INTO automations (key, days, subject, heading, body) VALUES
('welcome', 0,
 'Witamy w newsletterze ClauWi®',
 'Dziękujemy za zapis',
 'Dzień dobry,

dziękujemy za zapisanie się na newsletter Szkoły Noszenia ClauWi®. Kilka razy w roku napiszemy o nowych terminach kursów i ofertach — nie częściej.

Aktualne terminy znajdziesz w [kalendarzu kursów](https://clauwi.pl/kalendarz-wydarzen).

Do usłyszenia!
Zespół ClauWi®'),
('course-reminder', 3,
 'Przypomnienie: {{kurs.nazwa}} — {{kurs.data}}',
 'Do zobaczenia na kursie',
 'Dzień dobry {{imie}},

przypominamy, że **{{kurs.nazwa}}** zaczyna się **{{kurs.data}} o godz. {{kurs.godzina}}**.

Miejsce: {{kurs.miejsce}}

Jeśli masz pytania albo nie możesz przyjechać, odpowiedz na tę wiadomość lub zadzwoń: 666 538 731.

Do zobaczenia!
Zespół ClauWi®'),
('course-thanks', 1,
 'Dziękujemy za udział w kursie {{kurs.nazwa}}',
 'Dziękujemy!',
 'Dzień dobry {{imie}},

dziękujemy za udział w kursie **{{kurs.nazwa}}**. Mamy nadzieję, że był dla Ciebie inspirujący.

Będzie nam bardzo miło, jeśli podzielisz się wrażeniami — [zostaw opinię](https://clauwi.pl/opinie).

Zespół ClauWi®'),
('course-next-step', 30,
 'Co dalej po kursie {{kurs.nazwa}}?',
 'Kolejny krok',
 'Dzień dobry {{imie}},

od Twojego kursu **{{kurs.nazwa}}** minął już miesiąc. Jeśli chcesz pójść dalej, zajrzyj do [kalendarza kursów](https://clauwi.pl/kalendarz-wydarzen) — znajdziesz tam kolejne terminy.

Zespół ClauWi®');

UPDATE automations SET options = '{"afterType":"Kurs podstawowy","skipIfType":"Kurs zaawansowany"}' WHERE key = 'course-next-step';
