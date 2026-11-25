"use client";

// "Zapytania" tab: the "no course near you?" requests from the public course
// calendar, grouped by town. People who left an e-mail can be sent a notice
// about one course type in their town — written in the message composer
// (/admin/zapytania/wiadomosc), sent like any other mailing.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cityKey, type CourseRequest } from "@/lib/clauwi/courses";
import { deleteCourseRequestsAction, getCourseRequestsAction } from "@/app/admin/actions";
import { Confirm, TrashIcon } from "./CoursesTab";
import { REQUEST_MESSAGE_KEY } from "./MessageComposer";

type RequestGroup = {
  key: string;
  city: string;
  ids: number[];
  /** Course type → how many requests, most asked first. */
  types: [string, number][];
  /** Course type → addresses to notify about it. */
  typeEmails: Record<string, string[]>;
  emails: string[];
  last: string;
};

const isLower = (s: string) => s[0] === s[0]?.toLocaleLowerCase("pl");

function groupRequests(list: CourseRequest[]): RequestGroup[] {
  type Acc = { city: string; ids: number[]; types: Map<string, number>; typeEmails: Map<string, Set<string>>; emails: Set<string>; last: string };
  const groups = new Map<string, Acc>();
  for (const r of list) {
    const key = cityKey(r.city);
    const g: Acc = groups.get(key) ?? { city: r.city.trim(), ids: [], types: new Map(), typeEmails: new Map(), emails: new Set(), last: r.createdAt };
    g.ids.push(r.id);
    // Show a capitalised spelling if anyone typed one.
    if (isLower(g.city) && !isLower(r.city.trim())) g.city = r.city.trim();
    const email = r.email.toLowerCase();
    if (email) g.emails.add(email);
    for (const t of r.types) {
      g.types.set(t, (g.types.get(t) ?? 0) + 1);
      if (email) g.typeEmails.set(t, (g.typeEmails.get(t) ?? new Set()).add(email));
    }
    if (r.createdAt > g.last) g.last = r.createdAt;
    groups.set(key, g);
  }
  return [...groups]
    .map(([key, g]) => ({
      key,
      city: g.city,
      ids: g.ids,
      types: [...g.types].sort((a, b) => b[1] - a[1]),
      typeEmails: Object.fromEntries([...g.typeEmails].map(([t, e]) => [t, [...e]])),
      emails: [...g.emails],
      last: g.last,
    }))
    .sort((a, b) => b.ids.length - a.ids.length || b.last.localeCompare(a.last));
}

function plural(n: number, one: string, few: string, many: string): string {
  const d = n % 10, dd = n % 100;
  return n === 1 ? one : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
}

/** Pick which course type the notice is about, then on to the composer. */
function NotifyModal({ group, onClose }: { group: RequestGroup; onClose: () => void }) {
  const options = group.types.filter(([t]) => group.typeEmails[t]?.length);
  const [type, setType] = useState(options[0]?.[0] ?? "");
  const router = useRouter();
  const n = group.typeEmails[type]?.length ?? 0;

  function next() {
    try {
      sessionStorage.setItem(REQUEST_MESSAGE_KEY, JSON.stringify({ city: group.city, type }));
    } catch {}
    router.push("/admin/zapytania/wiadomosc");
  }

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-confirm">
        <h2>Powiadom: {group.city}</h2>
        <p>O jakim kursie chcesz napisać? Wiadomość dostaną osoby, które pytały o ten kurs w tej miejscowości i zgodziły się na kontakt.</p>
        <div className="adm-statuspick adm-requests__pick">
          {options.map(([t]) => (
            <label key={t} className={"adm-statuspick__opt" + (type === t ? " is-on" : "")}>
              <input type="radio" name="notify-type" checked={type === t} onChange={() => setType(t)} />
              {t} <span className="adm-card__n">{group.typeEmails[t].length}</span>
            </label>
          ))}
        </div>
        <div className="adm-confirm__foot">
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button className="adm-btn adm-btn--solid" disabled={!type} onClick={next}>
            Napisz do {n} {plural(n, "osoby", "osób", "osób")} →
          </button>
        </div>
      </div>
    </div>
  );
}

