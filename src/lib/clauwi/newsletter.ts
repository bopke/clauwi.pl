// Shared types for newsletter sign-ups (client + server).

/** One address on the admin "Newsletter" list, with where it came from. */
export type NewsletterEntry = {
  email: string;
  createdAt: string;
  /** The newsletter bar on the site, or the marketing checkbox on a course booking. */
  source: "widget" | "course";
  /** Set for course bookings only. */
  name?: string;
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
  source: "" | "widget" | "course";
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
