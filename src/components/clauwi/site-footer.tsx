import { SITE } from "@/lib/clauwi/site";

const YEAR = 2026; // Date.now() unavailable at build in this env; matches live "© 2026".

/**
 * Global footer — matches the live site: a single centered copyright line
 * on a white background, in the serif display font. No nav, no contacts.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto bg-white py-8 text-center">
      <p className="font-heading text-lg text-ink">
        © {YEAR} {SITE.name} Projekt -{" "}
        <a
          href={SITE.projectCredit.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0a58ca] underline-offset-2 hover:underline"
        >
          {SITE.projectCredit.label}
        </a>
        , Opieka -{" "}
        <a
          href={SITE.careCredit.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0a58ca] underline-offset-2 hover:underline"
        >
          {SITE.careCredit.label}
        </a>
      </p>
    </footer>
  );
}
