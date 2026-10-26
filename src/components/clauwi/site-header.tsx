"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV, CONTACT } from "@/lib/clauwi/site";
import { cn } from "@/lib/utils";

// Colors lifted 1:1 from the legacy Kadence drawer (src/legacy/base.css /
// --global-palette1/8) so the mobile menu matches the homepage exactly.
// Measured off the legacy header (see the comment on SiteHeader).
const BAR_BG = "rgba(244, 180, 167, 0.94)";
const NAV_TEXT = "#692D2C";
const NAV_TEXT_ACTIVE = "#EDF2F7";
const SOCIAL_ICON = "#2D3748";
const TOGGLE_ICON = "#4A5568";
const BRAND_TEXT = "#1A202C";

const DRAWER_BG = "#090c10";
const DRAWER_TEXT = "#F7FAFC";
const DRAWER_ACTIVE = "#3182CE";

// The legacy header's own Kadence icon set, so the glyphs match exactly.
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M31.997 15.999c0-8.836-7.163-15.999-15.999-15.999s-15.999 7.163-15.999 15.999c0 7.985 5.851 14.604 13.499 15.804v-11.18h-4.062v-4.625h4.062v-3.525c0-4.010 2.389-6.225 6.043-6.225 1.75 0 3.581 0.313 3.581 0.313v3.937h-2.017c-1.987 0-2.607 1.233-2.607 2.498v3.001h4.437l-0.709 4.625h-3.728v11.18c7.649-1.2 13.499-7.819 13.499-15.804z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M15 2h-14c-0.55 0-1 0.45-1 1v10c0 0.55 0.45 1 1 1h14c0.55 0 1-0.45 1-1v-10c0-0.55-0.45-1-1-1zM5.831 9.773l-3 2.182c-0.1 0.073-0.216 0.108-0.33 0.108-0.174 0-0.345-0.080-0.455-0.232-0.183-0.251-0.127-0.603 0.124-0.786l3-2.182c0.251-0.183 0.603-0.127 0.786 0.124s0.127 0.603-0.124 0.786zM13.955 11.831c-0.11 0.151-0.282 0.232-0.455 0.232-0.115 0-0.23-0.035-0.33-0.108l-3-2.182c-0.251-0.183-0.307-0.534-0.124-0.786s0.535-0.307 0.786-0.124l3 2.182c0.251 0.183 0.307 0.535 0.124 0.786zM13.831 4.955l-5.5 4c-0.099 0.072-0.215 0.108-0.331 0.108s-0.232-0.036-0.331-0.108l-5.5-4c-0.251-0.183-0.307-0.534-0.124-0.786s0.535-0.307 0.786-0.124l5.169 3.759 5.169-3.759c0.251-0.183 0.603-0.127 0.786 0.124s0.127 0.603-0.124 0.786z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 28" fill="currentColor" className={className} aria-hidden>
      <path d="M7.25 22c0-0.688-0.562-1.25-1.25-1.25s-1.25 0.562-1.25 1.25 0.562 1.25 1.25 1.25 1.25-0.562 1.25-1.25zM10.5 19.5v-11c0-0.266-0.234-0.5-0.5-0.5h-8c-0.266 0-0.5 0.234-0.5 0.5v11c0 0.266 0.234 0.5 0.5 0.5h8c0.266 0 0.5-0.234 0.5-0.5zM7.5 6.25c0-0.141-0.109-0.25-0.25-0.25h-2.5c-0.141 0-0.25 0.109-0.25 0.25s0.109 0.25 0.25 0.25h2.5c0.141 0 0.25-0.109 0.25-0.25zM12 6v16c0 1.094-0.906 2-2 2h-8c-1.094 0-2-0.906-2-2v-16c0-1.094 0.906-2 2-2h8c1.094 0 2 0.906 2 2z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 13h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1zM3 7h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1zM3 19h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1z" />
    </svg>
  );
}

