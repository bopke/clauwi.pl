"use client";

// Admin "Wysyłki" tab: every message sent from the panel — newsletter
// mailings and messages to course participants — with how far each got, and
// the daily newsletter limit.

import { useEffect, useState } from "react";
import Link from "next/link";
import { mailingStatusLabel, nowUtcSql, type Mailing } from "@/lib/clauwi/mailings";
import { getMailingsAction, getSendingSettingsAction, setDailyLimitAction } from "@/app/admin/actions";
import { formatUtc } from "./MailingView";

export function MailingsTab({ toast }: { toast: (m: string) => void }) {
  const [mailings, setMailings] = useState<Mailing[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [settings, setSettings] = useState<{ dailyLimit: number; sentLast24h: number } | null>(null);
  const [limit, setLimit] = useState("");

  useEffect(() => {
    getMailingsAction().then(setMailings, () => setFailed(true));
    getSendingSettingsAction().then((s) => { setSettings(s); setLimit(String(s.dailyLimit)); }, () => {});
  }, []);

  async function saveLimit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(limit);
    if (!Number.isFinite(n) || n < 1) return;
    try {
      await setDailyLimitAction(n);
      setSettings((s) => (s ? { ...s, dailyLimit: Math.floor(n) } : s));
      toast("Zapisano dzienny limit.");
    } catch {
      toast("Nie udało się zapisać limitu.");
    }
  }

  const now = nowUtcSql();
  return (
    <div>
      <form className="adm-mailings__limit" onSubmit={saveLimit}>
        <label htmlFor="adm-daily-limit">Dzienny limit wysyłki newslettera:</label>
        <input id="adm-daily-limit" type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} />
        <button type="submit" className="adm-btn adm-btn--ghost" disabled={!settings || Number(limit) === settings.dailyLimit}>Zapisz</button>
        {settings && <span>W ostatniej dobie wysłano {settings.sentLast24h}.</span>}
        <small>
          Duża wysyłka rozkłada się na kolejne dni, a do limitu liczą się też wiadomości do uczestników kursów. Darmowy plan Brevo pozwala na 300
          e-maili dziennie (razem z potwierdzeniami zapisów) — ustaw tu nieco mniej niż limit konta.
        </small>
      </form>

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr><th>Wiadomość</th><th>Do</th><th>Status</th><th>Wysłano</th><th>Data</th></tr>
          </thead>
          <tbody>
            {(mailings ?? []).map((m) => {
              const scheduled = m.status === "sending" && m.sendAfter > now;
              const problems = m.counts.failed + m.counts.bounced + m.counts.complained;
              return (
                <tr key={m.id}>
                  <td className="adm-td-name">
                    <Link href={`/admin/wysylki/${m.id}`} className="adm-rowlink">{m.subject}</Link>
                    <div className="adm-td-addr">{m.kind === "newsletter" ? "Newsletter" : "Wiadomość do uczestników"}</div>
                  </td>
                  <td className="adm-td-addr">{m.audience}</td>
                  <td>
                    <span className={`adm-mstatus adm-mstatus--${scheduled ? "scheduled" : m.status}`}>{mailingStatusLabel(m, now)}</span>
                  </td>
                  <td>
                    {m.counts.sent} / {m.counts.total}
                    {problems > 0 && <div className="adm-td-addr adm-td-warn">{problems} z problemem</div>}
                  </td>
                  <td className="adm-td-addr">{formatUtc(scheduled ? m.sendAfter : m.createdAt)}</td>
                </tr>
              );
            })}
            {(!mailings || mailings.length === 0) && (
              <tr>
                <td colSpan={5} className="adm-empty">
                  {failed ? "Nie udało się wczytać wysyłek." : !mailings ? "Wczytywanie…" : "Nic jeszcze nie wysłano. Wiadomości pisze się z zakładki „Newsletter” albo z listy zgłoszeń kursu."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
