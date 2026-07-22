// Model i pomocnicy kalendarza kursów ClauWi®.
// Dane przechowywane są w D1 (zob. courses-repo.ts) — ten moduł zawiera tylko
// typy i metadane.

export type Course = {
  id: string;
  nazwa: string;
  typ: string; // np. "Kurs podstawowy", "Kurs zaawansowany", "Refresh", "Konferencja"
  miejsce: string; // miasto albo "Online"
  opis: string;
  cena: number; // PLN
  limitMiejsc: number;
  dataOd: string; // ISO-ish "YYYY-MM-DD HH:MM:SS"
  dataDo: string;
  aktywny: boolean;
};

// Podpowiedzi typu w formularzu admina — nie wymuszamy jednej z tych wartości,
// dane źródłowe pokazują też inne warianty ("Inne").
export const TYP_SUGGESTIONS = ["Kurs podstawowy", "Kurs zaawansowany", "Refresh", "Konferencja", "Wsparcie na starcie"];

export type CourseBookingStatus = "nowe" | "potwierdzone" | "anulowane";

export type CourseBooking = {
  id: string;
  courseId: string;
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  liczbaOsob: number;
  wiadomosc: string;
  status: CourseBookingStatus;
  createdAt: string;
};

export const CourseUtil = {
  isPast(c: Pick<Course, "dataDo">): boolean {
    return new Date(c.dataDo.replace(" ", "T")).getTime() < Date.now();
  },
  spotsLeft(course: Course, booked: number): number {
    return Math.max(0, course.limitMiejsc - booked);
  },
};
