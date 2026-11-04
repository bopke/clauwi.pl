// Shared types for newsletter sign-ups (client + server).

/** One address on the admin "Newsletter" list, with where it came from. */
export type NewsletterEntry = {
  email: string;
  createdAt: string;
  /**
   * The newsletter bar on the site, an imported list, the marketing checkbox
   * on a course booking, or restored in the panel at the person's request.
   */
  source: "widget" | "import" | "course" | "admin";
  name?: string;
  /** Imports only: the import's label. */
  importLabel?: string;
  /** Course bookings only. */
  courseId?: string;
  courseName?: string;
  courseType?: string;
  courseStartsAt?: string;
};

export const NEWSLETTER_PAGE_SIZE = 50;

/** Filters of the admin list; empty strings mean "any". */
export type NewsletterQuery = {
  page: number;
  q: string;
  source: "" | "widget" | "import" | "course";
  courseType: string;
  /** Picked in the course picker; empty means any course. */
  courseIds: string[];
};

export type NewsletterPage = {
  entries: NewsletterEntry[];
  /** Entries matching the filters, across all pages. */
  total: number;
  /** Distinct addresses among them (someone can come from several courses). */
  uniqueEmails: number;
};

/** A course someone consented through — an option in the course picker. */
export type NewsletterCourse = {
  id: string;
  name: string;
  type: string;
  location: string;
  startsAt: string;
  endsAt: string;
  /** Bookings on it with marketing consent. */
  consents: number;
};

/** The list filters without the page — what a mailing is addressed to. */
export type NewsletterFilters = Omit<NewsletterQuery, "page">;

/**
 * One person a mailing goes to. Someone on the list several times (the card
 * plus courses, or several courses) is one recipient; their course is the
 * most recent matching one — that's what the template's course fields show.
 */
export type NewsletterRecipient = {
  email: string;
  firstName: string;
  lastName: string;
  course: { name: string; type: string; location: string; startsAt: string; endsAt: string } | null;
};

/** One address from an imported file. `consentAt`: "YYYY-MM-DD HH:MM:SS" or "" (unknown → import time). */
export type ImportRow = { email: string; firstName: string; lastName: string; consentAt: string };

/** Rows sent per import request. */
export const IMPORT_CHUNK = 500;

export type NewsletterImport = {
  id: string;
  label: string;
  fileName: string;
  consentBasis: string;
  added: number;
  existing: number;
  suppressed: number;
  createdBy: string;
  createdAt: string;
  undoneAt: string;
};
