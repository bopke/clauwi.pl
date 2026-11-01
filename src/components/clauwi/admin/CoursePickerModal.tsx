"use client";

// Course picker for the newsletter list: with the whole history imported
// there are hundreds of courses, so instead of a dropdown this is a modal
// with search (name, location, type), a date range and multi-select — e.g.
// "everyone from courses in Kraków in 2019–2021".

import { useMemo, useState } from "react";
import type { NewsletterCourse } from "@/lib/clauwi/newsletter";

const coll = new Intl.Collator("pl");

/** Lower-case and strip Polish diacritics, so "lodz" finds "Łódź". */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
}

/** "YYYY-MM-DD HH:MM" → "DD.MM.YYYY". */
function day(sql: string): string {
  const [y, m, d] = sql.slice(0, 10).split("-");
  return d ? `${d}.${m}.${y}` : sql;
}

function dateRange(c: NewsletterCourse): string {
  const a = day(c.startsAt), b = day(c.endsAt);
  return !c.endsAt || a === b ? a : `${a} – ${b}`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const d = n % 10, dd = n % 100;
  return n === 1 ? one : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
}

export function CoursePickerModal({
  courses,
  selected,
  onApply,
  onClose,
}: {
  courses: NewsletterCourse[];
  selected: string[];
  onApply: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(() => new Set(selected));
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [onlyPicked, setOnlyPicked] = useState(false);

  const types = useMemo(() => [...new Set(courses.map((c) => c.type).filter(Boolean))].sort(coll.compare), [courses]);

  const visible = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean);
    return courses.filter((c) => {
      if (onlyPicked && !picked.has(c.id)) return false;
      if (type && c.type !== type) return false;
      // A course counts as "in the range" by its start date.
      const start = c.startsAt.slice(0, 10);
      if (from && start < from) return false;
      if (to && start > to) return false;
      if (words.length) {
        const hay = fold(`${c.name} ${c.location} ${c.type}`);
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
  }, [courses, q, type, from, to, onlyPicked, picked]);

  const visiblePicked = visible.filter((c) => picked.has(c.id)).length;
  const filtered = q !== "" || type !== "" || from !== "" || to !== "";

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setVisible(on: boolean) {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const c of visible) {
        if (on) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  }

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-sheet adm-cpick" role="dialog" aria-labelledby="cpick-title">
        <div className="adm-sheet__head">
          <h2 id="cpick-title">Wybierz kursy</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>

        <div className="adm-cpick__filters">
          <label className="adm-f adm-cpick__q">
            <span>Szukaj</span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nazwa, miejscowość, rodzaj…" />
          </label>
          <label className="adm-f">
            <span>Rodzaj</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Wszystkie</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="adm-f">
            <span>Początek od</span>
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="adm-f">
            <span>do</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>

        <div className="adm-cpick__bar">
          <span className="adm-count">
            {visible.length} {plural(visible.length, "kurs", "kursy", "kursów")}
            {filtered && ` z ${courses.length}`}
          </span>
          <button type="button" className="adm-linkbtn" disabled={visible.length === 0 || visiblePicked === visible.length} onClick={() => setVisible(true)}>
            Zaznacz {filtered ? "widoczne" : "wszystkie"}
          </button>
          <button type="button" className="adm-linkbtn" disabled={visiblePicked === 0} onClick={() => setVisible(false)}>
            Odznacz {filtered ? "widoczne" : "wszystkie"}
          </button>
          {filtered && (
            <button type="button" className="adm-linkbtn" onClick={() => { setQ(""); setType(""); setFrom(""); setTo(""); }}>
              Wyczyść filtry
            </button>
          )}
          <label className="adm-cpick__only">
            <input type="checkbox" checked={onlyPicked} onChange={(e) => setOnlyPicked(e.target.checked)} />
            Tylko zaznaczone
          </label>
        </div>

        <ul className="adm-cpick__list">
          {visible.map((c) => (
            <li key={c.id}>
              <label className={picked.has(c.id) ? "is-on" : undefined}>
                <input type="checkbox" checked={picked.has(c.id)} onChange={() => toggle(c.id)} />
                <span className="adm-cpick__main">
                  <b>{c.name}</b>
                  <small>{[c.type, c.location].filter(Boolean).join(" · ")}</small>
                </span>
                <span className="adm-cpick__date">{dateRange(c)}</span>
                <span className="adm-cpick__n" title="Osoby ze zgodą na oferty">{c.consents} {plural(c.consents, "zgoda", "zgody", "zgód")}</span>
              </label>
            </li>
          ))}
          {visible.length === 0 && <li className="adm-empty">Brak kursów dla podanych kryteriów.</li>}
        </ul>

        <div className="adm-sheet__foot adm-cpick__foot">
          <span className="adm-count">
            Wybrano: {picked.size} {plural(picked.size, "kurs", "kursy", "kursów")}
          </span>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button type="button" className="adm-btn adm-btn--solid" onClick={() => onApply([...picked])}>
            {picked.size === 0 ? "Pokaż wszystkie kursy" : "Zastosuj"}
          </button>
        </div>
      </div>
    </div>
  );
}
