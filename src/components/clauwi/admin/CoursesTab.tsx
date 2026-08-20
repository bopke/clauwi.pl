"use client";

// Courses tab of the admin panel. Kept in its own file, separate from
// AdminApp.tsx, for readability — course CRUD plus per-course booking
// management.

import { useCallback, useEffect, useMemo, useState } from "react";
import { TYPE_SUGGESTIONS } from "@/lib/clauwi/courses";
import type { Course, CourseBooking, CourseBookingEdit, CourseBookingStatus } from "@/lib/clauwi/courses";
import {
  createCourseAction, deleteCourseAction, getCoursesAdminAction, updateCourseAction,
  getBookingsForCourseAction, updateBookingStatusAction, updateBookingAction, deleteBookingAction,
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
  name: "", type: TYPE_SUGGESTIONS[0], location: "", description: "", price: 0, capacity: 10,
  startsAt: new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
  endsAt: new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
  active: true,
};

function CourseForm({ initial, onSave, onClose }: { initial: Course | null; onSave: (d: CourseDraft) => void; onClose: () => void }) {
  const [f, setF] = useState<CourseDraft>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [err, setErr] = useState<Record<string, number>>({});

  function set<K extends keyof CourseDraft>(k: K, v: CourseDraft[K]) { setF((s) => ({ ...s, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, number> = {};
    if (!f.name.trim()) er.name = 1;
    if (!f.location.trim()) er.location = 1;
    if (!f.startsAt || !f.endsAt) er.data = 1;
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
          <label className={"adm-f" + (err.name ? " is-err" : "")}>
            <span>Nazwa</span>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="np. kurs podstawowy WARSZAWA" />
          </label>

          <div className="adm-f">
            <span>Typ <small>(kliknij podpowiedź lub wpisz własną wartość)</small></span>
            <div className="adm-statuspick">
              {TYPE_SUGGESTIONS.map((t) => (
                <label key={t} className={"adm-statuspick__opt" + (f.type === t ? " is-on" : "")}>
                  <input type="radio" name="type" checked={f.type === t} onChange={() => set("type", t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <input value={f.type} onChange={(e) => set("type", e.target.value)} style={{ marginTop: 8 }} />
          </div>

          <div className="adm-grid2">
            <label className={"adm-f" + (err.location ? " is-err" : "")}>
              <span>Miejsce</span>
              <input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="np. Warszawa lub Online" />
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
              <span>Aktywny <small>(widoczny w kalendarzu)</small></span>
            </label>
          </div>

          <div className={"adm-grid2" + (err.data ? " is-err" : "")}>
            <label className="adm-f">
              <span>Data i godzina rozpoczęcia</span>
              <input type="datetime-local" value={toLocalInputValue(f.startsAt)} onChange={(e) => set("startsAt", fromLocalInputValue(e.target.value))} />
            </label>
            <label className="adm-f">
              <span>Data i godzina zakończenia</span>
              <input type="datetime-local" value={toLocalInputValue(f.endsAt)} onChange={(e) => set("endsAt", fromLocalInputValue(e.target.value))} />
            </label>
          </div>

          <div className="adm-grid2">
            <label className="adm-f">
              <span>Cena (PLN)</span>
              <input type="number" min={0} value={f.price} onChange={(e) => set("price", Number(e.target.value))} />
            </label>
            <label className="adm-f">
              <span>Limit miejsc</span>
              <input type="number" min={0} value={f.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
            </label>
          </div>

          <label className="adm-f">
            <span>Opis <small>(opcjonalnie, widoczny publicznie)</small></span>
            <textarea value={f.description} onChange={(e) => set("description", (e.target as unknown as HTMLTextAreaElement).value)} rows={5} style={{ padding: 11, borderRadius: 11, border: "1.5px solid var(--line)", fontFamily: "inherit", fontSize: 15 }} />
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

// English in the database, Polish in the panel.
const STATUS_LABEL: Record<CourseBookingStatus, string> = { new: "Nowe", confirmed: "Potwierdzone", cancelled: "Anulowane" };

const BOOKING_SAVE_ERRORS: Record<"full" | "duplicate" | "not-found", string> = {
  full: "Nie zapisano: przekroczony limit miejsc na kursie.",
  duplicate: "Nie zapisano: inne zgłoszenie na ten kurs ma już ten adres e-mail.",
  "not-found": "Nie zapisano: zgłoszenie już nie istnieje.",
};

function BookingForm({
  booking,
  onSave,
  onClose,
}: {
  booking: CourseBooking;
  onSave: (patch: CourseBookingEdit, notify: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const [f, setF] = useState<CourseBookingEdit>({
    firstName: booking.firstName, lastName: booking.lastName, email: booking.email,
    phone: booking.phone, seats: booking.seats, message: booking.message,
  });
  const [notify, setNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Record<string, number>>({});

  function set<K extends keyof CourseBookingEdit>(k: K, v: CourseBookingEdit[K]) { setF((s) => ({ ...s, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, number> = {};
    if (!f.firstName.trim()) er.firstName = 1;
    if (!f.lastName.trim()) er.lastName = 1;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) er.email = 1;
    if (!(f.seats >= 1)) er.seats = 1;
    setErr(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    await onSave({ ...f, firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim() }, notify);
    setSaving(false);
  }

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="adm-sheet" style={{ maxWidth: 560 }} onSubmit={submit}>
        <div className="adm-sheet__head">
          <h2>Edytuj zgłoszenie</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          <div className="adm-grid2">
            <label className={"adm-f" + (err.firstName ? " is-err" : "")}>
              <span>Imię</span>
              <input value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </label>
            <label className={"adm-f" + (err.lastName ? " is-err" : "")}>
              <span>Nazwisko</span>
              <input value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </label>
          </div>
          <div className="adm-grid2">
            <label className={"adm-f" + (err.email ? " is-err" : "")}>
              <span>E-mail</span>
              <input value={f.email} onChange={(e) => set("email", e.target.value)} />
            </label>
            <label className="adm-f">
              <span>Telefon</span>
              <input value={f.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
          </div>
          <label className={"adm-f" + (err.seats ? " is-err" : "")}>
            <span>Liczba osób</span>
            <input type="number" min={1} value={f.seats} onChange={(e) => set("seats", Number(e.target.value))} />
          </label>
          <label className="adm-f">
            <span>Wiadomość</span>
            <textarea value={f.message} onChange={(e) => set("message", e.target.value)} rows={4} style={{ padding: 11, borderRadius: 11, border: "1.5px solid var(--line)", fontFamily: "inherit", fontSize: 15 }} />
          </label>
          <label className="adm-check">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            <span>Powiadom uczestnika e-mailem <small>(wykaz zmian + zaktualizowany termin .ics)</small></span>
          </label>
        </div>
        <div className="adm-sheet__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button type="submit" className="adm-btn adm-btn--solid" disabled={saving}>{saving ? "Zapisywanie…" : "Zapisz zmiany"}</button>
        </div>
      </form>
    </div>
  );
}

function BookingsPanel({ course, onClose, toast }: { course: Course; onClose: () => void; toast: (m: string) => void }) {
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [loading, setLoading] = useState(true);
  // Switching to "confirmed"/"cancelled" first asks whether to notify the
  // participant — an e-mail to a real person shouldn't go out because someone
  // brushed the dropdown.
  const [pendingStatus, setPendingStatus] = useState<{ booking: CourseBooking; status: CourseBookingStatus } | null>(null);
  const [editing, setEditing] = useState<CourseBooking | null>(null);
  const [delTarget, setDelTarget] = useState<CourseBooking | null>(null);

  const refresh = useCallback(async () => {
    setBookings(await getBookingsForCourseAction(course.id));
    setLoading(false);
  }, [course.id]);

  useEffect(() => { refresh(); }, [refresh]);

  async function applyStatus(id: string, status: CourseBookingStatus, notify: boolean) {
    setPendingStatus(null);
    try {
      const res = await updateBookingStatusAction(id, status, notify);
      if (!notify) toast("Zapisano status zgłoszenia.");
      else toast(res.emailSent ? "Zapisano i wysłano e-mail do uczestnika." : "Zapisano status, ale e-maila nie udało się wysłać.");
    } catch {
      toast("Nie udało się zapisać statusu.");
    }
    await refresh();
  }

  function onStatusChange(booking: CourseBooking, status: CourseBookingStatus) {
    if (status === booking.status) return;
    if (status === "new") { applyStatus(booking.id, status, false); return; }
    setPendingStatus({ booking, status });
  }
  async function saveEdit(patch: CourseBookingEdit, notify: boolean) {
    if (!editing) return;
    try {
      const res = await updateBookingAction(editing.id, patch, notify);
      if (!res.ok) { toast(BOOKING_SAVE_ERRORS[res.reason]); return; }
      setEditing(null);
      if (!notify) toast("Zapisano zmiany w zgłoszeniu.");
      else toast(res.emailSent ? "Zapisano zmiany i wysłano e-mail do uczestnika." : "Zapisano zmiany, ale e-maila nie udało się wysłać.");
    } catch {
      toast("Nie udało się zapisać zmian.");
    }
    await refresh();
  }

  async function remove(id: string, notify: boolean) {
    setDelTarget(null);
    try {
      const res = await deleteBookingAction(id, notify);
      if (!notify) toast("Usunięto zgłoszenie.");
      else toast(res.emailSent ? "Usunięto zgłoszenie i wysłano e-mail do uczestnika." : "Usunięto zgłoszenie, ale e-maila nie udało się wysłać.");
    } catch {
      toast("Nie udało się usunąć zgłoszenia.");
    }
    await refresh();
  }

  const totalPersons = bookings.filter((b) => b.status !== "cancelled").reduce((n, b) => n + b.seats, 0);

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-sheet" style={{ maxWidth: 720 }}>
        <div className="adm-sheet__head">
          <h2>Zgłoszenia — {course.name}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          <p className="adm-card__sub">
            Zajęte miejsca: {totalPersons} / {course.capacity}
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
                      <td className="adm-td-name">
                        {b.firstName} {b.lastName}
                        <div className="adm-td-addr">zgoda RODO: {b.gdprConsent ? "tak" : "—"}</div>
                        {b.message && <div className="adm-td-addr">„{b.message}”</div>}
                      </td>
                      <td className="adm-td-addr">
                        <div>{b.email}</div>
                        {b.phone && <div>{b.phone}</div>}
                      </td>
                      <td>{b.seats}</td>
                      <td>
                        <select className="adm-select" value={b.status} onChange={(e) => onStatusChange(b, e.target.value as CourseBookingStatus)}>
                          {(Object.keys(STATUS_LABEL) as CourseBookingStatus[]).map((s) => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="adm-td-act">
                        <button className="adm-iconbtn" title="Edytuj zgłoszenie" onClick={() => setEditing(b)}>
                          <svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 20h4l10-10-4-4L4 16v4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" /></svg>
                        </button>
                        <button className="adm-iconbtn adm-iconbtn--danger" title="Usuń zgłoszenie" onClick={() => setDelTarget(b)}>
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

      {editing && <BookingForm booking={editing} onSave={saveEdit} onClose={() => setEditing(null)} />}

      {delTarget && (
        <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setDelTarget(null); }}>
          <div className="adm-confirm">
            <h2>Usunąć zgłoszenie?</h2>
            <p>
              {delTarget.firstName} {delTarget.lastName} ({delTarget.email}), {delTarget.seats} os.
              {" "}Zgłoszenie zniknie z listy, a miejsca wrócą do puli. Tej operacji nie można cofnąć.
            </p>
            <div className="adm-confirm__foot">
              <button className="adm-btn adm-btn--ghost" onClick={() => setDelTarget(null)}>Anuluj</button>
              <button className="adm-btn adm-btn--ghost" onClick={() => remove(delTarget.id, false)}>Usuń bez e-maila</button>
              <button className="adm-btn adm-btn--danger" onClick={() => remove(delTarget.id, true)}>Usuń i wyślij e-mail</button>
            </div>
          </div>
        </div>
      )}

      {pendingStatus && (
        <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setPendingStatus(null); }}>
          <div className="adm-confirm">
            <h2>{pendingStatus.status === "confirmed" ? "Potwierdzić zgłoszenie?" : "Anulować zgłoszenie?"}</h2>
            <p>
              {pendingStatus.booking.firstName} {pendingStatus.booking.lastName} ({pendingStatus.booking.email}).
              {" "}Czy wysłać uczestnikowi e-mail z{" "}
              {pendingStatus.status === "confirmed"
                ? "potwierdzeniem i terminem do kalendarza (.ics)?"
                : "informacją o anulowaniu (termin zniknie z kalendarza)?"}
            </p>
            <div className="adm-confirm__foot">
              <button className="adm-btn adm-btn--ghost" onClick={() => setPendingStatus(null)}>Anuluj</button>
              <button className="adm-btn adm-btn--ghost" onClick={() => applyStatus(pendingStatus.booking.id, pendingStatus.status, false)}>
                Zapisz bez e-maila
              </button>
              <button className="adm-btn adm-btn--solid" onClick={() => applyStatus(pendingStatus.booking.id, pendingStatus.status, true)}>
                Zapisz i wyślij e-mail
              </button>
            </div>
          </div>
        </div>
      )}
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
    if (qq) arr = arr.filter((c) => c.name.toLowerCase().includes(qq) || c.location.toLowerCase().includes(qq));
    arr.sort((x, y) => coll.compare(y.startsAt, x.startsAt));
    return arr;
  }, [courses, q]);

  async function save(data: CourseDraft) {
    try {
      if (editing && editing !== "new") {
        await updateCourseAction({ ...editing, ...data, id: editing.id });
        toast("Zapisano zmiany dla " + data.name);
      } else {
        await createCourseAction(data);
        toast("Dodano kurs: " + data.name);
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
      toast("Usunięto: " + delTarget.name);
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
                  {c.name}
                  {!c.active && <div><span className="adm-statusbadge adm-statusbadge--inactive">nieaktywny</span></div>}
                </td>
                <td><span className="adm-statusbadge adm-statusbadge--level">{c.type}</span></td>
                <td className="adm-td-regions">{c.startsAt.slice(0, 10)} · {c.location}</td>
                <td>{c.price} zł</td>
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
      {bookingsFor && <BookingsPanel course={bookingsFor} onClose={() => setBookingsFor(null)} toast={toast} />}
      {delTarget && (
        <Confirm
          title="Usunąć kurs?"
          text={`Czy na pewno usunąć „${delTarget.name}”? Usunięte zostaną też wszystkie zgłoszenia na ten kurs. Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń"
          onConfirm={doDelete}
          onClose={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}
