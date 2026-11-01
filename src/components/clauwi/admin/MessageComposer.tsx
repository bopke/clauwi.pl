"use client";

// Message composer, in two modes:
// - "newsletter": a mailing to the people picked on the "Newsletter" tab
//   (sending comes later),
// - "course": a message to participants ticked on a course's booking list.
// The message on the left, a live preview on the right, rendered for one real
// recipient at a time so the placeholders can be checked.
//
// The calling list hands the recipients over in sessionStorage (a selection
// can be hundreds of ids — too long for a URL). Drafts are kept in
// localStorage, one per mode, so leaving the page doesn't lose them.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { NewsletterFilters, NewsletterRecipient } from "@/lib/clauwi/newsletter";
import { buildMessageEmail, PLACEHOLDERS, unknownPlaceholders, unsubscribeUrl, type NewsletterDraft } from "@/lib/clauwi/newsletter-template";
import { COURSE_MESSAGE_CHUNK, type Course } from "@/lib/clauwi/courses";
import { getCourseMessageAction, getNewsletterRecipientAction, sendCourseMessageAction } from "@/app/admin/actions";
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

type Sending =
  | { phase: "confirm" }
  | { phase: "sending"; done: number; total: number }
  | { phase: "done"; sent: number; failed: string[]; failedIds: string[] };

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
  const [sending, setSending] = useState<Sending | null>(null);

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

  /**
   * Course mode: sends to everyone chosen — or, retrying, to `only` those it
   * failed for — chunk by chunk, showing progress.
   */
  async function send(only?: string[]) {
    if (target?.kind !== "course" || !courseData) return;
    const ids = only ?? courseData.bookingIds;
    // recipients[i] belongs to bookingIds[i]
    const emailOf = new Map(courseData.bookingIds.map((id, i) => [id, courseData.recipients[i].email]));
    let sent = 0;
    const failedTo: string[] = [];
    setSending({ phase: "sending", done: 0, total: ids.length });
    for (let i = 0; i < ids.length; i += COURSE_MESSAGE_CHUNK) {
      const chunk = ids.slice(i, i + COURSE_MESSAGE_CHUNK);
      try {
        const res = await sendCourseMessageAction(target.courseId, chunk, draft);
        sent += res.sent;
        failedTo.push(...res.failed);
      } catch {
        // The whole chunk failed (e.g. network) — report its addresses.
        failedTo.push(...chunk.map((id) => emailOf.get(id) ?? id));
      }
      setSending({ phase: "sending", done: Math.min(i + chunk.length, ids.length), total: ids.length });
    }
    const failedSet = new Set(failedTo);
    setSending({ phase: "done", sent, failed: failedTo, failedIds: ids.filter((id) => failedSet.has(emailOf.get(id) ?? "")) });
    if (failedTo.length === 0) {
      try {
        localStorage.removeItem(draftKey);
      } catch {}
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
  const canSend = kind === "course" && total > 0 && draft.subject.trim() !== "" && draft.body.trim() !== "" && !sending;
  const people = `${total} ${plural(total, "osoby", "osób", "osób")}`;

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
        {kind === "newsletter" ? (
          <button type="button" className="adm-btn adm-btn--solid" disabled title="Wysyłka newslettera będzie dostępna w kolejnym kroku">
            Wyślij do {people}
          </button>
        ) : (
          <button
            type="button"
            className="adm-btn adm-btn--solid"
            disabled={!canSend}
            title={canSend ? undefined : "Uzupełnij temat i treść"}
            onClick={() => setSending({ phase: "confirm" })}
          >
            Wyślij do {people}
          </button>
        )}
      </header>

      {sending && (
        <div className="adm-modal">
          <div className="adm-confirm">
            {sending.phase === "confirm" ? (
              <>
                <h2>Wysłać wiadomość?</h2>
                <p>
                  „{draft.subject}” trafi do {people}
                  {courseData && <> — uczestników kursu {courseData.course.name}</>}. Każdy dostanie osobny e-mail, odpowiedzi przyjdą na
                  kontakt@clauwi.pl. Wysłanej wiadomości nie można cofnąć.
                </p>
                <div className="adm-confirm__foot">
                  <button className="adm-btn adm-btn--ghost" onClick={() => setSending(null)}>Anuluj</button>
                  <button className="adm-btn adm-btn--solid" onClick={() => send()}>Wyślij</button>
                </div>
              </>
            ) : sending.phase === "sending" ? (
              <>
                <h2>Wysyłanie…</h2>
                <p>{sending.done} / {sending.total} — nie zamykaj tej strony.</p>
              </>
            ) : (
              <>
                <h2>{sending.failed.length === 0 ? "Wysłano" : "Wysłano z błędami"}</h2>
                <p>
                  Wysłano do {sending.sent} {plural(sending.sent, "osoby", "osób", "osób")}.
                  {sending.failed.length > 0 && <> Nie udało się wysłać do: {sending.failed.join(", ")}.</>}
                </p>
                <div className="adm-confirm__foot">
                  {sending.failedIds.length > 0 && (
                    <button className="adm-btn adm-btn--ghost" onClick={() => send(sending.failedIds)}>
                      Ponów dla nieudanych ({sending.failedIds.length})
                    </button>
                  )}
                  <Link href={backHref} className="adm-btn adm-btn--solid">Wróć do kursów</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="adm-compose">
        <section className="adm-compose__edit">
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
              ) : !preview ? (
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
