"use client";

// ClauWi® admin panel — architecture copied 1:1 from the specjalisci-easybaby
// panel (Google sign-in via Auth.js, allowlist in D1, CRUD through server
// actions), but the advisor fields are ClauWi's OWN (see
// src/lib/clauwi/advisors.ts): one full name, one level, one region, no photo
// — none of easybaby's multi-status, multi-region or photo upload.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdvisorUtil, LEVEL_SUGGESTIONS, REGION_META, validUntilDate, websiteItems } from "@/lib/clauwi/advisors";
import type { Advisor, AllowEntry } from "@/lib/clauwi/advisors";
import {
  addAllowAction, bulkDeleteAdvisorsAction, bulkUpdateAdvisorsAction, createAdvisorAction, deleteAdvisorAction, getAdvisorsAdminAction,
  getAllowlistAction, removeAllowAction, signOutAction, updateAdvisorAction, getUnseenBookingCountsAction,
} from "@/app/admin/actions";
import { CoursesTab } from "./CoursesTab";
import { NewsletterTab } from "./NewsletterTab";
import { MailingsTab } from "./MailingsTab";
import { AutomationsTab } from "./AutomationsTab";
import "./admin.css";

const coll = new Intl.Collator("pl");
const regionName = (slug: string) => AdvisorUtil.regionName(slug);

type AdvisorDraft = Omit<Advisor, "id"> & { id?: string };
type Editing = Advisor | "new" | null;
type AdminUser = { email: string; name: string | null; image: string | null };

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ====== Formularz doradcy (modal) ======
const EMPTY: AdvisorDraft = {
  name: "", level: "", region: REGION_META[0].slug, locality: "",
  email: "", phone: "", website: "", services: "", certificationValidUntil: "", notes: "", active: true,
};

