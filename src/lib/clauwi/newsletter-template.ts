// Templating for newsletter mailings (shared by the composer's live preview
// and, later, the sending).
//
// A message is plain text with placeholders: {{imie}}, {{kurs.miejsce}}…
// Each can carry a fallback for recipients who lack that detail (newsletter
// card sign-ups have no name or course): {{imie|Drogi Rodzicu}}.

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
  { key: "kurs.rok", label: "Rok kursu", group: "Kurs", value: (r) => r.course?.startsAt.slice(0, 4) ?? "" },
];

const BY_KEY = new Map(PLACEHOLDERS.map((p) => [p.key, p]));
const TOKEN = /\{\{\s*([\w.]+)\s*(?:\|([^}]*))?\}\}/g;

/** Placeholders used in the text that don't exist — shown as a warning. */
export function unknownPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(TOKEN)].map((m) => m[1]).filter((k) => !BY_KEY.has(k)))];
}

/** Fills the placeholders in (as plain text — escaping is the caller's job). */
export function fillTemplate(text: string, r: NewsletterRecipient): string {
  return text.replace(TOKEN, (whole, key: string, fallback?: string) => {
    const p = BY_KEY.get(key);
    if (!p) return whole;
    const v = p.value(r).trim();
    return v || (fallback ?? "").trim();
  });
}

const URL_RE = /\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)\]"']/g;

/**
 * Plain text → e-mail HTML: blank lines split paragraphs, single newlines
 * become line breaks, addresses become links. Placeholders are filled first
 * and the result escaped as a whole, values included.
 */
function bodyToHtml(text: string, r: NewsletterRecipient): string {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => {
      const html = escapeHtml(fillTemplate(para, r))
        .replace(URL_RE, (url) => `<a href="${url}" style="${EMAIL_STYLES.link}">${url}</a>`)
        .replace(/\n/g, "<br>");
      return `<p style="${EMAIL_STYLES.p}">${html}</p>`;
    })
    .join("\n");
}

/** The finished e-mail for one recipient. */
export function buildNewsletterEmail(draft: NewsletterDraft, r: NewsletterRecipient, baseUrl?: string): RenderedEmail {
  const subject = fillTemplate(draft.subject, r);
  return renderEmail(
    { subject, preheader: subject, heading: fillTemplate(draft.heading, r), body: bodyToHtml(draft.body, r) },
    { baseUrl },
  );
}
