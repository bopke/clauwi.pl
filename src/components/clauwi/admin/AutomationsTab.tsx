"use client";

// Admin "Automatyczne" tab: the automatic e-mails, each on or off, with
// when it goes out and how many it sent lately.

import { useEffect, useState } from "react";
import Link from "next/link";
import { AUTOMATION_INFO, AUTOMATION_KEYS, type Automation } from "@/lib/clauwi/automations";
import { getAutomationsAction } from "@/app/admin/actions";

export function AutomationsTab() {
  const [list, setList] = useState<Automation[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    getAutomationsAction().then(setList, () => setFailed(true));
  }, []);

  if (failed) return <p className="adm-empty">Nie udało się wczytać.</p>;
  if (!list) return <p className="adm-empty">Wczytywanie…</p>;
  const byKey = new Map(list.map((a) => [a.key, a]));

  return (
    <div className="adm-auto__grid">
      {AUTOMATION_KEYS.map((key) => {
        const a = byKey.get(key);
        const info = AUTOMATION_INFO[key];
        if (!a) return null;
        return (
          <Link key={key} href={`/admin/automatyczne/${key}`} className={"adm-auto__card" + (a.enabled ? " is-on" : "")}>
            <div className="adm-auto__head">
              <b>{info.name}</b>
              <span className={`adm-mstatus adm-mstatus--${a.enabled ? "sending" : "cancelled"}`}>{a.enabled ? "Włączona" : "Wyłączona"}</span>
            </div>
            <p>Wysyłana {info.when(a.days)}.</p>
            <p className="adm-td-addr">{info.who}</p>
            <p className="adm-auto__foot">
              <span>„{a.subject}”</span>
              {a.enabled && <span>{a.sent30d} w ostatnich 30 dniach</span>}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