function AdvisorForm({ initial, onSave, onClose }: { initial: Advisor | null; onSave: (data: AdvisorDraft) => void; onClose: () => void }) {
  const [f, setF] = useState<AdvisorDraft>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [err, setErr] = useState<Record<string, number>>({});
  const firstRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  function set<K extends keyof AdvisorDraft>(k: K, v: AdvisorDraft[K]) { setF((s) => ({ ...s, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, number> = {};
    if (!f.name.trim()) er.name = 1;
    if (!f.region) er.region = 1;
    if (!f.locality.trim()) er.locality = 1;
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ ...f });
  }

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="adm-sheet" onSubmit={submit}>
        <div className="adm-sheet__head">
          <h2>{initial ? "Edytuj doradcę" : "Nowy doradca"}</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          <label className={"adm-f" + (err.name ? " is-err" : "")}>
            <span>Imię i nazwisko</span>
            <input ref={firstRef} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="np. Anna Kowalska" />
          </label>

          <div className="adm-f">
            <span>Poziom <small>(kliknij podpowiedź lub wpisz własną wartość)</small></span>
            <div className="adm-statuspick">
              {LEVEL_SUGGESTIONS.map((p) => (
                <label key={p} className={"adm-statuspick__opt" + (f.level === p ? " is-on" : "")}>
                  <input type="radio" name="level" checked={f.level === p} onChange={() => set("level", p)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
            <input value={f.level} onChange={(e) => set("level", e.target.value)} placeholder="np. Kurs podstawowy, Certyfikat, lub nazwa kraju dla zagranicy" style={{ marginTop: 8 }} />
          </div>

          <div className="adm-grid2">
            <label className={"adm-f" + (err.region ? " is-err" : "")}>
              <span>Województwo</span>
              <select value={f.region} onChange={(e) => set("region", e.target.value)}>
                {REGION_META.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
              </select>
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
              <span>Aktywny <small>(widoczny na publicznej liście)</small></span>
            </label>
          </div>

          <label className={"adm-f" + (err.locality ? " is-err" : "")}>
            <span>Miejscowość / obszar działania</span>
            <input value={f.locality} onChange={(e) => set("locality", e.target.value)} placeholder="np. Kraków i okolice, Gdów, Wieliczka" />
          </label>

          <div className="adm-grid2">
            <label className="adm-f">
              <span>E-mail <small>(opcjonalnie)</small></span>
              <input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="np. anna@przyklad.pl" />
            </label>
            <label className="adm-f">
              <span>Telefon <small>(opcjonalnie)</small></span>
              <input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="np. 500 100 200" />
            </label>
          </div>

          <label className="adm-f">
            <span>Strona WWW <small>(opcjonalnie — adres strony lub np. „Fb: nazwa profilu”; kilka adresów: każdy w osobnej linii)</small></span>
            <textarea rows={2} value={f.website} onChange={(e) => set("website", e.target.value)} placeholder={"np. www.annakowalska.pl\nfacebook.com/annakowalska"} />
          </label>

          <label className="adm-f">
            <span>Oferta dodatkowa <small>(opcjonalnie)</small></span>
            <input value={f.services} onChange={(e) => set("services", e.target.value)} placeholder="np. Szkolenia indywidualne i grupowe, sklep, wypożyczalnia" />
          </label>

          <div className="adm-grid2">
            <label className="adm-f">
              <span>Ważność uprawnień <small>(opcjonalnie)</small></span>
              <input value={f.certificationValidUntil} onChange={(e) => set("certificationValidUntil", e.target.value)} placeholder="np. 2027-05-01" />
            </label>
            <label className="adm-f">
              <span>Uwagi <small>(wewnętrzne, niepubliczne)</small></span>
              <input value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="notatka dla administratora" />
            </label>
          </div>
        </div>
        <div className="adm-sheet__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button type="submit" className="adm-btn adm-btn--solid">{initial ? "Zapisz zmiany" : "Dodaj doradcę"}</button>
        </div>
      </form>
    </div>
  );
}

// ====== Potwierdzenie ======
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

// ====== Tab: advisors ======
type AdvisorSort = "name" | "valid-asc" | "valid-desc";
const SOON_DAYS = 60;

function todayIso(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function ValidityBadge({ text }: { text: string }) {
  const date = validUntilDate(text);
  if (!date) return null;
  const today = todayIso();
  if (date < today) return <span className="adm-statusbadge adm-statusbadge--expired">wygasła</span>;
  if (date <= addDays(today, SOON_DAYS)) return <span className="adm-statusbadge adm-statusbadge--soon">wygasa wkrótce</span>;
  return null;
}

/** Sets one "Ważność uprawnień" for all selected advisors. */
function BulkValidityForm({ count, onSave, onClose }: { count: number; onSave: (value: string) => void; onClose: () => void }) {
  const [value, setValue] = useState("");
  const parsed = value.trim() ? validUntilDate(value) : null;
  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="adm-confirm" onSubmit={(e) => { e.preventDefault(); onSave(value.trim()); }}>
        <h2>Ustaw ważność uprawnień</h2>
        <p>Nowa wartość zastąpi obecną u {count} {count === 1 ? "zaznaczonego doradcy" : "zaznaczonych doradców"}. Puste pole usuwa datę.</p>
        <label className="adm-f">
          <span>Ważność uprawnień</span>
          <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="np. 2027-05-01" />
        </label>
        {value.trim() && !parsed && <p className="adm-compose__hint">To nie wygląda na datę — zostanie zapisane jako tekst i nie będzie brane pod uwagę przy sortowaniu.</p>}
        <div className="adm-confirm__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Anuluj</button>
          <button type="submit" className="adm-btn adm-btn--solid">Zapisz</button>
        </div>
      </form>
    </div>
  );
}

function AdvisorsTab({ toast }: { toast: (m: string) => void }) {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [sort, setSort] = useState<AdvisorSort>("name");
  const [editing, setEditing] = useState<Editing>(null);
  const [delTarget, setDelTarget] = useState<Advisor | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<"validity" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try { setAdvisors(await getAdvisorsAdminAction()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const view = useMemo(() => {
    let arr = advisors.slice();
    const qq = q.trim().toLowerCase();
    if (qq) arr = arr.filter((a) => a.name.toLowerCase().includes(qq) || a.locality.toLowerCase().includes(qq));
    if (region) arr = arr.filter((a) => a.region === region);
    if (sort === "name") {
      arr.sort((x, y) => coll.compare(x.name, y.name));
    } else {
      // Advisors without a readable date go last either way.
      const dir = sort === "valid-asc" ? 1 : -1;
      const keyed = arr.map((a) => ({ a, d: validUntilDate(a.certificationValidUntil) }));
      keyed.sort((x, y) => {
        if (x.d && y.d) return x.d === y.d ? coll.compare(x.a.name, y.a.name) : (x.d < y.d ? -dir : dir);
        if (x.d || y.d) return x.d ? -1 : 1;
        return coll.compare(x.a.name, y.a.name);
      });
      arr = keyed.map((k) => k.a);
    }
    return arr;
  }, [advisors, q, region, sort]);

  // Only advisors that still exist count as picked.
  const pickedIds = useMemo(() => advisors.filter((a) => picked.has(a.id)).map((a) => a.id), [advisors, picked]);
  const hiddenPicked = pickedIds.length - view.filter((a) => picked.has(a.id)).length;
  const allVisiblePicked = view.length > 0 && view.every((a) => picked.has(a.id));

  function togglePick(id: string) {
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function toggleAllVisible() {
    setPicked((s) => {
      const n = new Set(s);
      if (allVisiblePicked) view.forEach((a) => n.delete(a.id)); else view.forEach((a) => n.add(a.id));
      return n;
    });
  }

  async function save(data: AdvisorDraft) {
    try {
      if (editing && editing !== "new") {
        await updateAdvisorAction({ ...editing, ...data, id: editing.id });
        toast("Zapisano zmiany dla " + data.name);
      } else {
        await createAdvisorAction(data);
        toast("Dodano doradcę: " + data.name);
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
      await deleteAdvisorAction(delTarget.id);
      toast("Usunięto: " + delTarget.name);
    } catch {
      toast("Nie udało się usunąć doradcy.");
    } finally {
      setDelTarget(null);
      await refresh();
    }
  }

  async function runBulk(label: string, fn: () => Promise<void>, clear = false) {
    setBusy(true);
    try {
      await fn();
      toast(label);
      if (clear) setPicked(new Set());
    } catch {
      toast("Nie udało się wykonać operacji.");
    } finally {
      setBusy(false);
      setBulk(null);
      await refresh();
    }
  }
  const n = pickedIds.length;
  // Masculine-personal plural: "1 doradcę", but "2 / 5 / 22 doradców".
  const nWord = (k: number) => (k === 1 ? "doradcę" : "doradców");

  return (
    <div>
      <div className="adm-toolbar">
        <div className="adm-search">
          <span aria-hidden="true">⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po nazwisku lub miejscowości…" />
        </div>
        <select className="adm-select" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Wszystkie województwa</option>
          {REGION_META.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
        </select>
        <select className="adm-select" value={sort} onChange={(e) => setSort(e.target.value as AdvisorSort)} aria-label="Sortowanie">
          <option value="name">Sortuj: nazwisko A–Z</option>
          <option value="valid-asc">Sortuj: ważność — najwcześniej wygasające</option>
          <option value="valid-desc">Sortuj: ważność — najpóźniej wygasające</option>
        </select>
        <span className="adm-count">{view.length} z {advisors.length}</span>
        <button className="adm-btn adm-btn--solid" onClick={() => setEditing("new")}>+ Dodaj doradcę</button>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table adm-advtable">
          <thead>
            <tr>
              <th className="adm-td-check">
                <label>
                  <input type="checkbox" checked={allVisiblePicked} onChange={toggleAllVisible} disabled={view.length === 0} aria-label="Zaznacz wszystkich widocznych" />
                  <span className="adm-advtable__all">Zaznacz wszystkich widocznych</span>
                </label>
              </th>
              <th>Doradca</th><th>Poziom</th><th>Województwo / miejscowość</th><th>Kontakt</th><th>Ważność / uwagi</th><th className="adm-th-act">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {view.map((a) => (
              <tr key={a.id} className={picked.has(a.id) ? "is-picked" : undefined}>
                <td className="adm-td-check">
                  <input type="checkbox" checked={picked.has(a.id)} onChange={() => togglePick(a.id)} aria-label={"Zaznacz: " + a.name} />
                </td>
                <td className="adm-td-name">
                  <span className="adm-name-cell">
                    {a.name}
                    {a.active && <span className="adm-tick" title="Aktywny"><svg viewBox="0 0 24 24" width="15" height="15"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
                  </span>
                  {!a.active && <div><span className="adm-statusbadge adm-statusbadge--inactive">nieaktywny</span></div>}
                </td>
                <td className="adm-td-level">{a.level && <span className="adm-statusbadge adm-statusbadge--level">{a.level}</span>}</td>
                <td className="adm-td-regions">
                  <span className="adm-regchip"><b>{regionName(a.region)}</b>{a.locality ? ": " + a.locality : ""}</span>
                </td>
                <td className="adm-td-addr">
                  {a.email && <div>{a.email}</div>}
                  {a.phone && <div>{a.phone}</div>}
                  {websiteItems(a.website).map((w, i) => (
                    <div key={i}>{w.href ? <a href={w.href} title={w.title} target="_blank" rel="noopener" className="adm-link">{w.text}</a> : w.text}</div>
                  ))}
                </td>
                <td className="adm-td-addr adm-td-valid">
                  {a.certificationValidUntil && <div>Ważność: {a.certificationValidUntil} <ValidityBadge text={a.certificationValidUntil} /></div>}
                  {a.notes && <div>{a.notes}</div>}
                </td>
                <td className="adm-td-act">
                  <button className="adm-iconbtn" title="Edytuj" aria-label={"Edytuj: " + a.name} onClick={() => setEditing(a)}>
                    <svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 20h4l10-10-4-4L4 16v4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" /></svg>
                  </button>
                  <button className="adm-iconbtn adm-iconbtn--danger" title="Usuń" aria-label={"Usuń: " + a.name} onClick={() => setDelTarget(a)}>
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr><td colSpan={7} className="adm-empty">{loading ? "Wczytywanie…" : "Brak doradców dla podanych kryteriów."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {n > 0 && (
        <div className="adm-bulkbar" role="region" aria-label="Akcje dla zaznaczonych">
          <span className="adm-bulkbar__count">
            Zaznaczono: <b>{n}</b>
            {hiddenPicked > 0 && <small> (w tym {hiddenPicked} ukrytych przez filtr)</small>}
          </span>
          <div className="adm-bulkbar__actions">
            <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => runBulk(`Aktywowano ${n} ${nWord(n)}.`, () => bulkUpdateAdvisorsAction(pickedIds, { active: true }))}>Aktywuj</button>
            <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => runBulk(`Dezaktywowano ${n} ${nWord(n)}.`, () => bulkUpdateAdvisorsAction(pickedIds, { active: false }))}>Dezaktywuj</button>
            <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => setBulk("validity")}>Ustaw ważność…</button>
            <button className="adm-btn adm-btn--danger" disabled={busy} onClick={() => setBulk("delete")}>Usuń…</button>
            <button className="adm-linkbtn" disabled={busy} onClick={() => setPicked(new Set())}>Odznacz</button>
          </div>
        </div>
      )}

      {editing && <AdvisorForm initial={editing === "new" ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
      {delTarget && (
        <Confirm
          title="Usunąć doradcę?"
          text={"Czy na pewno usunąć „" + delTarget.name + "”? Tej operacji nie można cofnąć."}
          confirmLabel="Usuń"
          onConfirm={doDelete}
          onClose={() => setDelTarget(null)}
        />
      )}
      {bulk === "validity" && (
        <BulkValidityForm
          count={n}
          onSave={(value) => runBulk(`Zapisano ważność u ${n} ${nWord(n)}.`, () => bulkUpdateAdvisorsAction(pickedIds, { certificationValidUntil: value }))}
          onClose={() => setBulk(null)}
        />
      )}
      {bulk === "delete" && (
        <Confirm
          title={`Usunąć ${n} ${nWord(n)}?`}
          text={`Zaznaczeni doradcy (${n}) zostaną trwale usunięci${hiddenPicked > 0 ? `, w tym ${hiddenPicked} niewidocznych teraz przez filtr` : ""}. Tej operacji nie można cofnąć. Jeśli chcesz ich tylko ukryć z publicznej listy, użyj „Dezaktywuj”.`}
          confirmLabel={`Usuń (${n})`}
          onConfirm={() => runBulk(`Usunięto ${n} ${nWord(n)}.`, () => bulkDeleteAdvisorsAction(pickedIds), true)}
          onClose={() => setBulk(null)}
        />
      )}
    </div>
  );
}

// ====== Tab: access (allowlist in D1) ======
function AccessTab({ currentEmail, toast }: { currentEmail: string; toast: (m: string) => void }) {
  const [list, setList] = useState<AllowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [delTarget, setDelTarget] = useState<AllowEntry | null>(null);

  useEffect(() => {
    getAllowlistAction().then((l) => { setList(l); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setErr("Podaj poprawny adres e-mail."); return; }
    if (list.some((x) => x.email.toLowerCase() === em)) { setErr("Ten adres jest już na liście."); return; }
    setErr(""); setBusy(true);
    try {
      setList(await addAllowAction(em));
      toast("Dodano dostęp: " + em);
      setEmail("");
    } catch { setErr("Nie udało się dodać adresu."); } finally { setBusy(false); }
  }
  async function remove() {
    if (!delTarget) return;
    setBusy(true);
    try {
      setList(await removeAllowAction(delTarget.email));
      toast("Cofnięto dostęp: " + delTarget.email);
    } catch { toast("Nie udało się cofnąć dostępu."); } finally { setBusy(false); setDelTarget(null); }
  }

  return (
    <div>
      <div className="adm-access">
        <div className="adm-card">
          <h3 className="adm-card__title">Dodaj autoryzowany adres</h3>
          <p className="adm-card__sub">Tylko konta Google z tej listy mogą zalogować się do panelu.</p>
          <form className="adm-addform" onSubmit={add}>
            <label className="adm-f">
              <span>Adres e-mail (Google)</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="osoba@example.com" />
            </label>
            {err && <div className="adm-inlineerr">{err}</div>}
            <button type="submit" className="adm-btn adm-btn--solid" disabled={busy}>+ Nadaj dostęp</button>
          </form>
        </div>

        <div className="adm-card">
          <h3 className="adm-card__title">Autoryzowane adresy <span className="adm-card__n">{list.length}</span></h3>
          {loading ? (
            <p className="adm-card__sub">Wczytywanie…</p>
          ) : (
            <ul className="adm-acclist">
              {list.map((e) => {
                const me = e.email.toLowerCase() === currentEmail.toLowerCase();
                return (
                  <li key={e.email} className="adm-accrow">
                    <span className="adm-accrow__av">{e.email[0].toUpperCase()}</span>
                    <span className="adm-accrow__main">
                      <span className="adm-accrow__name">{e.email}{me && <span className="adm-you">to Ty</span>}</span>
                      {e.added && <span className="adm-accrow__email">dodano {e.added}</span>}
                    </span>
                    <button className="adm-iconbtn adm-iconbtn--danger" disabled={me || busy} title={me ? "Nie możesz cofnąć dostępu sobie" : "Cofnij dostęp"} onClick={() => !me && setDelTarget(e)}>
                      <TrashIcon />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {delTarget && (
        <Confirm
          title="Cofnąć dostęp?"
          text={"Konto „" + delTarget.email + "” straci możliwość logowania do panelu."}
          confirmLabel="Cofnij dostęp"
          onConfirm={remove}
          onClose={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}

// ====== Toast ======
function useToast(): [(m: string) => void, React.ReactNode] {
  const [msg, setMsg] = useState<string | null>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function show(m: string) {
    setMsg(m);
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setMsg(null), 2600);
  }
  const node = msg ? <div className="adm-toast">{msg}</div> : null;
  return [show, node];
}

// ====== The app shell, once signed in ======
type Tab = "doradcy" | "kursy" | "newsletter" | "wysylki" | "automatyczne" | "dostep";

export function AdminApp({ user, initialTab = "doradcy" }: { user: AdminUser; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [menu, setMenu] = useState(false);
  const [toast, toastNode] = useToast();
  // Bookings no one has looked at yet (for this admin), shown on the "Kursy"
  // tab so they're noticed from the other tabs too.
  const [unseenTotal, setUnseenTotal] = useState(0);
  const onUnseenChange = useCallback((counts: Record<string, number>) => {
    setUnseenTotal(Object.values(counts).reduce((a, b) => a + b, 0));
  }, []);
  useEffect(() => {
    const load = () => getUnseenBookingCountsAction().then(onUnseenChange, () => {});
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [onUnseenChange]);

  const initial = (user.name || user.email)[0]?.toUpperCase() || "?";

  return (
    <div className="adm-root">
      <header className="adm-top">
        <div className="adm-top__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-clauwi.png" alt="ClauWi®" />
          <span className="adm-top__name">Panel <b>ClauWi®</b></span>
        </div>
        <nav className="adm-tabs">
          <button className={tab === "doradcy" ? "is-active" : ""} onClick={() => setTab("doradcy")}>Doradcy</button>
          <button className={tab === "kursy" ? "is-active" : ""} onClick={() => setTab("kursy")}>
            Kursy
            {unseenTotal > 0 && <span className="adm-tabs__count" title="Nowe zgłoszenia od Twojej ostatniej wizyty">{unseenTotal}</span>}
          </button>
          <button className={tab === "newsletter" ? "is-active" : ""} onClick={() => setTab("newsletter")}>Newsletter</button>
          <button className={tab === "wysylki" ? "is-active" : ""} onClick={() => setTab("wysylki")}>Wysyłki</button>
          <button className={tab === "automatyczne" ? "is-active" : ""} onClick={() => setTab("automatyczne")}>Automatyczne</button>
          <button className={tab === "dostep" ? "is-active" : ""} onClick={() => setTab("dostep")}>Dostęp</button>
        </nav>
        <div className="adm-user" onClick={() => setMenu((m) => !m)}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="adm-user__av" src={user.image} alt="" style={{ objectFit: "cover" }} />
          ) : (
            <span className="adm-user__av" style={{ background: "#cb8c7c" }}>{initial}</span>
          )}
          <div className="adm-user__meta">
            <span className="adm-user__name">{user.name || user.email}</span>
          </div>
          {menu && (
            <div className="adm-usermenu" onClick={(e) => e.stopPropagation()}>
              <div className="adm-usermenu__email">{user.email}</div>
              <a className="adm-usermenu__link" href="/">↗ Zobacz stronę główną</a>
              <form action={signOutAction}>
                <button type="submit" className="adm-usermenu__logout">Wyloguj się</button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main className="adm-main">
        <div className="adm-head">
          <h1>{tab === "doradcy" ? "Doradcy" : tab === "kursy" ? "Kursy" : tab === "newsletter" ? "Newsletter" : tab === "wysylki" ? "Wysyłki" : tab === "automatyczne" ? "Wiadomości automatyczne" : "Zarządzanie dostępem"}</h1>
          <p>
            {tab === "doradcy"
              ? "Dodawaj, edytuj i usuwaj doradców widocznych na stronie."
              : tab === "kursy"
                ? "Zarządzaj kalendarzem kursów i przeglądaj zgłoszenia uczestników."
                : tab === "newsletter"
                  ? "Adresy osób, które zgodziły się na e-maile z ofertami — z widżetu newslettera i z zapisów na kursy."
                  : tab === "wysylki"
                    ? "Wszystkie wiadomości wysłane z panelu — newslettery i wiadomości do uczestników kursów."
                    : tab === "automatyczne"
                      ? "E-maile, które wysyłają się same — po zapisie na newsletter, przed kursem i po nim. Każdy można włączyć, wyłączyć i zmienić jego treść."
                  : "Decyduj, które konta Google mają dostęp do panelu."}
          </p>
        </div>
        {tab === "doradcy" ? (
          <AdvisorsTab toast={toast} />
        ) : tab === "kursy" ? (
          <CoursesTab toast={toast} onUnseenChange={onUnseenChange} />
        ) : tab === "newsletter" ? (
          <NewsletterTab toast={toast} />
        ) : tab === "wysylki" ? (
          <MailingsTab toast={toast} />
        ) : tab === "automatyczne" ? (
          <AutomationsTab />
        ) : (
          <AccessTab currentEmail={user.email} toast={toast} />
        )}
      </main>
      {toastNode}
    </div>
  );
}
