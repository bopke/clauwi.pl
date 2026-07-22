import { getCloudflareContext } from "@opennextjs/cloudflare";

type ContactSubmission = {
  name: string;
  email: string;
  message: string;
};

// Sends a contact-form submission via Brevo's transactional email API
// (https://api.brevo.com/v3/smtp/email). Requires BREVO_API_KEY and
// BREVO_SENDER_EMAIL (a sender verified in the Brevo account) plus
// CONTACT_FORM_TO (the recipient inbox) — set via `wrangler secret put` in
// production, .dev.vars locally.
export async function sendContactEmail(submission: ContactSubmission): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.BREVO_API_KEY;
  const to = env.CONTACT_FORM_TO;
  const senderEmail = env.BREVO_SENDER_EMAIL;
  const senderName = env.BREVO_SENDER_NAME || "ClauWi® — formularz kontaktowy";

  if (!apiKey || !to || !senderEmail) {
    throw new Error(
      "Brevo is not configured — missing BREVO_API_KEY, CONTACT_FORM_TO, or BREVO_SENDER_EMAIL",
    );
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      replyTo: { email: submission.email, name: submission.name },
      subject: `Nowa wiadomość z formularza kontaktowego — ${submission.name}`,
      textContent: `Imię: ${submission.name}\nEmail: ${submission.email}\n\n${submission.message}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}
