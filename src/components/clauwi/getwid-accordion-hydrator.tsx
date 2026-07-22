"use client";

import { useEffect } from "react";

/**
 * Getwid's Accordion block (used by the FAQ page) is built on jQuery UI
 * Accordion, stripped along with all other WordPress JS. Without it every
 * item stays permanently collapsed — including the first one, which
 * `data-active-element="0"` says should be open by default. This restores
 * click-to-toggle and the initial open item, without pulling in jQuery UI.
 *
 * The original +/− icons are Font Awesome glyphs (a webfont dependency) and
 * are replaced with a plain CSS chevron (see mirror.mjs CSS_FIXUPS) driven by
 * the `is-open` class this hydrator toggles on the header wrapper.
 */
export function GetwidAccordionHydrator() {
  useEffect(() => {
    const accordions = document.querySelectorAll<HTMLElement>(".wp-block-getwid-accordion");

    function toggle(headerWrapper: HTMLElement, open: boolean) {
      const content = headerWrapper.nextElementSibling as HTMLElement | null;
      if (!content?.classList.contains("wp-block-getwid-accordion__content-wrapper")) return;
      content.classList.toggle("ui-accordion-content-active", open);
      headerWrapper.classList.toggle("is-open", open);
    }

    const cleanups: Array<() => void> = [];
    accordions.forEach((accordion) => {
      const headers = Array.from(accordion.querySelectorAll<HTMLElement>(":scope > .wp-block-getwid-accordion__header-wrapper"));
      const activeIndex = Number(accordion.dataset.activeElement ?? "-1");
      headers.forEach((h, i) => toggle(h, i === activeIndex));

      function onClick(e: Event) {
        const header = (e.target as HTMLElement).closest<HTMLElement>(".wp-block-getwid-accordion__header-wrapper");
        if (!header || !headers.includes(header)) return;
        e.preventDefault();
        toggle(header, !header.classList.contains("is-open"));
      }
      accordion.addEventListener("click", onClick);
      cleanups.push(() => accordion.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
