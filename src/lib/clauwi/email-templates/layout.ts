// Shared visual frame for every e-mail the site sends.
//
// Each template in this folder only writes its own content (a heading and a
// few paragraphs); this module wraps that content in the ClauWi® look — logo,
// salmon accent, the site's typography, footer with contact details — and
// derives the plain-text alternative from it.
//
// Why it looks like 2005 HTML: mail clients are not browsers. Gmail strips
// <style> blocks, Outlook renders through Word, and flexbox/grid are not
// dependable anywhere — so the layout is nested tables with inline styles.
// That constraint lives HERE, once, so the individual templates stay readable.

import { CONTACT, SITE } from "../site";

/** Colours and fonts mirrored from src/app/globals.css / the site header. */
const THEME = {
  brand: "#cb8c7c",
  brandDark: "#a0685a",
  ink: "#181818",
  muted: "#7c736d",
  line: "#eadfd9",
  page: "#faf7f5",
  card: "#ffffff",
  // Webfonts are unreliable in mail clients, so both stacks fall back to
  // widely installed faces with a similar feel to Cormorant/Montserrat.
  heading: "'Cormorant Garamond', Cormorant, Georgia, 'Times New Roman', serif",
  body: "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const;

export type EmailContent = {
  subject: string;
  /** The grey preview line mail clients show next to the subject. */
  preheader?: string;
  heading: string;
  /** HTML fragment — paragraphs, lists, links. Styling comes from here. */
  body: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * Works out which host the e-mail's logo and links should point at.
 *
 * Priority: an explicit EMAIL_BASE_URL binding, then the host the request
 * actually came in on, and only then the production domain. The middle step
 * matters: until the DNS cutover, clauwi.pl still serves the old WordPress
 * site and 404s on /brand/email-logo.png, so a build deployed to
 * staging.clauwi.pl has to advertise itself, not the domain it will one day
 * own. After the cutover this keeps working with no config change.
 *
 * Pure so it can be tested without a request — see scripts/preview-emails.ts.
 */
export function resolveEmailBaseUrl(args: {
  configured?: string;
  host?: string | null;
  protocol?: string | null;
}): string {
  if (args.configured) return args.configured.replace(/\/$/, "");

  const host = args.host?.trim();
  // A localhost URL is useless in someone's inbox — fall back to production.
  if (host && !/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)) {
    return `${args.protocol ?? "https"}://${host}`;
  }

  return SITE.url;
}

export type RenderOptions = {
  /**
   * Base URL for links and for the logo. Defaults to the production domain,
   * but until the DNS cutover clauwi.pl still serves the old WordPress site
   * and does NOT have /brand/email-logo.png — so while we're on staging this
   * has to point there, or the logo arrives broken. brevo.ts reads it from
   * the EMAIL_BASE_URL binding.
   */
  baseUrl?: string;
  /** Overrides just the logo (the preview script points it at a local file). */
  logoUrl?: string;
};

/** Paragraph, list and link styles the templates can reuse verbatim. */
export const EMAIL_STYLES = {
  p: `margin: 0 0 16px; font-family: ${THEME.body}; font-size: 15px; line-height: 1.7; color: ${THEME.ink};`,
  small: `margin: 0 0 16px; font-family: ${THEME.body}; font-size: 13px; line-height: 1.6; color: ${THEME.muted};`,
  link: `color: ${THEME.brand};`,
} as const;

/**
 * A highlighted details block (date, place, price…) — used by several
 * templates, kept here so they all look identical.
 */
export function detailsBox(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (r) => `
        <tr>
          <td style="padding: 4px 12px 4px 0; font-family: ${THEME.body}; font-size: 12px; letter-spacing: 0.6px; text-transform: uppercase; color: ${THEME.muted}; white-space: nowrap; vertical-align: top;">${r.label}</td>
          <td style="padding: 4px 0; font-family: ${THEME.body}; font-size: 15px; color: ${THEME.ink};">${r.value}</td>
        </tr>`,
    )
    .join("");

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 20px; background-color: ${THEME.page}; border: 1px solid ${THEME.line};">
    <tr>
      <td style="padding: 16px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">${cells}</table>
      </td>
    </tr>
  </table>`;
}

export function renderEmail(content: EmailContent, opts: RenderOptions = {}): RenderedEmail {
  const preheader = content.preheader ?? "";
  const year = SITE.name;
  const baseUrl = (opts.baseUrl ?? SITE.url).replace(/\/$/, "");
  const logoUrl = opts.logoUrl ?? `${baseUrl}/brand/email-logo.png`;

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${THEME.page};">
  <span style="display: none; max-height: 0; overflow: hidden; opacity: 0; visibility: hidden;">${escapeHtml(preheader)}</span>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${THEME.page};">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width: 600px; max-width: 100%; background-color: ${THEME.card}; border: 1px solid ${THEME.line};">

          <!-- logo -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <img src="${logoUrl}" width="88" height="88" alt="${escapeHtml(SITE.name)}" style="display: block; width: 88px; height: 88px; border: 0;">
              </a>
            </td>
          </tr>

          <!-- heading -->
          <tr>
            <td align="center" style="padding: 0 32px;">
              <h1 style="margin: 0; font-family: ${THEME.heading}; font-size: 26px; line-height: 1.3; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: ${THEME.brand};">${escapeHtml(content.heading)}</h1>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 16px auto 0;">
                <tr><td style="width: 56px; height: 1px; background-color: ${THEME.brand}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- body -->
          <tr>
            <td style="padding: 28px 32px 8px;">${content.body}</td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding: 8px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="height: 1px; background-color: ${THEME.line}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
              <p style="margin: 20px 0 0; font-family: ${THEME.body}; font-size: 12px; line-height: 1.8; color: ${THEME.muted}; text-align: center;">
                <strong style="color: ${THEME.brandDark};">${escapeHtml(year)}</strong> — ${escapeHtml(SITE.tagline)}<br>
                <a href="mailto:${CONTACT.email}" style="color: ${THEME.muted};">${CONTACT.email}</a> &nbsp;·&nbsp;
                <a href="${CONTACT.phoneHref}" style="color: ${THEME.muted};">${CONTACT.phone}</a><br>
                <a href="${baseUrl}" style="color: ${THEME.brand};">clauwi.pl</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: content.subject, html, text: toPlainText(content) };
}

/**
 * Plain-text alternative, derived from the same content so the two can't drift
 * apart. Sending text/plain alongside the HTML keeps spam filters happy and
 * covers clients with images and HTML turned off.
 */
function toPlainText(content: EmailContent): string {
  const body = content.body
    .replace(/<br\s*\/?>/gi, "\n")
    // Details boxes are two-column tables — render them as "Label: value".
    .replace(/<\/td>\s*<td[^>]*>/gi, ": ")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, "")
    .replace(/<\/(p|h[1-6]|div)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/[ \t]+\n/g, "\n")
    // Table markup leaves the indentation of the source HTML behind.
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return [
    content.heading.toUpperCase(),
    "",
    body,
    "",
    "—",
    `${SITE.name} — ${SITE.tagline}`,
    `${CONTACT.email} · ${CONTACT.phone}`,
    SITE.url,
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
