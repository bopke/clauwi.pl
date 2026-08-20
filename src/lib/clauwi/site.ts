// Central site config for the ClauWi® public site — nav, contact, brand.
// Extracted 1:1 from the live Kadence site so links/paths stay identical.

export const CONTACT = {
  email: "iza@naturalnamama.pl",
  phone: "666 538 731",
  phoneHref: "tel:+48666538731",
  facebook: "https://www.facebook.com/ClauWi.szkola.noszenia",
} as const;

export type NavItem = { label: string; href: string };

// Primary navigation — same order and destinations as the current site.
// Note: "Kursy" points at the events calendar, "Doradcy" at the advisor list.
export const NAV: NavItem[] = [
  { label: "Strona główna", href: "/" },
  { label: "O nas", href: "/o-nas" },
  { label: "System kształcenia", href: "/system-ksztalcenia" },
  { label: "Zasady naboru", href: "/regulamin-i-zasady-naboru" },
  { label: "Blog", href: "/blog" },
  { label: "Kursy", href: "/kalendarz-wydarzen" },
  { label: "Doradcy", href: "/o-nas/lista-doradcow" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "FAQ", href: "/faq" },
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
