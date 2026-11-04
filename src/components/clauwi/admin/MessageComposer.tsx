"use client";

// Message composer, in two modes:
// - "newsletter": a mailing to the people picked on the "Newsletter" tab,
// - "course": a message to participants ticked on a course's booking list.
// The message on the left, a live preview on the right, rendered for one real
// recipient at a time so the placeholders can be checked. Sending records the
// message with its recipients and moves to its page in "Wysyłki", which shows
// the progress (see mailings-repo.ts).
//
// The calling list hands the recipients over in sessionStorage (a selection
// can be hundreds of ids — too long for a URL). Drafts are kept in
// localStorage, one per mode, so leaving the page doesn't lose them.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NewsletterFilters, NewsletterRecipient } from "@/lib/clauwi/newsletter";
import { buildMessageEmail, PLACEHOLDERS, unknownPlaceholders, unsubscribeUrl, type NewsletterDraft } from "@/lib/clauwi/newsletter-template";
import type { Course } from "@/lib/clauwi/courses";
import {
  createCourseMessageAction, createNewsletterMailingAction, deleteTemplateAction, getCourseMessageAction, getMeAction,
  getNewsletterRecipientAction, getSendingSettingsAction, getTemplatesAction, saveTemplateAction, sendTestAction,
} from "@/app/admin/actions";
import type { MessageTemplate } from "@/lib/clauwi/message-templates-repo";
import "./admin.css";

export type ComposerKind = "newsletter" | "course";

/** sessionStorage: NewsletterFilters from the newsletter tab. */
export const NEWSLETTER_FILTERS_KEY = "clauwi-newsletter-filters";
/** sessionStorage: { courseId, bookingIds } from a course's booking list. */
export const COURSE_MESSAGE_KEY = "clauwi-course-message";
const DRAFT_KEYS: Record<ComposerKind, string> = {
  newsletter: "clauwi-newsletter-draft",
  course: "clauwi-course-message-draft",
};

type Target =
  | { kind: "newsletter"; filters: NewsletterFilters }
  | { kind: "course"; courseId: string; bookingIds: string[] };

