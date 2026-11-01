"use client";

// Admin "Newsletter" tab: everyone who agreed to marketing e-mails — sign-ups
// from the newsletter card on the site and course bookings with the marketing
// checkbox ticked — filterable by where they came from.

import { useEffect, useMemo, useState } from "react";
import type { NewsletterEntry } from "@/lib/clauwi/newsletter";
import { getNewsletterAction } from "@/app/admin/actions";

const coll = new Intl.Collator("pl");

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

export function NewsletterTab() {
  const [entries, setEntries] = useState<NewsletterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"" | "widget" | "course">("");
  const [courseType, setCourseType] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    getNewsletterAction().then(setEntries, () => setFailed(true)).finally(() => setLoading(false));
  }, []);

  const types = useMemo(
    () => [...new Set(entries.flatMap((e) => (e.courseType ? [e.courseType] : [])))].sort(coll.compare),
    [entries],
  );
  // Courses offered in the course filter — narrowed by the chosen type.
  const courses = useMemo(() => {
    const byId = new Map<string, NewsletterEntry>();
    for (const e of entries) {
      if (e.source === "course" && e.courseId && (!courseType || e.courseType === courseType)) byId.set(e.courseId, e);
    }
    return [...byId.values()].sort((a, b) => (b.courseStartsAt ?? "").localeCompare(a.courseStartsAt ?? ""));
  }, [entries, courseType]);

  const view = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (source && e.source !== source) return false;
      if (courseType && e.courseType !== courseType) return false;
      if (courseId && e.courseId !== courseId) return false;
      if (qq && !e.email.toLowerCase().includes(qq) && !(e.name ?? "").toLowerCase().includes(qq)) return false;
      return true;
    });
  }, [entries, q, source, courseType, courseId]);

  const uniqueEmails = useMemo(() => new Set(view.map((e) => e.email.toLowerCase())).size, [view]);

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
            if (v === "widget") { setCourseType(""); setCourseId(""); }
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
            setCourseId("");
            if (e.target.value) setSource("course");
          }}
        >
          <option value="">Wszystkie rodzaje kursów</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="adm-select"
          value={courseId}
          disabled={source === "widget"}
          onChange={(e) => {
            setCourseId(e.target.value);
            if (e.target.value) setSource("course");
          }}
        >
          <option value="">Wszystkie kursy</option>
          {courses.map((c) => (
            <option key={c.courseId} value={c.courseId}>
              {c.courseName} ({formatCourseDate(c.courseStartsAt ?? "")})
            </option>
          ))}
        </select>
        <span className="adm-count">
          {view.length} z {entries.length}
          {uniqueEmails !== view.length && ` · ${uniqueEmails} unikalnych adresów`}
        </span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr><th>E-mail</th><th>Źródło</th><th>Data zgody</th></tr>
          </thead>
          <tbody>
            {view.map((e) => (
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
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td colSpan={3} className="adm-empty">
                  {loading ? "Wczytywanie…" : failed ? "Nie udało się wczytać listy." : "Brak zapisów dla podanych kryteriów."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
