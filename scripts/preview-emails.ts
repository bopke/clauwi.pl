// Renders every e-mail template to HTML files you can open in a browser, so
// wording and styling can be checked without sending anything through Brevo.
//
//   npx tsx scripts/preview-emails.ts
//
// Output lands in .email-previews/ (gitignored). Sample data only — nothing
// touches the database, Brevo, or any real inbox.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { courseBookingConfirmationEmail } from "../src/lib/clauwi/email-templates/course-booking-confirmation";
import { courseBookingOrganizerEmail } from "../src/lib/clauwi/email-templates/course-booking-organizer-notification";
import { courseBookingConfirmedEmail, courseBookingCancelledEmail } from "../src/lib/clauwi/email-templates/course-booking-status-update";
import { courseBookingUpdatedEmail } from "../src/lib/clauwi/email-templates/course-booking-updated";
import { courseBookingRemovedEmail } from "../src/lib/clauwi/email-templates/course-booking-removed";
import { contactFormEmail } from "../src/lib/clauwi/email-templates/contact-form";
import { renderEmail } from "../src/lib/clauwi/email-templates/layout";

const course = {
  customerName: "Anna Kowalska",
  courseName: "Kurs podstawowy WARSZAWA",
  location: "Warszawa, ul. Obozowa 56",
  dateTime: "5 października 2026, 10:00–17:00",
};

const templates = {
  "01-booking-confirmation": courseBookingConfirmationEmail({ ...course, price: 2500, seats: 2 }),
  "02-organizer-notification": courseBookingOrganizerEmail({
    organizerName: "Iza",
    courseName: course.courseName,
    location: course.location,
    startDateTime: course.dateTime,
    customerName: course.customerName,
    customerEmail: "anna@example.com",
    customerPhone: "600 100 200",
    seats: 2,
    message: "Przyjadę z mężem, czy jest parking w pobliżu?",
  }),
  "03-status-confirmed": courseBookingConfirmedEmail(course),
  "04-status-cancelled": courseBookingCancelledEmail(course),
  "05-booking-updated": courseBookingUpdatedEmail({
    ...course,
    changes: [
      { label: "Liczba osób", from: "2", to: "3" },
      { label: "Telefon", from: "", to: "600 100 200" },
    ],
  }),
  "06-booking-removed": courseBookingRemovedEmail(course),
  "07-contact-form": contactFormEmail({
    name: "Marta Nowak",
    email: "marta@example.com",
    message: "Dzień dobry,\nczy planujecie kurs w Krakowie jesienią?\n\nPozdrawiam,\nMarta",
  }),
};

const dir = ".email-previews";
mkdirSync(dir, { recursive: true });

const index: string[] = [];
for (const [name, content] of Object.entries(templates)) {
  // Point the logo at the file on disk so the preview shows it even though
  // clauwi.pl doesn't serve it yet.
  const { subject, html, text } = renderEmail(content, {
    logoUrl: `file://${resolve("public/brand/email-logo.png")}`,
  });
  writeFileSync(`${dir}/${name}.html`, html);
  writeFileSync(`${dir}/${name}.txt`, `Subject: ${subject}\n\n${text}`);
  index.push(`<li><a href="${name}.html">${name}</a> — ${subject} (<a href="${name}.txt">plain text</a>)</li>`);
  console.log(`${name}  →  ${subject}`);
}

writeFileSync(
  `${dir}/index.html`,
  `<!DOCTYPE html><meta charset="utf-8"><title>Podgląd e-maili ClauWi®</title>
<body style="font-family: system-ui; padding: 32px; line-height: 1.8">
<h1>Podgląd e-maili</h1><ul>${index.join("")}</ul></body>`,
);
console.log(`\nOpen ${dir}/index.html`);
