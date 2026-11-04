"use client";

// One mailing's page (/admin/wysylki/<id>): progress, controls, the e-mail
// itself and every recipient with their status.
//
// While the page is open it also does the sending — chunk after chunk, so a
// course message goes out in seconds. Close it and the cron carries on
// (every few minutes), which is what spreads a big newsletter mailing over
// several days within the daily limit.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MAILING_RECIPIENTS_PAGE, mailingStatusLabel, nowUtcSql, RECIPIENT_STATUS_LABELS,
  type Mailing, type MailingRecipientRow, type RecipientStatus,
} from "@/lib/clauwi/mailings";
import {
  getMailingAction, getMailingPreviewAction, getMailingRecipientsAction, mailingControlAction, processMailingAction,
} from "@/app/admin/actions";
import "./admin.css";

/** "2026-11-01 14:05:00" (UTC, as SQLite stores it) → local date and time. */
export function formatUtc(sql: string): string {
  if (!sql) return "";
  const d = new Date(sql.replace(" ", "T") + "Z");
  return isNaN(+d) ? sql : d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

function plural(n: number, one: string, few: string, many: string): string {
  const d = n % 10, dd = n % 100;
  return n === 1 ? one : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
}

const STATUS_ORDER: RecipientStatus[] = ["sent", "queued", "sending", "failed", "skipped", "bounced", "complained"];

export function MailingView({ id }: { id: string }) {
  const [mailing, setMailing] = useState<Mailing | null>(null);
  const [missing, setMissing] = useState(false);
  const [preview, setPreview] = useState<{ html: string; subject: string; email: string } | null>(null);
  // Why this tab isn't sending right now (daily limit reached, scheduled…).
  const [waiting, setWaiting] = useState<"" | "scheduled" | "limit" | "stopped">("");
  const [sendError, setSendError] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  const [rows, setRows] = useState<{ rows: MailingRecipientRow[]; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RecipientStatus | "">("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const refresh = useCallback(async () => {
    const m = await getMailingAction(id);
    if (m) setMailing(m);
    else setMissing(true);
    return m;
  }, [id]);

  useEffect(() => {
    getMailingPreviewAction(id).then(setPreview, () => {});
  }, [id]);

  // The sending loop: while the mailing is due, send chunk after chunk; when
  // it can't (limit, scheduled, paused), look again in a while.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    let timer: ReturnType<typeof setTimeout>;
    async function step() {
      if (!alive.current) return;
      let delay = 15000;
      try {
        const m = await refresh();
        if (m && m.status === "sending" && m.sendAfter <= nowUtcSql()) {
          const res = await processMailingAction(id);
          setWaiting(res.waiting);
          setSendError(false);
          if (res.processed > 0) delay = 300;
          if (res.waiting === "limit") delay = 60000;
          await refresh();
        } else {
          setWaiting(m?.status === "sending" ? "scheduled" : "");
        }
      } catch {
        setSendError(true);
        delay = 10000;
      }
      if (alive.current) timer = setTimeout(step, delay);
    }
    step();
    return () => {
      alive.current = false;
      clearTimeout(timer);
    };
  }, [id, refresh]);

  useEffect(() => {
    if (q === debouncedQ) return;
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q, debouncedQ]);

  // Recipients list follows the progress: refetched whenever the counts move.
  const countsKey = mailing ? JSON.stringify(mailing.counts) : "";
  useEffect(() => {
    let stale = false;
    getMailingRecipientsAction(id, { page, status: statusFilter, q: debouncedQ }).then(
      (res) => { if (!stale) setRows(res); },
      () => {},
    );
    return () => { stale = true; };
  }, [id, page, statusFilter, debouncedQ, countsKey]);

  async function control(action: "pause" | "resume" | "cancel" | "retry") {
    setBusy(true);
    try {
      await mailingControlAction(id, action);
      await refresh();
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  }

  const backHref = "/admin?tab=wysylki";
  if (missing) {
    return (
      <div className="adm-root">
        <main className="adm-main">
          <p className="adm-empty">Nie znaleziono wysyłki. <Link href={backHref}>Wróć do listy wysyłek</Link>.</p>
        </main>
      </div>
    );
  }
  if (!mailing) return <div className="adm-root"><main className="adm-main"><p className="adm-empty">Wczytywanie…</p></main></div>;

  const c = mailing.counts;
  const finished = c.sent + c.failed + c.skipped + c.bounced + c.complained;
  const pct = c.total ? Math.round((finished / c.total) * 100) : 0;
  const now = nowUtcSql();
  const scheduled = mailing.status === "sending" && mailing.sendAfter > now;
  const pages = Math.max(1, Math.ceil((rows?.total ?? 0) / MAILING_RECIPIENTS_PAGE));

  return (
    <div className="adm-root">
      <header className="adm-top">
        <Link href={backHref} className="adm-btn adm-btn--ghost">← Wysyłki</Link>
        <div className="adm-compose__to">
          <b>{mailing.subject}</b>
          <span>
            {mailing.kind === "newsletter" ? "Newsletter" : "Wiadomość do uczestników"} · {mailing.audience} · {c.total}{" "}
            {plural(c.total, "odbiorca", "odbiorców", "odbiorców")}
          </span>
        </div>
        {mailing.status === "sending" && (
          <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => control("pause")}>Wstrzymaj</button>
        )}
        {mailing.status === "paused" && (
          <button className="adm-btn adm-btn--solid" disabled={busy} onClick={() => control("resume")}>Wznów wysyłkę</button>
        )}
        {(mailing.status === "sending" || mailing.status === "paused") && (
          <button className="adm-btn adm-btn--ghost adm-btn--dangertext" disabled={busy} onClick={() => setConfirmCancel(true)}>Anuluj</button>
        )}
        {c.failed > 0 && mailing.status !== "cancelled" && (
          <button className="adm-btn adm-btn--solid" disabled={busy} onClick={() => control("retry")}>
            Ponów dla nieudanych ({c.failed})
          </button>
        )}
      </header>

      <main className="adm-main adm-mailing">
        <section className="adm-mailing__status">
          <div className="adm-mailing__line">
            <span className={`adm-mstatus adm-mstatus--${scheduled ? "scheduled" : mailing.status}`}>{mailingStatusLabel(mailing, now)}</span>
            <span>
              {scheduled
                ? <>Start: {formatUtc(mailing.sendAfter)}</>
                : mailing.finishedAt
                  ? <>Zakończona {formatUtc(mailing.finishedAt)}</>
                  : <>Rozpoczęta {formatUtc(mailing.sendAfter)}</>}
              {" · "}utworzona {formatUtc(mailing.createdAt)}{mailing.createdBy && <> przez {mailing.createdBy}</>}
            </span>
            <span className="adm-mailing__campaign" title="Linki do strony w tej wiadomości mają ten znacznik — w Google Analytics (Pozyskanie → Kampanie) widać, ile wejść i zapisów przyniosła.">
              Kampania w Analytics: <code>{mailing.campaign}</code>
            </span>
          </div>
          <div className="adm-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${pct}%` }} />
          </div>
          <div className="adm-mailing__counts">
            {STATUS_ORDER.filter((s) => c[s] > 0).map((s) => (
              <button
                key={s}
                type="button"
                className={`adm-chip adm-chip--${s}` + (statusFilter === s ? " is-on" : "")}
                onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
              >
                {RECIPIENT_STATUS_LABELS[s]}: <b>{c[s]}</b>
              </button>
            ))}
          </div>
          {mailing.pauseReason && <p className="adm-compose__warn">Wysyłka zatrzymała się sama: {mailing.pauseReason}</p>}
          {mailing.status === "sending" && !scheduled && waiting === "limit" && (
            <p className="adm-compose__hint">
              Osiągnięto dzienny limit wysyłki — kolejne wiadomości wyjdą automatycznie, gdy limit się odnowi (także po zamknięciu tej strony).
            </p>
          )}
          {mailing.status === "sending" && !scheduled && waiting === "" && c.queued + c.sending > 0 && (
            <p className="adm-compose__hint">Wysyłanie… Możesz zamknąć tę stronę — reszta wyśle się sama w ciągu kilkunastu minut.</p>
          )}
          {sendError && <p className="adm-compose__warn">Problem z połączeniem — ponawiam…</p>}
        </section>

        <div className="adm-mailing__grid">
          <section className="adm-mailing__recipients">
            <div className="adm-toolbar">
              <div className="adm-search">
                <span aria-hidden="true">⌕</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj adresu…" />
              </div>
              <select className="adm-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as RecipientStatus | ""); setPage(1); }}>
                <option value="">Wszystkie statusy</option>
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{RECIPIENT_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="adm-tablewrap">
              <table className="adm-table">
                <thead>
                  <tr><th>Odbiorca</th><th>Status</th><th>Kiedy</th></tr>
                </thead>
                <tbody>
                  {(rows?.rows ?? []).map((r) => (
                    <tr key={r.email}>
                      <td className="adm-td-name">
                        {r.email}
                        {r.name && <div className="adm-td-addr">{r.name}</div>}
                      </td>
                      <td>
                        <span className={`adm-chip adm-chip--${r.status}`}>{RECIPIENT_STATUS_LABELS[r.status]}</span>
                        {r.error && <div className="adm-td-addr">{r.error}</div>}
                      </td>
                      <td className="adm-td-addr">{r.status === "queued" ? "" : formatUtc(r.updatedAt)}</td>
                    </tr>
                  ))}
                  {rows && rows.rows.length === 0 && (
                    <tr><td colSpan={3} className="adm-empty">Brak odbiorców dla podanych kryteriów.</td></tr>
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
          </section>

          <section className="adm-compose__preview adm-mailing__preview">
            <div className="adm-compose__pvhead">
              <div className="adm-compose__who">
                {preview ? <>Wiadomość tak, jak dostał(a) ją <b>{preview.email}</b></> : "Wczytywanie…"}
              </div>
            </div>
            <div className="adm-compose__subject"><span>Temat:</span> {preview?.subject}</div>
            {preview && <iframe className="adm-compose__frame" title="Wysłana wiadomość" srcDoc={preview.html} sandbox="" />}
          </section>
        </div>
      </main>

      {confirmCancel && (
        <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmCancel(false); }}>
          <div className="adm-confirm">
            <h2>Anulować wysyłkę?</h2>
            <p>
              {c.queued} {plural(c.queued, "osoba", "osoby", "osób")} jeszcze jej nie {plural(c.queued, "dostała", "dostały", "dostało")} — i już nie dostanie.
              Wysłanych wiadomości nie da się cofnąć. Jeśli chcesz tylko przerwać na chwilę, użyj „Wstrzymaj”.
            </p>
            <div className="adm-confirm__foot">
              <button className="adm-btn adm-btn--ghost" onClick={() => setConfirmCancel(false)}>Nie</button>
              <button className="adm-btn adm-btn--danger" disabled={busy} onClick={() => control("cancel")}>Anuluj wysyłkę</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
