// A testimonial sent through the form on /opinie, forwarded to the ClauWi®
// inbox (CONTACT_FORM_TO). Reply-To is the author when they gave an e-mail.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export function opinionFormEmail(params: {
  name: string;
  course: string;
  email: string;
  opinion: string;
}): EmailContent {
  const { name, course, email, opinion } = params;
  const author = name || "(bez podpisu)";
  return {
    subject: `Nowa opinia z formularza — ${author}`,
    preheader: course ? `${author}, ${course}` : author,
    heading: "Nowa opinia o kursie",
    body: `
${detailsBox([
  { label: "Imię i nazwisko", value: escapeAndBreak(author) },
  ...(course ? [{ label: "Kurs", value: escapeAndBreak(course) }] : []),
  ...(email ? [{ label: "E-mail", value: `<a href="mailto:${email}" style="${S.link}">${email}</a>` }] : []),
])}
<p style="${S.p}">${escapeAndBreak(opinion)}</p>
<p style="${S.small}">Opinie na stronie /opinie są dodawane ręcznie — ta wiadomość niczego nie publikuje.</p>`,
  };
}

/** Visitor-supplied text goes into HTML — escape it, then keep the line breaks. */
function escapeAndBreak(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br>");
}
