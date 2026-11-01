"use client";

// Composer for a mailing to the people picked on the "Newsletter" tab: the
// message on the left, a live preview on the right, rendered for one real
// recipient at a time so the placeholders can be checked.
//
// The tab hands the filters over in sessionStorage (a course selection can be
// hundreds of ids — too long for a URL). The draft is kept in localStorage so
// leaving the page doesn't lose it.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { NewsletterFilters, NewsletterRecipient } from "@/lib/clauwi/newsletter";
import { buildNewsletterEmail, PLACEHOLDERS, unknownPlaceholders, unsubscribeUrl, type NewsletterDraft } from "@/lib/clauwi/newsletter-template";
import { getNewsletterRecipientAction } from "@/app/admin/actions";
import "./admin.css";

export const NEWSLETTER_FILTERS_KEY = "clauwi-newsletter-filters";
const DRAFT_KEY = "clauwi-newsletter-draft";

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

export function NewsletterComposer() {
  // Storage only exists in the browser — render the composer after hydration.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  return mounted ? <Composer /> : null;
}

type Field = keyof NewsletterDraft;

function Composer() {
  const [filters] = useState<NewsletterFilters | null>(() => {
    const raw = read(() => sessionStorage, NEWSLETTER_FILTERS_KEY);
    try {
      return raw ? (JSON.parse(raw) as NewsletterFilters) : null;
    } catch {
      return null;
    }
  });
  const [draft, setDraft] = useState<NewsletterDraft>(() => {
    try {
      return { ...EMPTY_DRAFT, ...JSON.parse(read(() => localStorage, DRAFT_KEY) ?? "{}") };
    } catch {
      return EMPTY_DRAFT;
    }
  });
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState<{ recipient: NewsletterRecipient | null; total: number } | null>(null);
  const [failed, setFailed] = useState(false);

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
    if (!filters) return;
    let stale = false;
    getNewsletterRecipientAction(filters, index).then(
      (res) => { if (!stale) { setPreview(res); setFailed(false); } },
      () => { if (!stale) setFailed(true); },
    );
    return () => { stale = true; };
  }, [filters, index]);

  function update(field: Field, value: string) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
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

  const total = preview?.total ?? 0;
  const recipient = preview?.recipient ?? (preview && total === 0 ? SAMPLE : null);
  const email = useMemo(
    // The real link gets each recipient's own token at send time.
    () => (recipient ? buildNewsletterEmail(draft, recipient, { baseUrl: window.location.origin, unsubscribeUrl: unsubscribeUrl(window.location.origin, "podglad") }) : null),
    [draft, recipient],
  );
  const unknown = useMemo(() => unknownPlaceholders(`${draft.subject} ${draft.heading} ${draft.body}`), [draft]);

  if (!filters) {
    return (
      <div className="adm-root">
        <main className="adm-main">
          <p className="adm-empty">
            Nie wybrano odbiorców. <Link href="/admin?tab=newsletter">Wróć do listy newslettera</Link> i kliknij „Wyślij do…”.
          </p>
        </main>
      </div>
    );
  }

  const summary = [
    filters.source === "widget" ? "widżet newslettera" : filters.source === "course" ? "zapisy na kursy" : null,
    filters.courseType || null,
    filters.courseIds.length ? `${filters.courseIds.length} ${plural(filters.courseIds.length, "wybrany kurs", "wybrane kursy", "wybranych kursów")}` : null,
    filters.q ? `„${filters.q}”` : null,
  ].filter(Boolean);

  return (
    <div className="adm-root">
      <header className="adm-top">
        <Link href="/admin?tab=newsletter" className="adm-btn adm-btn--ghost">← Lista newslettera</Link>
        <div className="adm-compose__to">
          <b>Nowa wiadomość</b>
          <span>
            do {preview ? `${total} ${plural(total, "osoby", "osób", "osób")}` : "…"}
            {summary.length > 0 && <> · {summary.join(" · ")}</>}
          </span>
        </div>
        <button type="button" className="adm-btn adm-btn--solid" disabled title="Wysyłka będzie dostępna w kolejnym kroku">
          Wyślij do {total} {plural(total, "osoby", "osób", "osób")}
        </button>
      </header>

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
