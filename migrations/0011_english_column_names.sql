-- Rename every Polish column to English and translate the stored status
-- values. From here on the rule is: identifiers (columns, types, fields,
-- form field names) are English; Polish belongs only in text shown to a
-- visitor or an administrator.
--
-- Earlier migrations are deliberately left untouched: they are the historical
-- record and still have to replay in order on a fresh database, so they keep
-- inserting into the old column names and this migration renames afterwards.
--
-- Indexes are dropped and recreated rather than left alone: SQLite rewrites
-- an index's column references on RENAME COLUMN, but it keeps the old index
-- NAME, which would leave "idx_courses_data_od" pointing at "starts_at".

-- ----- advisors -----
ALTER TABLE advisors RENAME COLUMN nazwa            TO name;
ALTER TABLE advisors RENAME COLUMN poziom           TO level;
ALTER TABLE advisors RENAME COLUMN wojewodztwo      TO region;
ALTER TABLE advisors RENAME COLUMN miejscowosc      TO locality;
ALTER TABLE advisors RENAME COLUMN telefon          TO phone;
ALTER TABLE advisors RENAME COLUMN www              TO website;
ALTER TABLE advisors RENAME COLUMN oferta           TO services;
ALTER TABLE advisors RENAME COLUMN waznoscUprawnien TO certification_valid_until;
ALTER TABLE advisors RENAME COLUMN uwagi            TO notes;
ALTER TABLE advisors RENAME COLUMN aktywny          TO active;

DROP INDEX IF EXISTS idx_advisors_woj;
CREATE INDEX IF NOT EXISTS idx_advisors_region ON advisors (region, name COLLATE NOCASE);

-- ----- courses -----
ALTER TABLE courses RENAME COLUMN nazwa        TO name;
ALTER TABLE courses RENAME COLUMN typ          TO type;
ALTER TABLE courses RENAME COLUMN miejsce      TO location;
ALTER TABLE courses RENAME COLUMN opis         TO description;
ALTER TABLE courses RENAME COLUMN cena         TO price;
ALTER TABLE courses RENAME COLUMN limit_miejsc TO capacity;
ALTER TABLE courses RENAME COLUMN data_od      TO starts_at;
ALTER TABLE courses RENAME COLUMN data_do      TO ends_at;
ALTER TABLE courses RENAME COLUMN aktywny      TO active;

DROP INDEX IF EXISTS idx_courses_data_od;
CREATE INDEX IF NOT EXISTS idx_courses_starts_at ON courses (starts_at);

-- ----- course_bookings -----
ALTER TABLE course_bookings RENAME COLUMN imie        TO first_name;
ALTER TABLE course_bookings RENAME COLUMN nazwisko    TO last_name;
ALTER TABLE course_bookings RENAME COLUMN telefon     TO phone;
ALTER TABLE course_bookings RENAME COLUMN liczba_osob TO seats;
ALTER TABLE course_bookings RENAME COLUMN wiadomosc   TO message;
ALTER TABLE course_bookings RENAME COLUMN zgoda_rodo  TO gdpr_consent;
ALTER TABLE course_bookings RENAME COLUMN wersja      TO version;

-- Status values were Polish too. The admin UI keeps showing
-- Nowe / Potwierdzone / Anulowane, but the stored value is now English.
UPDATE course_bookings SET status = 'new'       WHERE status = 'nowe';
UPDATE course_bookings SET status = 'confirmed' WHERE status = 'potwierdzone';
UPDATE course_bookings SET status = 'cancelled' WHERE status = 'anulowane';
