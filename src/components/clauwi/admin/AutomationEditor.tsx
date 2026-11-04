"use client";

// One automatic e-mail's page (/admin/automatyczne/<key>): switched on or
// off, when it goes out, its wording (the same editor as the composer) with a
// live preview on sample data, a test send, and what it has sent lately.

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AUTOMATION_INFO, type Automation, type AutomationKey, type AutomationOptions, type AutomationSend } from "@/lib/clauwi/automations";
import { buildMessageEmail, unsubscribeUrl, type NewsletterDraft } from "@/lib/clauwi/newsletter-template";
import type { NewsletterRecipient } from "@/lib/clauwi/newsletter";
import { TYPE_SUGGESTIONS } from "@/lib/clauwi/courses";
import { getAutomationAction, getCoursesAdminAction, saveAutomationAction, sendTestAction } from "@/app/admin/actions";
import { DraftEditor } from "./DraftEditor";
import { SAMPLE, TestSend } from "./MessageComposer";
import { formatUtc } from "./MailingView";
import "./admin.css";

const coll = new Intl.Collator("pl");
const noSubscribe = () => () => {};

/** A sign-up through the newsletter card has no name or course. */
const WIDGET_SAMPLE: NewsletterRecipient = { email: "anna.kowalska@example.com", firstName: "", lastName: "", course: null };

const SEND_STATUS: Record<string, string> = { sent: "Wysłano", failed: "Błąd", sending: "Wysyłanie (przerwane?)", skipped: "Pominięto" };

export function AutomationEditor({ automationKey }: { automationKey: AutomationKey }) {
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  return mounted ? <Editor automationKey={automationKey} /> : null;
}

