"use client";

import { useEffect } from "react";

/**
 * Kadence's mobile nav drawer (the hamburger menu) is a generic "drawer
 * toggle" pattern: any element with [data-toggle-target] + [data-toggle-body-class]
 * toggles a `show-drawer`/`active` class pair on the target panel and a class
 * on <body> (for the background-shift effect) when clicked. Both the open
 * button (#mobile-toggle) and the in-drawer close button reference the same
 * target/class, so a plain click-to-toggle works for both. All of this was
 * previously handled by Kadence's navigation.min.js, which we stripped.
 */
export function MobileDrawerHydrator() {
  useEffect(() => {
    function setOpen(target: HTMLElement, bodyClass: string | undefined, open: boolean) {
      const toggles = document.querySelectorAll<HTMLElement>(
        `[data-toggle-target="#${target.id}"]`,
      );
      if (open) {
        target.classList.add("show-drawer");
        requestAnimationFrame(() => target.classList.add("active"));
      } else {
        target.classList.remove("active");
        window.setTimeout(() => target.classList.remove("show-drawer"), 300);
      }
      if (bodyClass) document.body.classList.toggle(bodyClass, open);
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
    }

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-toggle-target]");
      const overlay = (e.target as HTMLElement).closest<HTMLElement>(".drawer-overlay");
      const trigger = el || (overlay ? overlay.closest<HTMLElement>(".popup-drawer") : null);
      if (!trigger) return;

      const targetSelector = el?.getAttribute("data-toggle-target") ?? (overlay ? `#${overlay.closest(".popup-drawer")?.id}` : null);
      if (!targetSelector) return;
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (!target) return;

      e.preventDefault();
      const bodyClass = el?.getAttribute("data-toggle-body-class") ?? undefined;
      const isOpen = target.classList.contains("active");
      setOpen(target, bodyClass, !isOpen);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
