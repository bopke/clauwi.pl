"use client";

// The writing half of the composers: subject, heading and Markdown body, the
// placeholder list and the Markdown cheatsheet (both insert at the caret).
// Used by the message composer and the automatic e-mails' editor; the owner
// keeps the draft and the preview.

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import type { NewsletterRecipient } from "@/lib/clauwi/newsletter";
import { PLACEHOLDERS, unknownPlaceholders, type NewsletterDraft } from "@/lib/clauwi/newsletter-template";

export const EMPTY_DRAFT: NewsletterDraft = {
  subject: "",
  heading: "",
  body: "Dzień dobry,\n\n",
};

type Field = keyof NewsletterDraft;

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

export function DraftEditor({
  draft,
  onChange,
  recipient,
  courseNote,
  tools,
}: {
  draft: NewsletterDraft;
  onChange: (next: NewsletterDraft) => void;
  /** Whose values the placeholder list shows next to each field. */
  recipient: NewsletterRecipient | null;
  /** Where the course fields come from, for this kind of message. */
  courseNote: string;
  /** Buttons above the fields (e.g. templates). */
  tools?: ReactNode;
}) {
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

  function update(field: Field, value: string) {
    onChange({ ...draft, [field]: value });
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

  const unknown = useMemo(() => unknownPlaceholders(`${draft.subject} ${draft.heading} ${draft.body}`), [draft]);

  return (
    <section className="adm-compose__edit">
      {tools && <div className="adm-compose__tools">{tools}</div>}
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
          Kliknij, aby wstawić w miejscu kursora. {courseNote} Gdy brakuje danych (np. zapis
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
  );
}
