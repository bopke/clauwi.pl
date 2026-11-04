// "Confirm your sign-up" — sent when someone signs up through the newsletter
// card on the site (double opt-in, migrations/0022). Until the link is used
// the address is not on the list.
//
// Edit the strings below; the frame comes from layout.ts.

import { EMAIL_STYLES as S, escapeHtml, type EmailContent } from "./layout";

export function newsletterConfirmEmail(params: { confirmUrl: string }): EmailContent {
  const url = escapeHtml(params.confirmUrl);
  return {
    subject: "Potwierdź zapis na newsletter ClauWi®",
    preheader: "Jedno kliknięcie i gotowe.",
    heading: "Potwierdź zapis",
    body: `
<p style="${S.p}">Dzień dobry,</p>
<p style="${S.p}">dziękujemy za zapis na newsletter Szkoły Noszenia ClauWi®. Kliknij poniższy przycisk, aby potwierdzić, że to Twój adres:</p>
<p style="margin: 24px 0; text-align: center;">
  <a href="${url}" style="display: inline-block; padding: 12px 28px; background-color: #cb8c7c; color: #ffffff; font-family: Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none;">Potwierdzam zapis</a>
</p>
<p style="${S.small}">Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki: <a href="${url}" style="${S.link}">${url}</a></p>
<p style="${S.small}">Jeśli to nie Ty zapisałeś(-aś) ten adres, po prostu zignoruj tę wiadomość — bez potwierdzenia nie zapiszemy go ani nie wyślemy nic więcej. Link jest ważny 7 dni.</p>`,
  };
}
