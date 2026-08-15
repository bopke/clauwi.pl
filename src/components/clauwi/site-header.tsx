"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, Search, Menu, X } from "lucide-react";
import { NAV, CONTACT } from "@/lib/clauwi/site";
import { cn } from "@/lib/utils";

// Colors lifted 1:1 from the legacy Kadence drawer (src/legacy/base.css /
// --global-palette1/8) so the mobile menu matches the homepage exactly.
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
 * Global site header — matches the live Kadence design.
 * - `overlay` (homepage): transparent salmon over the hero image.
 * - default (inner pages): solid salmon bar.
 * Two rows: menu + search (row 1), icon-only socials centered (row 2). No logo.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Lock background scroll while the drawer is open — same effect as the
  // legacy drawer's body-class toggle.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header
      className={cn(
        "z-50 text-ink",
        overlay
          ? "absolute inset-x-0 top-0 bg-[rgba(239,166,147,0.76)]"
          : "sticky top-0 bg-[#f4b4a7]",
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Row 1: menu (centered) + search (right) + mobile toggle */}
        <div className="relative flex items-center justify-center py-3">
          <nav className="hidden lg:block" aria-label="Główne menu">
            <ul className="flex items-center gap-6">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wide text-ink/90 transition-colors hover:text-white",
                      isActive(item.href) && "underline decoration-2 underline-offset-8",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search (visual parity; wired later) */}
          <button
            type="button"
            aria-label="Szukaj"
            className="absolute right-0 hidden p-2 text-ink hover:text-white lg:inline-flex"
          >
            <Search className="size-5" />
          </button>

          {/* Mobile: hamburger right-aligned block */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="absolute right-0 inline-flex p-2 text-ink lg:hidden"
            aria-label={open ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Row 2: icon-only socials, centered */}
        <div className="flex items-center justify-center gap-6 pb-3">
          <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ink hover:text-white">
            <FacebookIcon className="size-5" />
          </a>
          <a href={`mailto:${CONTACT.email}`} aria-label="E-mail" className="text-ink hover:text-white">
            <Mail className="size-5" />
          </a>
          <a href={CONTACT.phoneHref} aria-label="Telefon" className="text-ink hover:text-white">
            <Phone className="size-5" />
          </a>
        </div>
      </div>

      {/* Mobile full-screen drawer — matches the homepage's legacy Kadence drawer. */}
      <div
        className={cn(
          "fixed inset-0 z-[100000] lg:hidden",
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
