import { SITE } from "@/lib/clauwi/site";
import { NewsletterBanner } from "./newsletter-banner";

const YEAR = 2026; // Date.now() unavailable at build in this env; matches live "© 2026".

/**
 * Global footer — a single centred copyright line on white, no nav, no
 * contacts. Metrics measured off the legacy footer so the hand-built pages
 * and the mirrored ones end up exactly the same height (121px at desktop):
 * 30px outer padding, a 27px line with 17px margins above and below, text at
 * 17px/27.2px Cormorant Garamond, links in #3182CE.
 * The newsletter band sits right above it, so it shows on every public page.
 */
export function SiteFooter() {
  return (
    <>
      <div className="mt-auto">
        <NewsletterBanner />
      </div>
      <footer className="bg-white py-[30px] text-center">
        <p className="my-[17px] font-heading text-[17px] leading-[27.2px] text-ink">
          © {YEAR} {SITE.name} Projekt -{" "}
          <a
            href={SITE.projectCredit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3182CE] underline-offset-2 hover:underline"
          >
            {SITE.projectCredit.label}
          </a>
          , Opieka i adaptacja -{" "}
          <a
            href={SITE.careCredit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3182CE] underline-offset-2 hover:underline"
          >
            {SITE.careCredit.label}
          </a>
        </p>
      </footer>
    </>
  );
}
