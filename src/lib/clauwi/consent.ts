// Wording of the consents the site collects, kept in one place: the forms
// show it and the consent log (migrations/0017) stores it with every consent
// given, so it can later be shown exactly what someone agreed to.
//
// Changing a text here changes the form AND what new log entries record —
// earlier entries keep the wording they were given under.

/** The checkbox on the newsletter card (src/components/clauwi/newsletter-banner.tsx). */
export const NEWSLETTER_CONSENT_TEXT = "Wyrażam zgodę na otrzymywanie newslettera zgodnie z polityką prywatności.";

/** The optional checkbox on the course booking form (src/components/clauwi/booking-form.tsx). */
export const BOOKING_MARKETING_CONSENT_TEXT = "Chcę otrzymywać e-mailem informacje o kolejnych kursach i ofertach ClauWi® (opcjonalnie).";

/** The button on the unsubscribe page that undoes an unsubscribe. */
export const RESUBSCRIBE_TEXT = "To pomyłka — zapisz mnie ponownie";

/**
 * Where a consent entry came from. Grants: widget, booking, import,
 * resubscribe, admin-restore. Withdrawals: the suppression reasons.
 */
export type ConsentSource =
  | "widget" | "booking" | "import" | "resubscribe" | "admin-restore"
  | "link" | "one-click" | "admin" | "provider-unsubscribe" | "provider-spam" | "provider-bounce";

export type ConsentEntry = {
  action: "granted" | "withdrawn";
  source: ConsentSource;
  ref: string;
  wording: string;
  ip: string;
  note: string;
  createdAt: string;
};

/** Polish labels for the admin panel. */
export const CONSENT_SOURCE_LABELS: Record<ConsentSource, string> = {
  widget: "Widżet newslettera",
  booking: "Zapis na kurs",
  import: "Import",
  resubscribe: "Ponowny zapis ze strony wypisu",
  "admin-restore": "Przywrócone w panelu",
  link: "Link „wypisz się” w wiadomości",
  "one-click": "Przycisk „wypisz” w programie pocztowym",
  admin: "Usunięte w panelu",
  "provider-unsubscribe": "Wypis przez Brevo",
  "provider-spam": "Zgłoszenie spamu",
  "provider-bounce": "Adres nie istnieje (odbicie)",
};
