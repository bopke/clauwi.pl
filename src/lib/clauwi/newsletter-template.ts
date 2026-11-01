// Templating for messages written in the admin panel — newsletter mailings
// and messages to a course's participants. Shared by the composer's live
// preview and the sending, so what's previewed is what goes out.
//
// A message is Markdown with placeholders: {{imie}}, {{kurs.miejsce}}…
// Each can carry a fallback for recipients who lack that detail (newsletter
// card sign-ups have no name or course): {{imie|Drogi Rodzicu}}.
//
// Markdown goes through `marked` with every element rendered with inline
// styles (mail clients drop <style>), raw HTML escaped rather than passed
// through, and only http(s)/mailto/tel links allowed.

import { Marked, type Tokens } from "marked";
import { escapeHtml, EMAIL_STYLES, renderEmail, type RenderedEmail } from "./email-templates/layout";
import type { NewsletterRecipient } from "./newsletter";

export type NewsletterDraft = { subject: string; heading: string; body: string };

const MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

/** "2019-05-19 10:00" → "19 maja 2019". */
function longDate(sql: string): string {
  const [y, m, d] = sql.slice(0, 10).split("-").map(Number);
  return d ? `${d} ${MONTHS[m - 1]} ${y}` : "";
}

/** Location field usually holds the full address; the first part is the town. */
function town(location: string): string {
  return location.split(",")[0].trim();
}

type Placeholder = {
  key: string;
  label: string;
  group: "Osoba" | "Kurs";
  value: (r: NewsletterRecipient) => string;
};

export const PLACEHOLDERS: Placeholder[] = [
  { key: "imie", label: "Imię", group: "Osoba", value: (r) => r.firstName },
  { key: "nazwisko", label: "Nazwisko", group: "Osoba", value: (r) => r.lastName },
  { key: "email", label: "Adres e-mail", group: "Osoba", value: (r) => r.email },
  { key: "kurs.nazwa", label: "Nazwa kursu", group: "Kurs", value: (r) => r.course?.name ?? "" },
  { key: "kurs.rodzaj", label: "Rodzaj kursu", group: "Kurs", value: (r) => r.course?.type ?? "" },
  { key: "kurs.miasto", label: "Miejscowość kursu", group: "Kurs", value: (r) => (r.course ? town(r.course.location) : "") },
  { key: "kurs.miejsce", label: "Pełny adres kursu", group: "Kurs", value: (r) => r.course?.location ?? "" },
  { key: "kurs.data", label: "Data rozpoczęcia", group: "Kurs", value: (r) => (r.course ? longDate(r.course.startsAt) : "") },
  { key: "kurs.data_koniec", label: "Data zakończenia", group: "Kurs", value: (r) => (r.course ? longDate(r.course.endsAt || r.course.startsAt) : "") },
  { key: "kurs.godzina", label: "Godzina rozpoczęcia", group: "Kurs", value: (r) => r.course?.startsAt.slice(11, 16) ?? "" },
  { key: "kurs.rok", label: "Rok kursu", group: "Kurs", value: (r) => r.course?.startsAt.slice(0, 4) ?? "" },
];

const BY_KEY = new Map(PLACEHOLDERS.map((p) => [p.key, p]));
const TOKEN = /\{\{\s*([\w.]+)\s*(?:\|([^}]*))?\}\}/g;

/** Placeholders used in the text that don't exist — shown as a warning. */
export function unknownPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(TOKEN)].map((m) => m[1]).filter((k) => !BY_KEY.has(k)))];
}

/** Fills the placeholders in; `escape` is applied to each inserted value. */
export function fillTemplate(text: string, r: NewsletterRecipient, escape: (s: string) => string = (s) => s): string {
  return text.replace(TOKEN, (whole, key: string, fallback?: string) => {
    const p = BY_KEY.get(key);
    if (!p) return whole;
    const v = p.value(r).trim();
    return escape(v || (fallback ?? "").trim());
  });
}

const BRAND = "#cb8c7c";
const INK = "#181818";
const MUTED = "#7c736d";
const HEADING_FONT = "'Cormorant Garamond', Cormorant, Georgia, 'Times New Roman', serif";
const BODY_FONT = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const SAFE_URL = /^(https?:|mailto:|tel:)/i;

