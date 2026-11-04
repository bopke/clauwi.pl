// Automatic e-mails (migrations/0021) — shared types and descriptions.

import type { NewsletterDraft } from "./newsletter-template";

export type AutomationKey = "welcome" | "course-reminder" | "course-thanks" | "course-next-step";

export const AUTOMATION_KEYS: AutomationKey[] = ["welcome", "course-reminder", "course-thanks", "course-next-step"];

export type AutomationOptions = {
  /** course-next-step: only after courses of this type ("" = any). */
  afterType?: string;
  /** course-next-step: skip people who have since booked a course of this type ("" = any later course). */
  skipIfType?: string;
};

export type Automation = NewsletterDraft & {
  key: AutomationKey;
  enabled: boolean;
  days: number;
  options: AutomationOptions;
  enabledAt: string;
  updatedBy: string;
  updatedAt: string;
  /** E-mails sent in the last 30 days. */
  sent30d: number;
};

export type AutomationSend = { email: string; ref: string; status: string; error: string; createdAt: string };

/** Panel copy for each automation: name, when it goes out, who gets it. */
export const AUTOMATION_INFO: Record<AutomationKey, { name: string; when: (days: number) => string; who: string; marketing: boolean; daysLabel?: string }> = {
  welcome: {
    name: "Powitanie w newsletterze",
    when: () => "zaraz po potwierdzeniu zapisu na newsletter",
    who: "Osoby, które zapisały się przez widżet na stronie i kliknęły link potwierdzający.",
    marketing: true,
  },
  "course-reminder": {
    name: "Przypomnienie przed kursem",
    when: (d) => `${d} ${d === 1 ? "dzień" : "dni"} przed rozpoczęciem kursu`,
    who: "Wszyscy zapisani na kurs (bez anulowanych). Osoba zapisana na ostatnią chwilę dostaje je kilka godzin po zapisie.",
    marketing: false,
    daysLabel: "Ile dni przed kursem",
  },
  "course-thanks": {
    name: "Podziękowanie po kursie",
    when: (d) => `${d} ${d === 1 ? "dzień" : "dni"} po zakończeniu kursu`,
    who: "Uczestnicy z potwierdzonym zgłoszeniem.",
    marketing: false,
    daysLabel: "Ile dni po kursie",
  },
  "course-next-step": {
    name: "Propozycja kolejnego kursu",
    when: (d) => `${d} ${d === 1 ? "dzień" : "dni"} po zakończeniu kursu`,
    who: "Uczestnicy z potwierdzonym zgłoszeniem, którzy zgodzili się na oferty i się nie wypisali. To wiadomość marketingowa — ma link do wypisania.",
    marketing: true,
    daysLabel: "Ile dni po kursie",
  },
};
