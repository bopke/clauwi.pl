"use client";

// Admin "Newsletter" tab: everyone who agreed to marketing e-mails — sign-ups
// from the newsletter card on the site and course bookings with the marketing
// checkbox ticked — filterable by where they came from. Deleting an address
// takes it off the list everywhere (see adminRemoveFromNewsletter).
//
// Filtering and paging happen on the server, a page at a time — the list will
// also hold an imported archive, far too long to load whole.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NEWSLETTER_PAGE_SIZE, type NewsletterCourse, type NewsletterFilters, type NewsletterPage, type NewsletterQuery } from "@/lib/clauwi/newsletter";
import { getNewsletterAction, getNewsletterCoursesAction, removeFromNewsletterAction } from "@/app/admin/actions";
import { CoursePickerModal } from "./CoursePickerModal";
import { NEWSLETTER_FILTERS_KEY } from "./NewsletterComposer";

const coll = new Intl.Collator("pl");

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

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

/** Polish plural: 1 adres, 2–4 adresy, 5+ adresów (12–14 → many). */
function plural(n: number, one: string, few: string, many: string): string {
  const d = n % 10, dd = n % 100;
  return n === 1 ? one : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
}

/** "2026-11-01 14:05:00" (UTC, as SQLite stores it) → local date and time. */
function formatUtc(sql: string): string {
  const d = new Date(sql.replace(" ", "T") + (sql.endsWith("Z") ? "" : "Z"));
  return isNaN(+d) ? sql : d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

/** Course start (Warsaw wall-clock "YYYY-MM-DD HH:MM") → "DD.MM.YYYY". */
function formatCourseDate(sql: string): string {
  const [y, m, d] = sql.slice(0, 10).split("-");
  return d ? `${d}.${m}.${y}` : sql;
}

export function NewsletterTab({ toast }: { toast: (m: string) => void }) {
  const [data, setData] = useState<NewsletterPage | null>(null);
  const [courses, setCourses] = useState<NewsletterCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  // The search box as sent to the server — lags typing by a moment.
  const [debouncedQ, setDebouncedQ] = useState("");
  const [source, setSource] = useState<NewsletterQuery["source"]>("");
  const [courseType, setCourseType] = useState("");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);
  const [page, setPage] = useState(1);
  // Bumped to refetch the current page (after a deletion).
  const [reload, setReload] = useState(0);
  const [delTarget, setDelTarget] = useState<string | null>(null);
  const router = useRouter();

  // Opens the composer for everyone matching the filters as they stand.
  function compose() {
    const filters: NewsletterFilters = { q: debouncedQ, source, courseType, courseIds };
    try {
      sessionStorage.setItem(NEWSLETTER_FILTERS_KEY, JSON.stringify(filters));
    } catch {}
    router.push("/admin/newsletter/wiadomosc");
  }

  useEffect(() => {
    if (q === debouncedQ) return;
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q, debouncedQ]);

  useEffect(() => {
    getNewsletterCoursesAction().then(setCourses, () => {});
  }, [reload]);

  useEffect(() => {
    let stale = false;
    getNewsletterAction({ page, q: debouncedQ, source, courseType, courseIds })
      .then(
        (res) => {
          if (stale) return;
          // Deleting the last entry of the last page leaves it empty — step back.
          if (res.entries.length === 0 && page > 1) setPage(Math.max(1, Math.ceil(res.total / NEWSLETTER_PAGE_SIZE)));
          setData(res);
          setFailed(false);
        },
        () => { if (!stale) setFailed(true); },
      )
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [page, debouncedQ, source, courseType, courseIds, reload]);

  async function doDelete() {
    if (!delTarget) return;
    try {
      await removeFromNewsletterAction(delTarget);
      toast("Usunięto z listy: " + delTarget);
    } catch {
      toast("Nie udało się usunąć adresu.");
    } finally {
      setDelTarget(null);
      setReload((n) => n + 1);
    }
  }

  const types = useMemo(() => [...new Set(courses.map((c) => c.type).filter(Boolean))].sort(coll.compare), [courses]);
  // The picker offers only courses of the type chosen in the toolbar, if any.
  const pickerCourses = useMemo(() => courses.filter((c) => !courseType || c.type === courseType), [courses, courseType]);
  const courseLabel =
    courseIds.length === 0 ? "Wszystkie kursy"
    : courseIds.length === 1 ? (courses.find((c) => c.id === courseIds[0])?.name ?? "1 kurs")
    : `${courseIds.length} ${plural(courseIds.length, "kurs", "kursy", "kursów")}`;

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / NEWSLETTER_PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * NEWSLETTER_PAGE_SIZE + 1;
  const to = Math.min(page * NEWSLETTER_PAGE_SIZE, total);

  return (
    <div>
      <div className="adm-toolbar">
        <div className="adm-search">
          <span aria-hidden="true">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po e-mailu lub nazwisku…" />
        </div>
        <select
          className="adm-select"
          value={source}
          onChange={(e) => {
            const v = e.target.value as typeof source;
            setSource(v);
            if (v === "widget") { setCourseType(""); setCourseIds([]); }
            setPage(1);
          }}
        >
          <option value="">Wszystkie źródła</option>
          <option value="widget">Widżet newslettera</option>
          <option value="course">Zapisy na kursy</option>
        </select>
        <select
          className="adm-select"
          value={courseType}
          disabled={source === "widget"}
          onChange={(e) => {
            setCourseType(e.target.value);
            setCourseIds([]);
            if (e.target.value) setSource("course");
            setPage(1);
          }}
        >
          <option value="">Wszystkie rodzaje kursów</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className={"adm-pickbtn" + (courseIds.length ? " is-on" : "")}>
          <button type="button" className="adm-select" disabled={source === "widget"} onClick={() => setPicking(true)} title="Wybierz kursy">
            {courseLabel}
          </button>
          {courseIds.length > 0 && (
            <button type="button" className="adm-pickbtn__clear" aria-label="Wyczyść wybór kursów" onClick={() => { setCourseIds([]); setPage(1); }}>×</button>
          )}
        </span>
        <span className="adm-count">
          {total} {plural(total, "wpis", "wpisy", "wpisów")}
          {data && data.uniqueEmails !== total && ` · ${data.uniqueEmails} ${plural(data.uniqueEmails, "unikalny adres", "unikalne adresy", "unikalnych adresów")}`}
        </span>
        <button
          type="button"
          className="adm-btn adm-btn--solid"
          disabled={!data || data.uniqueEmails === 0 || q !== debouncedQ}
          onClick={compose}
          title="Napisz wiadomość do wszystkich osób pasujących do filtrów"
        >
          Wyślij do {data?.uniqueEmails ?? 0} {plural(data?.uniqueEmails ?? 0, "osoby", "osób", "osób")}
        </button>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr><th>E-mail</th><th>Źródło</th><th>Data zgody</th><th className="adm-th-act">Akcje</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={`${e.source}-${e.courseId ?? ""}-${e.email}-${e.createdAt}`}>
                <td className="adm-td-name">
                  {e.email}
                  {e.name && <div className="adm-td-addr">{e.name}</div>}
                </td>
                <td>
                  {e.source === "widget" ? (
                    <span className="adm-statusbadge adm-statusbadge--level">Widżet newslettera</span>
                  ) : (
                    <>
                      <div>{e.courseName}</div>
                      <div className="adm-td-addr">
                        {e.courseType && <>{e.courseType} · </>}
                        {formatCourseDate(e.courseStartsAt ?? "")}
                      </div>
                    </>
                  )}
                </td>
                <td className="adm-td-addr">{formatUtc(e.createdAt)}</td>
                <td className="adm-td-act">
                  <button className="adm-iconbtn adm-iconbtn--danger" title="Usuń z listy" onClick={() => setDelTarget(e.email)}>
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="adm-empty">
                  {loading ? "Wczytywanie…" : failed ? "Nie udało się wczytać listy." : "Brak zapisów dla podanych kryteriów."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="adm-pager" aria-label="Strony">
          <button className="adm-btn adm-btn--ghost" disabled={page <= 1} onClick={() => setPage(1)} aria-label="Pierwsza strona">«</button>
          <button className="adm-btn adm-btn--ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Poprzednia</button>
          <span className="adm-pager__info">
            {from}–{to} z {total} · strona
            <input
              key={page}
              type="number"
              min={1}
              max={pages}
              defaultValue={page}
              aria-label="Numer strony"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const n = Math.min(pages, Math.max(1, Number(e.currentTarget.value) | 0));
                setPage(n);
              }}
            />
            z {pages}
          </span>
          <button className="adm-btn adm-btn--ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Następna ›</button>
          <button className="adm-btn adm-btn--ghost" disabled={page >= pages} onClick={() => setPage(pages)} aria-label="Ostatnia strona">»</button>
        </nav>
      )}

      {picking && (
        <CoursePickerModal
          courses={pickerCourses}
          selected={courseIds}
          onClose={() => setPicking(false)}
          onApply={(ids) => {
            setCourseIds(ids);
            if (ids.length) setSource("course");
            setPage(1);
            setPicking(false);
          }}
        />
      )}

      {delTarget && (
        <Confirm
          title="Usunąć z listy?"
          text={"Adres „" + delTarget + "” zniknie z listy newslettera, razem ze wszystkimi swoimi wpisami. Zgłoszenia na kursy zostają, wycofana zostaje tylko zgoda na oferty. Tej operacji nie można cofnąć."}
          confirmLabel="Usuń"
          onConfirm={doDelete}
          onClose={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}