/** What the calling list left in sessionStorage for this mode. */
function readTarget(kind: ComposerKind): Target | null {
  try {
    const raw = read(() => sessionStorage, kind === "newsletter" ? NEWSLETTER_FILTERS_KEY : COURSE_MESSAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return kind === "newsletter" ? { kind, filters: data as NewsletterFilters } : { kind, courseId: String(data.courseId), bookingIds: data.bookingIds as string[] };
  } catch {
    return null;
  }
}

/** "2026-12-05 10:00" → "05.12.2026". */
function shortDate(sql: string): string {
  const [y, m, d] = sql.slice(0, 10).split("-");
  return d ? `${d}.${m}.${y}` : sql;
}

const EMPTY_DRAFT: NewsletterDraft = {
  subject: "",
  heading: "",
  body: "Dzień dobry,\n\n",
};

/** Shown when the filters match nobody, so the preview still has something to fill in. */
const SAMPLE: NewsletterRecipient = {
  email: "anna.kowalska@example.com",
  firstName: "Anna",
  lastName: "Kowalska",
  course: { name: "Kurs podstawowy KRAKÓW", type: "Kurs podstawowy", location: "Kraków, ul. Przykładowa 1", startsAt: "2024-05-17 10:00", endsAt: "2024-05-19 17:00" },
};

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function plural(n: number, one: string, few: string, many: string): string {
  const d = n % 10, dd = n % 100;
  return n === 1 ? one : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
}

const noSubscribe = () => () => {};

/**
 * Markdown cheatsheet — each entry inserts its syntax into the body: `wrap`
 * goes around the selection (or a sample text), `line` starts a new line.
 * Mirrors what newsletter-template.ts renders.
 */
const MARKDOWN_HELP: { label: string; syntax: string; sample: string; wrap?: [string, string]; line?: string; block?: boolean }[] = [
  { label: "Pogrubienie", syntax: "**tekst**", wrap: ["**", "**"], sample: "pogrubiony tekst" },
  { label: "Kursywa", syntax: "*tekst*", wrap: ["*", "*"], sample: "kursywa" },
  { label: "Link", syntax: "[tekst](https://…)", wrap: ["[", "](https://clauwi.pl)"], sample: "tekst linku" },
  { label: "Nagłówek", syntax: "## Nagłówek", line: "## ", sample: "Nagłówek" },
  { label: "Mniejszy nagłówek", syntax: "### Nagłówek", line: "### ", sample: "Nagłówek" },
  { label: "Lista punktowana", syntax: "- punkt", line: "- ", sample: "punkt" },
  { label: "Lista numerowana", syntax: "1. punkt", line: "1. ", sample: "punkt" },
  { label: "Cytat / wyróżnienie", syntax: "> tekst", line: "> ", sample: "tekst" },
  { label: "Linia oddzielająca", syntax: "---", line: "---", sample: "", block: true },
  { label: "Obrazek", syntax: "![opis](https://…/obraz.jpg)", wrap: ["![", "](https://)"], sample: "opis obrazka" },
];

export function MessageComposer({ kind }: { kind: ComposerKind }) {
  // Storage only exists in the browser — render the composer after hydration.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  return mounted ? <Composer kind={kind} /> : null;
}

/** datetime-local value (the admin's local time) → UTC "YYYY-MM-DD HH:MM:SS". */
function localToUtcSql(local: string): string {
  return new Date(local).toISOString().slice(0, 19).replace("T", " ");
}

/** datetime-local value for an hour from now, on the full hour. */
function inAnHour(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

/**
 * Saved templates: load one into the composer, save the current message
 * under a name (an existing name is overwritten), delete. Loading and
 * deleting ask once more inline, so a stray click loses nothing.
 */
function Templates({ draft, onLoad, onClose }: { draft: NewsletterDraft; onLoad: (d: NewsletterDraft) => void; onClose: () => void }) {
  const [list, setList] = useState<MessageTemplate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState("");
  const [armed, setArmed] = useState<{ id: string; action: "load" | "delete" } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    getTemplatesAction().then(setList, () => setFailed(true));
  }, []);
  const existing = list?.find((t) => t.name.toLowerCase() === name.trim().toLowerCase());
  const draftEmpty = !draft.subject.trim() && !draft.heading.trim() && draft.body.trim() === EMPTY_DRAFT.body.trim();

  async function run(work: () => Promise<MessageTemplate[]>) {
    setBusy(true);
    try {
      setList(await work());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
      setArmed(null);
    }
  }

  function load(t: MessageTemplate) {
    if (!draftEmpty && !(armed?.id === t.id && armed.action === "load")) return setArmed({ id: t.id, action: "load" });
    onLoad({ subject: t.subject, heading: t.heading, body: t.body });
    onClose();
  }

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-sheet adm-templates">
        <div className="adm-sheet__head">
          <h2>Szablony wiadomości</h2>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          {failed && <p className="adm-compose__warn">Nie udało się wczytać lub zapisać szablonów.</p>}
          {!list ? (
            <p className="adm-empty">Wczytywanie…</p>
          ) : list.length === 0 ? (
            <p className="adm-empty">Nie ma jeszcze zapisanych szablonów. Napisz wiadomość i zapisz ją poniżej, żeby użyć jej ponownie.</p>
          ) : (
            <ul className="adm-templates__list">
              {list.map((t) => (
                <li key={t.id}>
                  <div>
                    <b>{t.name}</b>
                    <span>{t.subject || <i>(bez tematu)</i>}</span>
                  </div>
                  <button type="button" className="adm-btn adm-btn--solid" disabled={busy} onClick={() => load(t)}>
                    {armed?.id === t.id && armed.action === "load" ? "Zastąpić bieżącą treść?" : "Wczytaj"}
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn--ghost adm-btn--dangertext"
                    disabled={busy}
                    onClick={() => (armed?.id === t.id && armed.action === "delete" ? run(() => deleteTemplateAction(t.id)) : setArmed({ id: t.id, action: "delete" }))}
                  >
                    {armed?.id === t.id && armed.action === "delete" ? "Na pewno usunąć?" : "Usuń"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          className="adm-sheet__foot adm-templates__save"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) run(() => saveTemplateAction(name, draft)).then(() => setName(""));
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa szablonu, np. Przypomnienie przed kursem" aria-label="Nazwa szablonu" />
          <button type="submit" className="adm-btn adm-btn--solid" disabled={busy || !name.trim() || draftEmpty}>
            {existing ? "Nadpisz szablon" : "Zapisz bieżącą jako szablon"}
          </button>
        </form>
      </div>
    </div>
  );
}

/** The test-send dialog. */
function TestSend({ onSend, onClose }: { onSend: (to: string) => Promise<void>; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  useEffect(() => {
    getMeAction().then((me) => setTo((t) => t || me), () => {});
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      await onSend(to);
      setState("sent");
    } catch {
      setState("failed");
    }
  }
  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="adm-confirm" onSubmit={submit}>
        <h2>Wyślij test</h2>
        <p>Wiadomość w wersji z podglądu (z danymi pokazywanej osoby) trafi tylko na podany adres, z „[TEST]” w temacie.</p>
        <label className="adm-f">
          <span>Adres</span>
          <input type="email" required value={to} onChange={(e) => { setTo(e.target.value); setState("idle"); }} autoFocus />
        </label>
        {state === "sent" && <p className="adm-compose__ok">Wysłano — sprawdź skrzynkę (także folder spam).</p>}
        {state === "failed" && <p className="adm-compose__warn">Nie udało się wysłać testu.</p>}
        <div className="adm-confirm__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Zamknij</button>
          <button type="submit" className="adm-btn adm-btn--solid" disabled={state === "sending" || !to}>
            {state === "sending" ? "Wysyłanie…" : state === "sent" ? "Wyślij ponownie" : "Wyślij test"}
          </button>
        </div>
      </form>
    </div>
  );
}

type Field = keyof NewsletterDraft;

function Composer({ kind }: { kind: ComposerKind }) {
  const [target] = useState<Target | null>(() => readTarget(kind));
  const draftKey = DRAFT_KEYS[kind];
  const [draft, setDraft] = useState<NewsletterDraft>(() => {
    try {
      return { ...EMPTY_DRAFT, ...JSON.parse(read(() => localStorage, draftKey) ?? "{}") };
    } catch {
      return EMPTY_DRAFT;
    }
  });
  const [index, setIndex] = useState(0);
  // Newsletter: recipients are fetched one at a time (the list can be huge).
  const [preview, setPreview] = useState<{ recipient: NewsletterRecipient | null; total: number } | null>(null);
  // Course: the few chosen participants are fetched at once.
  const [courseData, setCourseData] = useState<{ course: Course; recipients: NewsletterRecipient[]; bookingIds: string[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [testing, setTesting] = useState(false);
  const [templates, setTemplates] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);
  // Newsletter: "" = send now, otherwise a datetime-local value.
  const [scheduleAt, setScheduleAt] = useState("");
  const [limits, setLimits] = useState<{ dailyLimit: number; sentLast24h: number } | null>(null);
  const router = useRouter();

  // Where "insert" puts a placeholder: the field last focused, at its caret.
  const subjectRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastField = useRef<Field>("body");
  // Caret to restore once an inserted placeholder has rendered.
  const pendingCaret = useRef<{ el: HTMLInputElement | HTMLTextAreaElement; start: number; end: number } | null>(null);

  useLayoutEffect(() => {
    const c = pendingCaret.current;
    if (!c) return;
    pendingCaret.current = null;
    c.el.focus();
    c.el.setSelectionRange(c.start, c.end);
  }, [draft]);

  useEffect(() => {
    if (target?.kind !== "newsletter") return;
    let stale = false;
    getNewsletterRecipientAction(target.filters, index).then(
      (res) => { if (!stale) { setPreview(res); setFailed(false); } },
      () => { if (!stale) setFailed(true); },
    );
    return () => { stale = true; };
  }, [target, index]);

  useEffect(() => {
    if (target?.kind !== "course") return;
    getCourseMessageAction(target.courseId, target.bookingIds).then(
      (res) => (res ? setCourseData(res) : setFailed(true)),
      () => setFailed(true),
    );
  }, [target]);

  function update(field: Field, value: string) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    try {
      localStorage.setItem(draftKey, JSON.stringify(next));
    } catch {}
  }

  function openConfirm() {
    setCreateFailed(false);
    setConfirming(true);
    if (kind === "newsletter") getSendingSettingsAction().then(setLimits, () => {});
  }

  /** Records the mailing and moves to its page, which takes care of sending. */
  async function send() {
    if (!target) return;
    setCreating(true);
    setCreateFailed(false);
    try {
      const id =
        target.kind === "course"
          ? await createCourseMessageAction(target.courseId, courseData?.bookingIds ?? [], draft)
          : await createNewsletterMailingAction(target.filters, draft, summary.join(" · ") || "wszyscy z listy newslettera", scheduleAt ? localToUtcSql(scheduleAt) : undefined);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      router.push(`/admin/wysylki/${id}`);
    } catch {
      setCreateFailed(true);
      setCreating(false);
    }
  }

  /**
   * Replaces the field's selection with before + middle + after, then selects
   * `middle` (or puts the caret after everything when it's empty).
   */
  function replaceSelection(field: Field, build: (selected: string, value: string, start: number) => [string, string, string]) {
    const el = (field === "subject" ? subjectRef : field === "heading" ? headingRef : bodyRef).current;
    const value = draft[field];
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const [before, middle, after] = build(value.slice(start, end), value, start);
    const selStart = start + before.length;
    if (el) pendingCaret.current = middle ? { el, start: selStart, end: selStart + middle.length } : { el, start: selStart + after.length, end: selStart + after.length };
    update(field, value.slice(0, start) + before + middle + after + value.slice(end));
  }

  function insert(key: string) {
    replaceSelection(lastField.current, () => [`{{${key}}}`, "", ""]);
  }

  // Formatting only means something in the body, so it always goes there.
  function insertMarkdown(item: (typeof MARKDOWN_HELP)[number]) {
    replaceSelection("body", (selected, value, start) => {
      const text = selected || item.sample;
      if (item.wrap) return [item.wrap[0], text, item.wrap[1]];
      const atLineStart = start === 0 || value[start - 1] === "\n";
      if (item.block) return [(atLineStart ? "\n" : "\n\n") + item.line!, "", "\n\n"];
      return [(atLineStart ? "" : "\n") + item.line!, text, ""];
    });
  }

  const view =
    target?.kind === "course"
      ? courseData && { recipient: courseData.recipients[index] ?? null, total: courseData.recipients.length }
      : preview;
  const total = view?.total ?? 0;
  const recipient = view?.recipient ?? (view && total === 0 ? SAMPLE : null);
  const email = useMemo(() => {
    if (!recipient) return null;
    const baseUrl = window.location.origin;
    // Newsletter mailings carry an unsubscribe link (each recipient's own at
    // send time); messages about a course booking don't.
    return buildMessageEmail(draft, recipient, kind === "newsletter" ? { baseUrl, unsubscribeUrl: unsubscribeUrl(baseUrl, "podglad") } : { baseUrl });
  }, [draft, recipient, kind]);
  const unknown = useMemo(() => unknownPlaceholders(`${draft.subject} ${draft.heading} ${draft.body}`), [draft]);

  const backHref = kind === "newsletter" ? "/admin?tab=newsletter" : "/admin?tab=kursy";
  if (!target) {
    return (
      <div className="adm-root">
        <main className="adm-main">
          <p className="adm-empty">
            Nie wybrano odbiorców.{" "}
            {kind === "newsletter" ? (
              <><Link href={backHref}>Wróć do listy newslettera</Link> i kliknij „Wyślij do…”.</>
            ) : (
              <><Link href={backHref}>Wróć do kursów</Link>, otwórz zgłoszenia kursu, zaznacz uczestników i kliknij „Napisz do zaznaczonych”.</>
            )}
          </p>
        </main>
      </div>
    );
  }

  const summary =
    target.kind === "newsletter"
      ? [
          target.filters.source === "widget" ? "widżet newslettera" : target.filters.source === "course" ? "zapisy na kursy" : null,
          target.filters.courseType || null,
          target.filters.courseIds.length ? `${target.filters.courseIds.length} ${plural(target.filters.courseIds.length, "wybrany kurs", "wybrane kursy", "wybranych kursów")}` : null,
          target.filters.q ? `„${target.filters.q}”` : null,
        ].filter(Boolean)
      : courseData
        ? [`uczestnicy kursu ${courseData.course.name} (${shortDate(courseData.course.startsAt)})`]
        : [];
  const canSend = total > 0 && draft.subject.trim() !== "" && draft.body.trim() !== "" && !creating;
  const people = `${total} ${plural(total, "osoby", "osób", "osób")}`;
  // How many days a newsletter mailing will take at the daily limit.
  const room = limits ? Math.max(0, limits.dailyLimit - limits.sentLast24h) : 0;
  const days = limits ? (total <= room ? 1 : 1 + Math.ceil((total - room) / limits.dailyLimit)) : 1;

  return (
    <div className="adm-root">
      <header className="adm-top">
        <Link href={backHref} className="adm-btn adm-btn--ghost">← {kind === "newsletter" ? "Lista newslettera" : "Kursy"}</Link>
        <div className="adm-compose__to">
          <b>{kind === "newsletter" ? "Nowa wiadomość" : "Wiadomość do uczestników"}</b>
          <span>
            do {view ? people : "…"}
            {summary.length > 0 && <> · {summary.join(" · ")}</>}
          </span>
        </div>
        <button type="button" className="adm-btn adm-btn--ghost" disabled={!recipient || !draft.subject.trim()} onClick={() => setTesting(true)}>
          Wyślij test
        </button>
        <button
          type="button"
          className="adm-btn adm-btn--solid"
          disabled={!canSend}
          title={canSend ? undefined : total === 0 ? "Brak odbiorców" : "Uzupełnij temat i treść"}
          onClick={openConfirm}
        >
          Wyślij do {people}
        </button>
      </header>

      {testing && recipient && (
        <TestSend onSend={(to) => sendTestAction(kind, draft, recipient, to)} onClose={() => setTesting(false)} />
      )}

      {confirming && (
        <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget && !creating) setConfirming(false); }}>
          <div className="adm-confirm">
            <h2>{kind === "newsletter" && scheduleAt ? "Zaplanować wysyłkę?" : "Wysłać wiadomość?"}</h2>
            <p>
              „{draft.subject}” trafi do {people}
              {courseData && <> — uczestników kursu {courseData.course.name}</>}. Każdy dostanie osobny e-mail, odpowiedzi przyjdą na
              kontakt@clauwi.pl. Wysłanej wiadomości nie można cofnąć.
            </p>
            {kind === "newsletter" && (
              <>
                <div className="adm-compose__when">
                  <label><input type="radio" checked={!scheduleAt} onChange={() => setScheduleAt("")} /> Wyślij teraz</label>
                  <label>
                    <input type="radio" checked={!!scheduleAt} onChange={() => setScheduleAt(inAnHour())} /> Zaplanuj na
                    <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} disabled={!scheduleAt} />
                  </label>
                </div>
                {limits && (
                  <p className="adm-compose__hint">
                    Dzienny limit wysyłki to {limits.dailyLimit} wiadomości
                    {limits.sentLast24h > 0 && <> (w ostatniej dobie wysłano już {limits.sentLast24h})</>}.{" "}
                    {days > 1 ? (
                      <>Wysyłka rozłoży się na ok. {days} dni — kolejne partie wyślą się same, także po zamknięciu tej strony. Najpierw dostaną ją osoby z najnowszą zgodą.</>
                    ) : (
                      <>Kolejne partie wyślą się same, także po zamknięciu tej strony.</>
                    )}{" "}
                    Limit można zmienić w zakładce „Wysyłki”.
                  </p>
                )}
              </>
            )}
            {createFailed && <p className="adm-compose__warn">Nie udało się rozpocząć wysyłki. Spróbuj ponownie.</p>}
            <div className="adm-confirm__foot">
              <button className="adm-btn adm-btn--ghost" disabled={creating} onClick={() => setConfirming(false)}>Anuluj</button>
              <button className="adm-btn adm-btn--solid" disabled={creating || (kind === "newsletter" && !!scheduleAt && new Date(scheduleAt) <= new Date())} onClick={send}>
                {creating ? "Zapisywanie…" : kind === "newsletter" && scheduleAt ? "Zaplanuj" : "Wyślij"}
              </button>
            </div>
          </div>
        </div>
      )}

      {templates && (
        <Templates
          draft={draft}
          onLoad={(d) => {
            setDraft(d);
            try {
              localStorage.setItem(draftKey, JSON.stringify(d));
            } catch {}
          }}
          onClose={() => setTemplates(false)}
        />
      )}

      <main className="adm-compose">
        <section className="adm-compose__edit">
          <div className="adm-compose__tools">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setTemplates(true)}>Szablony…</button>
          </div>
          <label className="adm-f">
            <span>Temat</span>
            <input ref={subjectRef} value={draft.subject} onFocus={() => (lastField.current = "subject")} onChange={(e) => update("subject", e.target.value)} placeholder="np. Nowe terminy kursów w {{kurs.miasto|Twojej okolicy}}" />
          </label>
          <label className="adm-f">
            <span>Nagłówek w treści</span>
            <input ref={headingRef} value={draft.heading} onFocus={() => (lastField.current = "heading")} onChange={(e) => update("heading", e.target.value)} placeholder="np. Nowe terminy" />
          </label>
          <label className="adm-f adm-compose__body">
            <span>Treść</span>
            <textarea ref={bodyRef} value={draft.body} onFocus={() => (lastField.current = "body")} onChange={(e) => update("body", e.target.value)} />
            <small>Formatowanie w Markdownie — ściągawka poniżej. Pusta linia zaczyna nowy akapit.</small>
          </label>
          {unknown.length > 0 && (
            <p className="adm-compose__warn">
              Nieznane pola: {unknown.map((k) => `{{${k}}}`).join(", ")} — zostaną wysłane dosłownie.
            </p>
          )}

          <details className="adm-compose__fields">
            <summary>Pola do personalizacji</summary>
            <p>
              Kliknij, aby wstawić w miejscu kursora. Dane kursu pochodzą z najnowszego pasującego kursu danej osoby. Gdy brakuje danych (np. zapis
              z widżetu nie ma imienia ani kursu), pole jest puste — można podać zastępstwo po kresce: <code>{"{{imie|Drogi Rodzicu}}"}</code>.
            </p>
            {(["Osoba", "Kurs"] as const).map((group) => (
              <div key={group}>
                <h3>{group}</h3>
                <ul>
                  {PLACEHOLDERS.filter((p) => p.group === group).map((p) => (
                    <li key={p.key}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(p.key)}>
                        <code>{`{{${p.key}}}`}</code>
                        <span>{p.label}</span>
                        {recipient && <em>{p.value(recipient) || "—"}</em>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>

          <details className="adm-compose__fields adm-compose__md">
            <summary>Formatowanie (Markdown)</summary>
            <p>Kliknij, aby wstawić do treści — zaznaczony tekst zostanie objęty formatowaniem.</p>
            <ul>
              {MARKDOWN_HELP.map((m) => (
                <li key={m.label}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown(m)}>
                    <code>{m.syntax}</code>
                    <span>{m.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p>
              Enter przechodzi do nowej linii, pusta linia zaczyna nowy akapit. Adresy http(s)://… same stają się linkami. Pola personalizacji działają
              także wewnątrz formatowania, np. <code>{"**{{imie}}**"}</code> albo <code>{"[zapisz się](https://clauwi.pl/kalendarz-wydarzen)"}</code>. Kod
              HTML nie jest obsługiwany — pojawi się jako zwykły tekst.
            </p>
          </details>
        </section>

        <section className="adm-compose__preview">
          <div className="adm-compose__pvhead">
            <div className="adm-compose__who">
              {failed ? (
                "Nie udało się wczytać odbiorcy."
              ) : !view ? (
                "Wczytywanie…"
              ) : total === 0 ? (
                "Nikt nie pasuje do filtrów — podgląd na przykładowych danych."
              ) : (
                <>
                  Podgląd dla <b>{recipient?.email}</b>
                  {recipient?.course ? ` · ${recipient.course.name}` : " · bez kursu"}
                </>
              )}
            </div>
            {total > 1 && (
              <div className="adm-compose__nav">
                <button type="button" className="adm-iconbtn" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Poprzedni odbiorca">‹</button>
                <span>{index + 1} / {total}</span>
                <button type="button" className="adm-iconbtn" disabled={index >= total - 1} onClick={() => setIndex(index + 1)} aria-label="Następny odbiorca">›</button>
              </div>
            )}
          </div>
          <div className="adm-compose__subject">
            <span>Temat:</span> {email?.subject || <i>(brak tematu)</i>}
          </div>
          {email && <iframe className="adm-compose__frame" title="Podgląd wiadomości" srcDoc={email.html} sandbox="" />}
        </section>
      </main>
    </div>
  );
}