// The cheatsheet in the composer lists what this supports — keep them in step.
const markdown = new Marked({
  gfm: true,
  // A single newline is a line break, as people expect from a plain textarea.
  breaks: true,
  renderer: {
    paragraph({ tokens }) {
      return `<p style="${EMAIL_STYLES.p}">${this.parser.parseInline(tokens)}</p>\n`;
    },
    heading({ tokens, depth }) {
      const size = depth <= 1 ? 24 : depth === 2 ? 21 : 18;
      return `<h${depth} style="margin: 24px 0 10px; font-family: ${HEADING_FONT}; font-size: ${size}px; line-height: 1.3; font-weight: 600; color: ${BRAND};">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
    list(token) {
      const tag = token.ordered ? "ol" : "ul";
      const items = token.items.map((item) => this.listitem(item)).join("");
      return `<${tag} style="margin: 0 0 16px; padding-left: 24px; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.7; color: ${INK};">${items}</${tag}>\n`;
    },
    listitem(item: Tokens.ListItem) {
      return `<li style="margin: 0 0 6px;">${this.parser.parse(item.tokens)}</li>`;
    },
    blockquote({ tokens }) {
      return `<blockquote style="margin: 0 0 16px; padding: 4px 0 4px 16px; border-left: 3px solid ${BRAND}; color: ${MUTED};">${this.parser.parse(tokens)}</blockquote>\n`;
    },
    hr() {
      return `<hr style="margin: 24px 0; border: 0; border-top: 1px solid #eadfd9;">\n`;
    },
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!SAFE_URL.test(href)) return text;
      return `<a href="${escapeHtml(href)}" style="${EMAIL_STYLES.link}">${text}</a>`;
    },
    image({ href, text }) {
      if (!/^https?:/i.test(href)) return escapeHtml(text);
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" style="display: block; max-width: 100%; height: auto; margin: 0 0 16px; border: 0;">`;
    },
    strong({ tokens }) {
      return `<strong>${this.parser.parseInline(tokens)}</strong>`;
    },
    em({ tokens }) {
      return `<em>${this.parser.parseInline(tokens)}</em>`;
    },
    codespan({ text }) {
      return `<code style="font-family: Menlo, Consolas, monospace; font-size: 13px; background: #faf7f5; padding: 1px 4px;">${text}</code>`;
    },
    code({ text }) {
      return `<pre style="margin: 0 0 16px; padding: 12px; background: #faf7f5; font-family: Menlo, Consolas, monospace; font-size: 13px; white-space: pre-wrap;">${escapeHtml(text)}</pre>\n`;
    },
    // Raw HTML in the message is shown as text, never rendered.
    html({ text }) {
      return escapeHtml(text);
    },
  },
});

/** Backslash-escapes Markdown syntax, so a filled-in value is always literal text. */
function escapeMarkdown(s: string): string {
  return s.replace(/[\\`*_{}\[\]()#+\-.!|<>~]/g, "\\$&");
}

/** Markdown → e-mail HTML, placeholders filled in first (as literal text). */
function bodyToHtml(text: string, r: NewsletterRecipient): string {
  return markdown.parse(fillTemplate(text.replace(/\r\n/g, "\n"), r, escapeMarkdown), { async: false });
}

/** The recipient's unsubscribe page (see migrations/0016). */
export function unsubscribeUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, "")}/newsletter/wypisz/${token}`;
}

/**
 * The finished e-mail for one recipient. Newsletter mailings pass the
 * recipient's unsubscribe link (footer line); messages to course participants
 * are about their booking and go without.
 */
export function buildMessageEmail(
  draft: NewsletterDraft,
  r: NewsletterRecipient,
  opts: { baseUrl: string; unsubscribeUrl?: string },
): RenderedEmail {
  const subject = fillTemplate(draft.subject, r);
  // No heading of its own → repeat the subject, the layout needs one.
  const heading = fillTemplate(draft.heading, r).trim() || subject;
  return renderEmail({ subject, preheader: subject, heading, body: bodyToHtml(draft.body, r) }, opts);
}