export function RequestsTab({ toast, onCountChange }: { toast: (m: string) => void; onCountChange?: (n: number) => void }) {
  const [list, setList] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [notify, setNotify] = useState<RequestGroup | null>(null);
  const [delTarget, setDelTarget] = useState<RequestGroup | null>(null);

  const refresh = useCallback(async () => {
    try {
      const fresh = await getCourseRequestsAction();
      setList(fresh);
      onCountChange?.(fresh.length);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);
  useEffect(() => { refresh(); }, [refresh]);

  const groups = useMemo(() => groupRequests(list), [list]);
  const view = useMemo(() => {
    const needle = cityKey(q);
    return needle ? groups.filter((g) => g.key.includes(needle)) : groups;
  }, [groups, q]);
  const withEmail = useMemo(() => new Set(list.filter((r) => r.email).map((r) => r.email.toLowerCase())).size, [list]);

  const toggle = (key: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  async function copyEmails(g: RequestGroup) {
    try {
      await navigator.clipboard.writeText(g.emails.join(", "));
      toast(`Skopiowano ${g.emails.length === 1 ? "adres" : "adresy"}: ${g.city}`);
    } catch {
      toast("Nie udało się skopiować");
    }
  }

  async function doDelete() {
    if (!delTarget) return;
    try {
      await deleteCourseRequestsAction(delTarget.ids);
      toast("Usunięto zapytania");
    } catch {
      toast("Nie udało się usunąć");
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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj miejscowości…" />
        </div>
        <span className="adm-count">
          {list.length} {plural(list.length, "zapytanie", "zapytania", "zapytań")} · {groups.length} {plural(groups.length, "miejscowość", "miejscowości", "miejscowości")} · {withEmail} {plural(withEmail, "osoba", "osoby", "osób")} do powiadomienia
        </span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table adm-requests">
          <thead>
            <tr><th>Miejscowość</th><th>Zapytań</th><th>Kursy</th><th>Do powiadomienia</th><th>Ostatnie</th><th className="adm-th-act">Akcje</th></tr>
          </thead>
          <tbody>
            {view.map((g) => (
              <tr key={g.key}>
                <td className="adm-td-name">{g.city}</td>
                <td>{g.ids.length}</td>
                <td>
                  {g.types.map(([t, n]) => (
                    <span key={t} className="adm-statusbadge adm-statusbadge--level adm-requests__type">{t}{n > 1 && ` ×${n}`}</span>
                  ))}
                </td>
                <td className="adm-td-addr">
                  {g.emails.length === 0 ? (
                    <span className="adm-requests__none">—</span>
                  ) : (
                    <>
                      <button type="button" className="adm-linkbtn" aria-expanded={open.has(g.key)} onClick={() => toggle(g.key)}>
                        {g.emails.length} {plural(g.emails.length, "adres", "adresy", "adresów")} {open.has(g.key) ? "▴" : "▾"}
                      </button>
                      {open.has(g.key) && (
                        <div className="adm-requests__emails">
                          {g.emails.map((e) => <div key={e}>{e}</div>)}
                          <button type="button" className="adm-linkbtn" onClick={() => copyEmails(g)}>Kopiuj adresy</button>
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className="adm-nowrap">{g.last.slice(0, 10)}</td>
                <td className="adm-td-act">
                  <button
                    className="adm-btn adm-btn--ghost adm-btn--sm"
                    disabled={g.emails.length === 0}
                    title={g.emails.length ? "Wyślij powiadomienie o kursie osobom z tej miejscowości" : "Nikt stąd nie podał adresu e-mail"}
                    onClick={() => setNotify(g)}
                  >
                    Powiadom…
                  </button>
                  <button className="adm-iconbtn adm-iconbtn--danger" title="Usuń zapytania z tej miejscowości" aria-label={`Usuń zapytania: ${g.city}`} onClick={() => setDelTarget(g)}>
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr><td colSpan={6} className="adm-empty">{loading ? "Wczytywanie…" : q ? "Brak zapytań z tej miejscowości." : "Brak zapytań."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {notify && <NotifyModal group={notify} onClose={() => setNotify(null)} />}
      {delTarget && (
        <Confirm
          title="Usunąć zapytania?"
          text={`Usunąć ${delTarget.ids.length === 1 ? "zapytanie" : `${delTarget.ids.length} zapytań`} z miejscowości „${delTarget.city}”, razem z adresami e-mail? Tej operacji nie można cofnąć.`}
          confirmLabel="Usuń"
          onConfirm={doDelete}
          onClose={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}
