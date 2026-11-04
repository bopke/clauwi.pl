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
import {
  getConsentHistoryAction, getNewsletterAction, getNewsletterCoursesAction, getSuppressionsAction, removeFromNewsletterAction, restoreSubscriberAction,
} from "@/app/admin/actions";
import type { SuppressionRow } from "@/lib/clauwi/newsletter-repo";
import { CONSENT_SOURCE_LABELS, type ConsentEntry } from "@/lib/clauwi/consent";
import { CoursePickerModal } from "./CoursePickerModal";
import { ImportModal } from "./ImportModal";
import { NEWSLETTER_FILTERS_KEY } from "./MessageComposer";

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

/** An address's consent log — what it agreed to or withdrew, when, and how. */
function ConsentHistory({ email, onClose }: { email: string; onClose: () => void }) {
  const [entries, setEntries] = useState<ConsentEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    getConsentHistoryAction(email).then(setEntries, () => setFailed(true));
  }, [email]);
  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-sheet adm-consents">
        <div className="adm-sheet__head">
          <h2>Historia zgód: {email}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          {failed ? (
            <p className="adm-empty">Nie udało się wczytać historii.</p>
          ) : !entries ? (
            <p className="adm-empty">Wczytywanie…</p>
          ) : entries.length === 0 ? (
            <p className="adm-empty">Brak wpisów.</p>
          ) : (
            <ol className="adm-consents__list">
              {entries.map((c, i) => (
                <li key={i} className={c.action === "withdrawn" ? "is-withdrawn" : ""}>
                  <div className="adm-consents__head">
                    <b>{c.action === "granted" ? "Zgoda" : "Wycofanie"}</b> · {CONSENT_SOURCE_LABELS[c.source] ?? c.source}
                    <span>{formatUtc(c.createdAt)}</span>
                  </div>
                  {c.wording && <q>{c.wording}</q>}
                  <div className="adm-td-addr">
                    {[c.ref && `dot. ${c.ref}`, c.ip && `IP ${c.ip}`, c.note].filter(Boolean).join(" · ")}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

/** Addresses that unsubscribed, bounced or were removed — and why. */
function SuppressionsList({ toast, onHistory }: { toast: (m: string) => void; onHistory: (email: string) => void }) {
  const [data, setData] = useState<{ rows: SuppressionRow[]; total: number } | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [restoring, setRestoring] = useState<SuppressionRow | null>(null);

  useEffect(() => {
    if (q === debouncedQ) return;
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q, debouncedQ]);

  useEffect(() => {
    let stale = false;
    getSuppressionsAction({ page, q: debouncedQ }).then((res) => { if (!stale) setData(res); }, () => {});
    return () => { stale = true; };
  }, [page, debouncedQ, reload]);

  async function restore() {
    if (!restoring) return;
    try {
      await restoreSubscriberAction(restoring.email);
      toast("Przywrócono: " + restoring.email);
    } catch {
      toast("Nie udało się przywrócić adresu.");
    } finally {
      setRestoring(null);
      setReload((n) => n + 1);
    }
  }

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / NEWSLETTER_PAGE_SIZE));
  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-search">
          <span aria-hidden="true">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj adresu…" />
        </div>
        <span className="adm-count">{total} {plural(total, "adres", "adresy", "adresów")}</span>
      </div>
      <p className="adm-compose__hint">
        Te adresy nie dostaną żadnego newslettera, nawet jeśli znajdą się w imporcie. Wiadomości do uczestników kursów i potwierdzenia zapisów
        dochodzą normalnie. Ponowny zapis przez widżet lub na kurs ze zgodą sam zdejmuje adres z tej listy.
      </p>
      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead><tr><th>E-mail</th><th>Powód</th><th>Od kiedy</th><th className="adm-th-act">Akcje</th></tr></thead>
          <tbody>
            {(data?.rows ?? []).map((r) => (
              <tr key={r.email}>
                <td className="adm-td-name">
                  <button type="button" className="adm-linkbtn" title="Historia zgód" onClick={() => onHistory(r.email)}>{r.email}</button>
                </td>
                <td>{CONSENT_SOURCE_LABELS[r.reason] ?? r.reason}</td>
                <td className="adm-td-addr">{formatUtc(r.createdAt)}</td>
                <td className="adm-td-act">
                  <button className="adm-btn adm-btn--ghost" onClick={() => setRestoring(r)}>Przywróć</button>
                </td>
              </tr>
            ))}
            {data && data.rows.length === 0 && (
              <tr><td colSpan={4} className="adm-empty">{debouncedQ ? "Brak takiego adresu." : "Nikt się jeszcze nie wypisał."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav className="adm-pager" aria-label="Strony">
          <button className="adm-btn adm-btn--ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Poprzednia</button>
          <span className="adm-pager__info">strona {page} z {pages}</span>
          <button className="adm-btn adm-btn--ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Następna ›</button>
        </nav>
      )}
      {restoring && (
        <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setRestoring(null); }}>
          <div className="adm-confirm">
            <h2>Przywrócić na listę?</h2>
            <p>
              Przywracaj adres tylko na wyraźną prośbę tej osoby — np. napisała, że wypisała się przez pomyłkę. Wysyłanie newslettera bez zgody jest
              niezgodne z prawem.
            </p>
            {restoring.reason === "provider-bounce" && (
              <p className="adm-compose__warn">Na ten adres poczta nie dochodziła (odbicie). Przywróć go tylko, jeśli wiesz, że znów działa.</p>
            )}
            {restoring.reason === "provider-spam" && (
              <p className="adm-compose__warn">Ta osoba oznaczyła naszą wiadomość jako spam.</p>
            )}
            <div className="adm-confirm__foot">
              <button className="adm-btn adm-btn--ghost" onClick={() => setRestoring(null)}>Anuluj</button>
              <button className="adm-btn adm-btn--solid" onClick={restore}>Przywróć {restoring.email}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
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
  const [historyOf, setHistoryOf] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [view, setView] = useState<"list" | "suppressed">("list");
  const [exporting, setExporting] = useState(false);
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

  /** Downloads the list as filtered right now. */
  async function exportCsv() {
    setExporting(true);
    try {
      const filters: NewsletterFilters = { q: debouncedQ, source, courseType, courseIds };
      const res = await fetch("/admin/newsletter/eksport", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(filters) });
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? "newsletter.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast("Nie udało się wyeksportować listy.");
    } finally {
      setExporting(false);
    }
  }

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

  const switcher = (
    <div className="adm-seg" role="tablist">
      <button role="tab" aria-selected={view === "list"} className={view === "list" ? "is-on" : ""} onClick={() => setView("list")}>Na liście</button>
      <button role="tab" aria-selected={view === "suppressed"} className={view === "suppressed" ? "is-on" : ""} onClick={() => setView("suppressed")}>
        Wypisani
      </button>
    </div>
  );

  if (view === "suppressed") {
    return (
      <div>
        {switcher}
        <SuppressionsList toast={toast} onHistory={setHistoryOf} />
        {historyOf && <ConsentHistory email={historyOf} onClose={() => setHistoryOf(null)} />}
      </div>
    );
  }

  return (
    <div>
      {switcher}
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
            if (v === "widget" || v === "import") { setCourseType(""); setCourseIds([]); }
            setPage(1);
          }}
        >
          <option value="">Wszystkie źródła</option>
          <option value="widget">Widżet newslettera</option>
          <option value="import">Importy</option>
          <option value="course">Zapisy na kursy</option>
        </select>
        <select
          className="adm-select"
          value={courseType}
          disabled={source === "widget" || source === "import"}
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
          <button type="button" className="adm-select" disabled={source === "widget" || source === "import"} onClick={() => setPicking(true)} title="Wybierz kursy">
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
        <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setImporting(true)}>Importuj…</button>
        <button type="button" className="adm-btn adm-btn--ghost" disabled={exporting || total === 0} onClick={exportCsv} title="Pobierz listę z bieżącymi filtrami jako plik CSV (Excel)">
          {exporting ? "Eksport…" : "Eksport CSV"}
        </button>
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
                  <button type="button" className="adm-linkbtn" title="Historia zgód" onClick={() => setHistoryOf(e.email)}>{e.email}</button>
                  {e.name && <div className="adm-td-addr">{e.name}</div>}
                </td>
                <td>
                  {e.source === "widget" ? (
                    <span className="adm-statusbadge adm-statusbadge--level">Widżet newslettera</span>
                  ) : e.source === "import" ? (
                    <>
                      <span className="adm-statusbadge adm-statusbadge--inactive">Import</span>
                      <div className="adm-td-addr">{e.importLabel}</div>
                    </>
                  ) : e.source === "admin" ? (
                    <span className="adm-statusbadge adm-statusbadge--inactive">Przywrócone w panelu</span>
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

      {importing && <ImportModal onClose={() => setImporting(false)} onImported={() => setReload((n) => n + 1)} />}

      {historyOf && <ConsentHistory email={historyOf} onClose={() => setHistoryOf(null)} />}

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
