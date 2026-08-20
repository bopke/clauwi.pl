-- Zgoda RODO przy zapisie na kurs.
--
-- Formularz zapisu zbiera imię, nazwisko, e-mail i telefon, ale — inaczej niż
-- formularz kontaktowy — nie miał pola zgody na przetwarzanie danych. Zgoda
-- jest teraz wymagana po stronie formularza i akcji serwerowej, a tutaj
-- zapisujemy ją razem ze zgłoszeniem (created_at pełni rolę daty zgody).
--
-- Dodatkowo indeks po (course_id, email) — używany przy sprawdzaniu, czy z tego
-- samego adresu nie wysłano już zgłoszenia na ten sam kurs.

ALTER TABLE course_bookings ADD COLUMN zgoda_rodo INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_course_bookings_course_email
  ON course_bookings (course_id, email);
