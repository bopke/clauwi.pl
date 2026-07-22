"use client";

// Zakładka: Kursy (panel administracyjny). Osobny plik od AdminApp.tsx dla
// czytelności — CRUD kursów + podgląd/zarządzanie zgłoszeniami per kurs.

import { useCallback, useEffect, useMemo, useState } from "react";
import { TYP_SUGGESTIONS } from "@/lib/clauwi/courses";
import type { Course, CourseBooking, CourseBookingStatus } from "@/lib/clauwi/courses";
import {
  createCourseAction, deleteCourseAction, getCoursesAdminAction, updateCourseAction,
  getBookingsForCourseAction, updateBookingStatusAction, deleteBookingAction,
} from "@/app/admin/actions";

const coll = new Intl.Collator("pl");

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function toLocalInputValue(sqlDatetime: string): string {
  // "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM" for <input type="datetime-local">
  return sqlDatetime.replace(" ", "T").slice(0, 16);
}
function fromLocalInputValue(local: string): string {
  return local.replace("T", " ") + ":00";
}

type CourseDraft = Omit<Course, "id"> & { id?: string };
type Editing = Course | "new" | null;

const EMPTY: CourseDraft = {
  nazwa: "", typ: TYP_SUGGESTIONS[0], miejsce: "", opis: "", cena: 0, limitMiejsc: 10,
  dataOd: new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
  dataDo: new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
  aktywny: true,
};

