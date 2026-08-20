"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, Search, Menu, X } from "lucide-react";
import { NAV, CONTACT } from "@/lib/clauwi/site";
import { cn } from "@/lib/utils";

// Colors lifted 1:1 from the legacy Kadence drawer (src/legacy/base.css /
// --global-palette1/8) so the mobile menu matches the homepage exactly.
// Measured off the legacy header (see the comment on SiteHeader).
const BAR_BG = "rgba(244, 180, 167, 0.94)";
const NAV_TEXT = "#692D2C";
const NAV_TEXT_ACTIVE = "#EDF2F7";
const SOCIAL_ICON = "#2D3748";
const SEARCH_ICON = "#4A5568";

const DRAWER_BG = "#090c10";
const DRAWER_TEXT = "#F7FAFC";
const DRAWER_ACTIVE = "#3182CE";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
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
 *   row 2   height 45px, social icons 17px #2D3748 centred, search on the right
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
      {/* Row 1: menu (centred) + mobile toggle. */}
      <div className="relative mx-auto flex min-h-[80px] max-w-[1242px] items-center justify-center px-4">
        <nav className="hidden min-[1025px]:block" aria-label="Główne menu">
          <ul className="flex items-center">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block border-b-2 border-transparent px-[9.69px] text-[17px] font-medium uppercase leading-[27px] transition-colors",
                    isActive(item.href) && "border-current",
                  )}
                  style={{ color: isActive(item.href) ? NAV_TEXT_ACTIVE : NAV_TEXT }}
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
          className="absolute right-6 inline-flex p-2 min-[1025px]:hidden"
          style={{ color: NAV_TEXT }}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Row 2: social icons centred, search pinned right — same as legacy.
          The bottom padding reproduces the legacy row's optical offset: its
          icons sit 5px above the row's true centre, and without this the two
          headers visibly disagree when moving between pages. */}
      <div className="relative mx-auto hidden h-[45px] max-w-[1242px] items-center justify-center gap-[22px] px-4 pb-[10px] min-[1025px]:flex">
        <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: SOCIAL_ICON }}>
          <FacebookIcon className="size-[17px]" />
        </a>
        <a href={`mailto:${CONTACT.email}`} aria-label="E-mail" style={{ color: SOCIAL_ICON }}>
          <Mail className="size-[17px]" />
        </a>
        <a href={CONTACT.phoneHref} aria-label="Telefon" style={{ color: SOCIAL_ICON }}>
          <Phone className="size-[17px]" />
        </a>

        <button
          type="button"
          aria-label="Szukaj"
          className="absolute right-2 hidden min-[1025px]:inline-flex"
          style={{ color: SEARCH_ICON }}
        >
          <Search className="size-[17px]" />
        </button>
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
            "absolute inset-y-0 right-0 flex w-full max-w-[90%] flex-col overflow-auto shadow-[0_0_2rem_0_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.77,0.2,0.05,1)]",
            open ? "translate-x-0" : "translate-x-full",
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
