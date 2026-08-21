// Central site config for the ClauWi® public site — nav, contact, brand.
// Extracted 1:1 from the live Kadence site so links/paths stay identical.

export const CONTACT = {
  // The school's own address. Was iza@naturalnamama.pl (a different business
  // of the owner's) until 2026-08-21 — anything user-facing goes here, and it
  // is also the fallback recipient for course-booking notifications.
  email: "kontakt@clauwi.pl",
  phone: "666 538 731",
  phoneHref: "tel:+48666538731",
  facebook: "https://www.facebook.com/ClauWi.szkola.noszenia",
} as const;

export type NavItem = { label: string; href: string };

// Primary navigation — same order and destinations as the legacy Kadence
// header, which the hand-built SiteHeader has to mirror exactly.
//
// The paths are the ORIGINAL WordPress ones, not tidied-up versions: two
// pages live under /strona-glowna/, and "Zasady naboru" really is spelled
// "regulam-i-zasady-naboru" (a typo in the original site). Cleaning those up
// here just produces 404s, since the mirrored pages are served at the URLs
// they had in WordPress — verified against the legacy header's own hrefs.
//
// Note: "Kursy" points at the events calendar, "Doradcy" at the advisor list.
export const NAV: NavItem[] = [
  { label: "Strona główna", href: "/" },
  { label: "O nas", href: "/o-nas" },
  { label: "System kształcenia", href: "/strona-glowna/system-ksztalcenia" },
  { label: "Zasady naboru", href: "/regulam-i-zasady-naboru" },
  { label: "Blog", href: "/blog" },
  { label: "Kursy", href: "/kalendarz-wydarzen" },
  { label: "Doradcy", href: "/o-nas/lista-doradcow" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "FAQ", href: "/strona-glowna/faq" },
];

export const SITE = {
  name: "CLAUWI®",
  // Absolute base URL — needed anywhere a relative path won't do, e.g. images
  // and links inside e-mails.
  url: "https://clauwi.pl",
  tagline: "Szkoła doradców noszenia",
  projectCredit: { label: "Bit-Art Studio", href: "http://www.facebook.com/a.warywocka" },
  careCredit: { label: "Bopke.dev", href: "https://bopke.dev/" },
} as const;