/**
 * Global site header for the hand-built pages (course calendar, advisor
 * directory, 404). The legacy-mirrored pages carry the original Kadence
 * header inside their own HTML, so this one has to match it rather than
 * invent its own look — every value below was measured off the rendered
 * legacy header (`#masthead` on /o-nas) at 1440px:
 *
 *   row 1   min-height 80px, nav centred, links 17px/500 uppercase #692D2C
 *   row 2   height 45px, social icons 17px #2D3748 centred
 *   bar     rgba(244,180,167,0.94), static (it scrolls away, not sticky)
 *   width   content capped at 1242px
 *   break   desktop layout from 1025px up — Kadence's own breakpoint, one
 *           pixel off Tailwind's `lg`, which left 1024px-wide screens showing
 *           the desktop bar here and the mobile bar on every other page
 *
 * If the legacy header ever changes, re-measure rather than eyeballing it.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Pick the single most specific nav item matching the current path (e.g.
  // on /o-nas/lista-doradcow, "Doradcy" wins over the shorter "O nas" prefix)
  // instead of highlighting every href that happens to be a prefix.
  const activeHref = NAV
    .filter((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const isActive = (href: string) => href === activeHref;

  // Lock background scroll while the drawer is open — same effect as the
  // legacy drawer's body-class toggle.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header className="relative z-50" style={{ backgroundColor: BAR_BG }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-1.5 focus:top-1.5 focus:z-[100001] focus:bg-white focus:px-6 focus:py-4 focus:text-sm focus:font-bold focus:text-[#21759b]"
      >
        Skip to content
      </a>
      {/* Row 1: menu (centred) + mobile toggle. */}
      <div className="relative mx-auto flex min-h-[80px] max-w-[1242px] items-center justify-center px-4">
        {/* Phone-only brand — the legacy header shows the site title on the left below 768px (not on tablets). */}
        <Link
          href="/"
          className="absolute left-6 font-heading text-[26px] font-bold leading-[31.2px] min-[768px]:hidden"
          style={{ color: BRAND_TEXT }}
        >
          CLAUWI®
        </Link>
        <nav className="hidden min-[1025px]:block" aria-label="Główne menu">
          <ul className="flex items-center">
            {NAV.map((item) => (
              <li key={item.href}>
                {/* Kadence's "underline" nav style: on hover and on the current
                    page the link turns light and a 2px line grows from the
                    centre under the label (not under the side padding). */}
                <Link
                  href={item.href}
                  className={cn(
                    "relative block px-[9.69px] text-[17px] font-medium uppercase leading-[27.2px] text-(--nav-text) transition-colors hover:text-(--nav-text-active)",
                    "after:absolute after:inset-x-[9.69px] after:bottom-0 after:h-[2px] after:scale-0 after:bg-current after:transition-transform hover:after:scale-100",
                    isActive(item.href) && "text-(--nav-text-active) after:scale-100",
                  )}
                  style={{ "--nav-text": NAV_TEXT, "--nav-text-active": NAV_TEXT_ACTIVE } as React.CSSProperties}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-6 inline-flex rounded-[3px] px-[8.4px] py-[5.6px] min-[1025px]:hidden"
          style={{ color: TOGGLE_ICON }}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>

      {/* Row 2: social icons centred, as 34px buttons 5.1px apart — same as
          legacy. The 34px button row sits at the top of the 45px row, which
          puts the icons 5px above its true centre, exactly where the legacy
          header has them. */}
      <div className="relative mx-auto hidden h-[45px] max-w-[1242px] items-start justify-center gap-[5.1px] px-4 min-[1025px]:flex">
        <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex size-[34px] items-center justify-center" style={{ color: SOCIAL_ICON }}>
          <FacebookIcon className="size-[17px]" />
        </a>
        <a href={`mailto:${CONTACT.email}`} aria-label="E-mail" className="flex size-[34px] items-center justify-center" style={{ color: SOCIAL_ICON }}>
          <EmailIcon className="size-[17px]" />
        </a>
        <a href={CONTACT.phoneHref} aria-label="Telefon" className="flex size-[34px] items-center justify-center" style={{ color: SOCIAL_ICON }}>
          <PhoneIcon className="size-[17px]" />
        </a>
      </div>

      {/* Mobile full-screen drawer — matches the homepage's legacy Kadence drawer. */}
      <div
        className={cn(
          "fixed inset-0 z-[100000] min-[1025px]:hidden",
          open ? "" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200 ease-in-out",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-[90%] flex-col overflow-auto transition-transform duration-300 ease-[cubic-bezier(0.77,0.2,0.05,1)]",
            // The shadow only while open — otherwise it bleeds in at the screen edge.
            open ? "translate-x-0 shadow-[0_0_2rem_0_rgba(0,0,0,0.1)]" : "translate-x-full",
          )}
          style={{ background: DRAWER_BG, color: DRAWER_TEXT }}
        >
          <div className="flex min-h-[calc(1.2em+24px)] justify-end px-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zamknij menu"
              className="flex items-center p-[0.6em] text-inherit"
            >
              <X className="size-6" />
            </button>
          </div>
          <nav className="px-6 pb-6" aria-label="Menu mobilne">
            <ul>
              {NAV.map((item) => (
                <li key={item.href} className="border-b border-white/10">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block w-full py-[0.6em] text-sm"
                    style={isActive(item.href) ? { color: DRAWER_ACTIVE } : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