function Editor({ automationKey }: { automationKey: AutomationKey }) {
  const info = AUTOMATION_INFO[automationKey];
  const [saved, setSaved] = useState<Automation | null>(null);
  const [sends, setSends] = useState<AutomationSend[]>([]);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState<NewsletterDraft | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [days, setDays] = useState(0);
  const [options, setOptions] = useState<AutomationOptions>({});
  const [types, setTypes] = useState<string[]>(TYPE_SUGGESTIONS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getAutomationAction(automationKey).then(
      (res) => {
        if (!res) return setFailed(true);
        const a = res.automation;
        setSaved(a);
        setSends(res.sends);
        setDraft({ subject: a.subject, heading: a.heading, body: a.body });
        setEnabled(a.enabled);
        setDays(a.days);
        setOptions(a.options);
      },
      () => setFailed(true),
    );
    if (automationKey === "course-next-step") {
      getCoursesAdminAction().then(
        (courses) => setTypes([...new Set([...TYPE_SUGGESTIONS, ...courses.map((c) => c.type).filter(Boolean)])].sort(coll.compare)),
        () => {},
      );
    }
  }, [automationKey]);

  const recipient = automationKey === "welcome" ? WIDGET_SAMPLE : SAMPLE;
  const email = useMemo(() => {
    if (!draft) return null;
    const baseUrl = window.location.origin;
    return buildMessageEmail(draft, recipient, info.marketing ? { baseUrl, unsubscribeUrl: unsubscribeUrl(baseUrl, "podglad") } : { baseUrl });
  }, [draft, recipient, info.marketing]);

  const dirty =
    !!saved && !!draft &&
    (saved.enabled !== enabled || saved.days !== days || JSON.stringify(saved.options) !== JSON.stringify(options) ||
      saved.subject !== draft.subject || saved.heading !== draft.heading || saved.body !== draft.body);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveError("");
    try {
      const a = await saveAutomationAction(automationKey, { enabled, days, options, draft });
      if (a) setSaved(a);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      setSaveError(enabled ? "Nie udało się zapisać — temat i treść nie mogą być puste." : "Nie udało się zapisać.");
    } finally {
      setSaving(false);
    }
  }

  const backHref = "/admin?tab=automatyczne";
  if (failed) {
    return <div className="adm-root"><main className="adm-main"><p className="adm-empty">Nie udało się wczytać. <Link href={backHref}>Wróć</Link>.</p></main></div>;
  }
  if (!saved || !draft) return <div className="adm-root"><main className="adm-main"><p className="adm-empty">Wczytywanie…</p></main></div>;

  return (
    <div className="adm-root">
      <header className="adm-top">
        <Link href={backHref} className="adm-btn adm-btn--ghost">← Automatyczne</Link>
        <div className="adm-compose__to">
          <b>{info.name}</b>
          <span>Wysyłana {info.when(days)}</span>
        </div>
        {justSaved && <span className="adm-auto__saved">Zapisano</span>}
        <button type="button" className="adm-btn adm-btn--ghost" disabled={!draft.subject.trim()} onClick={() => setTesting(true)}>Wyślij test</button>
        <button type="button" className="adm-btn adm-btn--solid" disabled={!dirty || saving} onClick={save}>
          {saving ? "Zapisywanie…" : "Zapisz"}
        </button>
      </header>

      {testing && (
        <TestSend onSend={(to) => sendTestAction(info.marketing ? "newsletter" : "course", draft, recipient, to)} onClose={() => setTesting(false)} />
      )}

      <main className="adm-compose">
        <div className="adm-compose__edit">
          <section className="adm-auto__settings">
            <label className="adm-auto__switch">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <span>
                <b>{enabled ? "Włączona" : "Wyłączona"}</b>
                {enabled && !saved.enabled && <> — zacznie działać po zapisaniu</>}
                {!enabled && saved.enabled && <> — przestanie działać po zapisaniu</>}
              </span>
            </label>
            <p>{info.who}</p>
            {automationKey !== "welcome" && (
              <p className="adm-compose__hint">
                Dotyczy tylko kursów, które zakończą się po jej włączeniu{saved.enabledAt && saved.enabled ? ` (${formatUtc(saved.enabledAt)})` : ""} — włączenie nie
                wyśle niczego uczestnikom wcześniejszych kursów.
                {automationKey === "course-reminder" && " Przypomnienie dostaną też osoby zapisane na najbliższe kursy."}
              </p>
            )}
            {info.daysLabel && (
              <label className="adm-f adm-auto__days">
                <span>{info.daysLabel}</span>
                <input type="number" min={automationKey === "course-reminder" ? 1 : 0} max={365} value={days} onChange={(e) => setDays(Math.max(0, Number(e.target.value) | 0))} />
              </label>
            )}
            {automationKey === "course-next-step" && (
              <div className="adm-grid2">
                <label className="adm-f">
                  <span>Po kursie rodzaju</span>
                  <select value={options.afterType ?? ""} onChange={(e) => setOptions({ ...options, afterType: e.target.value })}>
                    <option value="">dowolnego</option>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="adm-f">
                  <span>Pomiń, jeśli osoba zapisała się już na</span>
                  <select value={options.skipIfType ?? ""} onChange={(e) => setOptions({ ...options, skipIfType: e.target.value })}>
                    <option value="">jakikolwiek kolejny kurs</option>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
              </div>
            )}
            {saveError && <p className="adm-compose__warn">{saveError}</p>}
          </section>

          <DraftEditor
            draft={draft}
            onChange={setDraft}
            recipient={recipient}
            courseNote={automationKey === "welcome" ? "Zapis z widżetu nie ma imienia ani kursu — pola osoby i kursu będą puste." : "Dane kursu to kurs, którego dotyczy wiadomość."}
          />

          <details className="adm-compose__fields" open={sends.length > 0}>
            <summary>Ostatnio wysłane ({saved.sent30d} w ostatnich 30 dniach)</summary>
            {sends.length === 0 ? (
              <p>Jeszcze nic nie wysłano.</p>
            ) : (
              <table className="adm-table adm-auto__sends">
                <tbody>
                  {sends.map((s) => (
                    <tr key={s.ref}>
                      <td>{s.email}</td>
                      <td>{SEND_STATUS[s.status] ?? s.status}{s.error && <div className="adm-td-addr">{s.error}</div>}</td>
                      <td className="adm-td-addr">{formatUtc(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </details>
        </div>

        <section className="adm-compose__preview">
          <div className="adm-compose__pvhead">
            <div className="adm-compose__who">Podgląd na przykładowych danych{recipient.course ? ` · ${recipient.course.name}` : " · zapis z widżetu"}</div>
          </div>
          <div className="adm-compose__subject"><span>Temat:</span> {email?.subject || <i>(brak tematu)</i>}</div>
          {email && <iframe className="adm-compose__frame" title="Podgląd wiadomości" srcDoc={email.html} sandbox="" />}
        </section>
      </main>
    </div>
  );
}
