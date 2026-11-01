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
