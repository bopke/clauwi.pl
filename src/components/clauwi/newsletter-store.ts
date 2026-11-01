"use client";

// Browser-side state of the newsletter bar: whether this visitor dismissed it
// and — while the styles are being evaluated on staging — which style to show.
// Both live in localStorage; a window event keeps the bar and the staging
// picker in sync within the page.

export const NEWSLETTER_STYLES = [
  { id: 1, name: "Terakota" },
  { id: 2, name: "Karta" },
  { id: 3, name: "Minimal" },
  { id: 4, name: "Bordo" },
  { id: 5, name: "Szary pas" },
] as const;
export type NewsletterStyle = (typeof NEWSLETTER_STYLES)[number]["id"];

const DISMISSED_KEY = "clauwi-newsletter-dismissed";
const STYLE_KEY = "clauwi-newsletter-style";
const EVENT = "clauwi-newsletter-change";

// Storage can be missing or throw (private mode, blocked site data) — then
// the bar simply shows again on the next visit.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const wasDismissed = () => read(DISMISSED_KEY) != null;
export const rememberDismissed = () => write(DISMISSED_KEY, new Date().toISOString());
export const forgetDismissed = () => write(DISMISSED_KEY, null);

export function getStyle(): NewsletterStyle {
  const n = Number(read(STYLE_KEY));
  return NEWSLETTER_STYLES.some((s) => s.id === n) ? (n as NewsletterStyle) : 1;
}
export const setStyle = (style: NewsletterStyle) => write(STYLE_KEY, String(style));
