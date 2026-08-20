// The message the contact form (src/app/api/contact/route.ts) forwards to the
// ClauWi® inbox. Goes to CONTACT_FORM_TO, with Reply-To set to the visitor,
// so hitting reply answers them directly.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, detailsBox, type EmailContent } from "./layout";

export function contactFormEmail(params: {
  name: string;
  email: string;
  message: string;
}): EmailContent {
  const { name, email, message } = params;
  return {
    subject: `Nowa wiadomość z formularza kontaktowego — ${name}`,
    preheader: `Od: ${name} (${email})`,
    heading: "Wiadomość z formularza",
    body: `
${detailsBox([
  { label: "Od", value: name },
  { label: "E-mail", value: `<a href="mailto:${email}" style="${S.link}">${email}</a>` },
])}
<p style="${S.p}">${escapeAndBreak(message)}</p>
<p style="${S.small}">Odpowiedź na tę wiadomość trafi bezpośrednio do nadawcy.</p>`,
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