function CourseForm({ initial, onSave, onClose }: { initial: Course | null; onSave: (d: CourseDraft) => void; onClose: () => void }) {
  const [f, setF] = useState<CourseDraft>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [err, setErr] = useState<Record<string, number>>({});

  function set<K extends keyof CourseDraft>(k: K, v: CourseDraft[K]) { setF((s) => ({ ...s, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, number> = {};
    if (!f.nazwa.trim()) er.nazwa = 1;
    if (!f.miejsce.trim()) er.miejsce = 1;
    if (!f.dataOd || !f.dataDo) er.data = 1;
    setErr(er);
    if (Object.keys(er).length) return;
    onSave(f);
  }

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="adm-sheet" onSubmit={submit}>
        <div className="adm-sheet__head">
          <h2>{initial ? "Edytuj kurs" : "Nowy kurs"}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          <label className={"adm-f" + (err.nazwa ? " is-err" : "")}>
            <span>Nazwa</span>
            <input value={f.nazwa} onChange={(e) => set("nazwa", e.target.value)} placeholder="np. kurs podstawowy WARSZAWA" />
          </label>

          <div className="adm-f">
            <span>Typ <small>(kliknij podpowiedź lub wpisz własną wartość)</small></span>
            <div className="adm-statuspick">
              {TYP_SUGGESTIONS.map((t) => (
                <label key={t} className={"adm-statuspick__opt" + (f.typ === t ? " is-on" : "")}>
                  <input type="radio" name="typ" checked={f.typ === t} onChange={() => set("typ", t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <input value={f.typ} onChange={(e) => set("typ", e.target.value)} style={{ marginTop: 8 }} />
          </div>

          <div className="adm-grid2">
            <label className={"adm-f" + (err.miejsce ? " is-err" : "")}>
              <span>Miejsce</span>
              <input value={f.miejsce} onChange={(e) => set("miejsce", e.target.value)} placeholder="np. Warszawa lub Online" />
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={f.aktywny} onChange={(e) => set("aktywny", e.target.checked)} />
              <span>Aktywny <small>(widoczny w kalendarzu)</small></span>
            </label>
          </div>

          <div className={"adm-grid2" + (err.data ? " is-err" : "")}>
            <label className="adm-f">
              <span>Data i godzina rozpoczęcia</span>
              <input type="datetime-local" value={toLocalInputValue(f.dataOd)} onChange={(e) => set("dataOd", fromLocalInputValue(e.target.value))} />
            </label>
            <label className="adm-f">
              <span>Data i godzina zakończenia</span>
              <input type="datetime-local" value={toLocalInputValue(f.dataDo)} onChange={(e) => set("dataDo", fromLocalInputValue(e.target.value))} />
            </label>
          </div>

          <div className="adm-grid2">
            <label className="adm-f">
              <span>Cena (PLN)</span>
              <input type="number" min={0} value={f.cena} onChange={(e) => set("cena", Number(e.target.value))} />
            </label>
            <label className="adm-f">
              <span>Limit miejsc</span>
              <input type="number" min={0} value={f.limitMiejsc} onChange={(e) => set("limitMiejsc", Number(e.target.value))} />
            </label>
          </div>

          <label className="adm-f">
            <span>Opis <small>(opcjonalnie, widoczny publicznie)</small></span>
            <textarea value={f.opis} onChange={(e) => set("opis", (e.target as unknown as HTMLTextAreaElement).value)} rows={5} style={{ padding: 11, borderRadius: 11, border: "1.5px solid var(--line)", fontFamily: "inherit", fontSize: 15 }} />
          </label>
        </div>
        <div className="adm-sheet__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button type="submit" className="adm-btn adm-btn--solid">{initial ? "Zapisz zmiany" : "Dodaj kurs"}</button>
        </div>
      </form>
    </div>
  );
}

function Confirm({ title, text, confirmLabel, onConfirm, onClose }: { title: string; text: string; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-confirm">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="adm-confirm__foot">
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button className="adm-btn adm-btn--danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<CourseBookingStatus, string> = { nowe: "Nowe", potwierdzone: "Potwierdzone", anulowane: "Anulowane" };

function BookingsPanel({ course, onClose }: { course: Course; onClose: () => void }) {
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setBookings(await getBookingsForCourseAction(course.id));
    setLoading(false);
  }, [course.id]);

  useEffect(() => { refresh(); }, [refresh]);

  async function setStatus(id: string, status: CourseBookingStatus) {
    await updateBookingStatusAction(id, status);
    await refresh();
  }
  async function remove(id: string) {
    await deleteBookingAction(id);
    await refresh();
  }

  const totalPersons = bookings.filter((b) => b.status !== "anulowane").reduce((n, b) => n + b.liczbaOsob, 0);

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-sheet" style={{ maxWidth: 720 }}>
        <div className="adm-sheet__head">
          <h2>Zgłoszenia — {course.nazwa}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          <p className="adm-card__sub">
            Zajęte miejsca: {totalPersons} / {course.limitMiejsc}
          </p>
          {loading ? (
            <p className="adm-card__sub">Wczytywanie…</p>
          ) : bookings.length === 0 ? (
            <p className="adm-empty">Brak zgłoszeń na ten kurs.</p>
          ) : (
            <div className="adm-tablewrap">
              <table className="adm-table">
                <thead>
                  <tr><th>Osoba</th><th>Kontakt</th><th>Osoby</th><th>Status</th><th className="adm-th-act">Akcje</th></tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="adm-td-name">{b.imie} {b.nazwisko}{b.wiadomosc && <div className="adm-td-addr">„{b.wiadomosc}”</div>}</td>
                      <td className="adm-td-addr">
                        <div>{b.email}</div>
                        {b.telefon && <div>{b.telefon}</div>}
                      </td>
                      <td>{b.liczbaOsob}</td>
                      <td>
                        <select className="adm-select" value={b.status} onChange={(e) => setStatus(b.id, e.target.value as CourseBookingStatus)}>
                          {(Object.keys(STATUS_LABEL) as CourseBookingStatus[]).map((s) => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="adm-td-act">
                        <button className="adm-iconbtn adm-iconbtn--danger" title="Usuń zgłoszenie" onClick={() => remove(b.id)}>
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="adm-sheet__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}

export function CoursesTab({ toast }: { toast: (m: string) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [delTarget, setDelTarget] = useState<Course | null>(null);
  const [bookingsFor, setBookingsFor] = useState<Course | null>(null);

  const refresh = useCallback(async () => {
    try { setCourses(await getCoursesAdminAction()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const view = useMemo(() => {
    let arr = courses.slice();
    const qq = q.trim().toLowerCase();
    if (qq) arr = arr.filter((c) => c.nazwa.toLowerCase().includes(qq) || c.miejsce.toLowerCase().includes(qq));
    arr.sort((x, y) => coll.compare(y.dataOd, x.dataOd));
    return arr;
  }, [courses, q]);

  async function save(data: CourseDraft) {
    try {
      if (editing && editing !== "new") {
        await updateCourseAction({ ...editing, ...data, id: editing.id });
        toast("Zapisano zmiany dla " + data.nazwa);
      } else {
        await createCourseAction(data);
        toast("Dodano kurs: " + data.nazwa);
      }
      setEditing(null);
      await refresh();
    } catch {
      toast("Nie udało się zapisać zmian.");
    }
  }
  async function doDelete() {
    if (!delTarget) return;
    try {
      await deleteCourseAction(delTarget.id);
      toast("Usunięto: " + delTarget.nazwa);
    } catch {
      toast("Nie udało się usunąć kursu.");
    } finally {
      setDelTarget(null);
      await refresh();
    }
  }

  return (
    <div>
      <div className="adm-toolbar">
        <div className="adm-search">
          <span aria-hidden="true">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po nazwie lub miejscu…" />
        </div>
        <span className="adm-count">{view.length} z {courses.length}</span>
        <button className="adm-btn adm-btn--solid" onClick={() => setEditing("new")}>+ Dodaj kurs</button>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr><th>Kurs</th><th>Typ</th><th>Termin / miejsce</th><th>Cena</th><th className="adm-th-act">Akcje</th></tr>
          </thead>
          <tbody>
            {view.map((c) => (
              <tr key={c.id}>
                <td className="adm-td-name">
                  {c.nazwa}
                  {!c.aktywny && <div><span className="adm-statusbadge adm-statusbadge--inactive">nieaktywny</span></div>}
                </td>
                <td><span className="adm-statusbadge adm-statusbadge--poziom">{c.typ}</span></td>
                <td className="adm-td-regions">{c.dataOd.slice(0, 10)} · {c.miejsce}</td>
                <td>{c.cena} zł</td>
                <td className="adm-td-act">
                  <button className="adm-iconbtn" title="Zgłoszenia" onClick={() => setBookingsFor(c)}>👥</button>
                  <button className="adm-iconbtn" title="Edytuj" onClick={() => setEditing(c)}>
                    <svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 20h4l10-10-4-4L4 16v4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" /></svg>
                  </button>
                  <button className="adm-iconbtn adm-iconbtn--danger" title="Usuń" onClick={() => setDelTarget(c)}>
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr><td colSpan={5} className="adm-empty">{loading ? "Wczytywanie…" : "Brak kursów dla podanych kryteriów."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <CourseForm initial={editing === "new" ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
      {bookingsFor && <BookingsPanel course={bookingsFor} onClose={() => setBookingsFor(null)} />}
      {delTarget && (
        <Confirm
          title="Usunąć kurs?"
          text={`Czy na pewno usunąć „${delTarget.nazwa}”? Usunięte zostaną też wszystkie zgłoszenia na ten kurs. Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń"
          onConfirm={doDelete}
          onClose={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}
