import { getCloudflareContext } from "@opennextjs/cloudflare";
import { courseBookingConfirmationEmail } from "./email-templates/course-booking-confirmation";
import { courseBookingOrganizerEmail } from "./email-templates/course-booking-organizer-notification";

type SendArgs = {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: { email: string; name?: string };
};

// Low-level Brevo transactional email send (https://api.brevo.com/v3/smtp/email).
// Requires BREVO_API_KEY and BREVO_SENDER_EMAIL (a sender verified in the
// Brevo account) — set via `wrangler secret put` in production, .dev.vars
// locally.
async function sendViaBrevo(args: SendArgs): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.BREVO_API_KEY;
  const senderEmail = env.BREVO_SENDER_EMAIL;
  const senderName = env.BREVO_SENDER_NAME || "ClauWi®";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo is not configured — missing BREVO_API_KEY or BREVO_SENDER_EMAIL");
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
      to: [{ email: args.to, name: args.toName }],
      replyTo: args.replyTo,
      subject: args.subject,
      htmlContent: args.html,
      textContent: args.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

type ContactSubmission = { name: string; email: string; message: string };

// Contact form (src/app/api/contact/route.ts) — recipient is CONTACT_FORM_TO.
// Unchanged from before this file's refactor (plain text, same subject/body).
export async function sendContactEmail(submission: ContactSubmission): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const to = env.CONTACT_FORM_TO;
  if (!to) throw new Error("Brevo is not configured — missing CONTACT_FORM_TO");

  await sendViaBrevo({
    to,
    subject: `Nowa wiadomość z formularza kontaktowego — ${submission.name}`,
    text: `Imię: ${submission.name}\nEmail: ${submission.email}\n\n${submission.message}`,
    replyTo: { email: submission.email, name: submission.name },
  });
}

type CourseBookingEmailParams = {
  customerName: string;
  customerEmail: string;
  courseName: string;
  location: string;
  startDateTime: string;
};

// Sent right after a successful course booking (src/app/(public)/kalendarz-wydarzen/actions.ts):
// one confirmation to the customer, one "new booking" notice to the course
// organizer. Text carried over verbatim from the legacy Amelia plugin's
// "customer_event_approved" / "provider_event_approved" templates — edit
// src/lib/clauwi/email-templates/*.ts to change wording, not this file.
// Organizer recipient: COURSE_ORGANIZER_EMAIL if set, else CONTACT.email.
export async function sendCourseBookingEmails(params: CourseBookingEmailParams): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const { CONTACT } = await import("./site");
  const organizerEmail = env.COURSE_ORGANIZER_EMAIL || CONTACT.email;

  const confirmation = courseBookingConfirmationEmail({
    customerName: params.customerName,
    courseName: params.courseName,
  });
  const organizerNotice = courseBookingOrganizerEmail({
    organizerName: "Iza",
    courseName: params.courseName,
    location: params.location,
    startDateTime: params.startDateTime,
  });

  await Promise.all([
    sendViaBrevo({ to: params.customerEmail, toName: params.customerName, ...confirmation }),
    sendViaBrevo({ to: organizerEmail, ...organizerNotice }),
  ]);
}
