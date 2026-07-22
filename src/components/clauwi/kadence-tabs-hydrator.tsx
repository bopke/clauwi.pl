"use client";

import { useEffect } from "react";

/**
 * Kadence's "Tabs" block (wp-block-kadence-tabs) shows/hides its panels
 * entirely via JavaScript we stripped when mirroring — without it, every
 * panel renders stacked and visible at once (e.g. system-ksztalcenia showed
 * all 6 tabs' content simultaneously, ~2.5x the intended page height).
 *
 * This restores real click-to-switch behavior for any Kadence tabs block
 * present in mirrored content, mounted once for the whole document.
 */
export function KadenceTabsHydrator() {
  useEffect(() => {
    const containers = document.querySelectorAll(".wp-block-kadence-tabs");
    const cleanups: Array<() => void> = [];

    containers.forEach((container) => {
      const titleItems = Array.from(container.querySelectorAll<HTMLElement>(".kt-title-item"));
      const panels = Array.from(container.querySelectorAll<HTMLElement>(".wp-block-kadence-tab"));
      if (!titleItems.length || !panels.length) return;

      function activate(tabNum: string) {
        titleItems.forEach((li) => {
          const a = li.querySelector("a[data-tab]");
          const isActive = a?.getAttribute("data-tab") === tabNum;
          li.classList.toggle("kt-tab-title-active", isActive);
          li.classList.toggle("kt-tab-title-inactive", !isActive);
        });
        panels.forEach((panel) => {
          const match = panel.className.match(/kt-inner-tab-(\d+)\b/);
          panel.style.display = match && match[1] === tabNum ? "" : "none";
        });
      }

      const initialActive = titleItems.find((li) => li.classList.contains("kt-tab-title-active"));
      const initialTab = initialActive?.querySelector("a[data-tab]")?.getAttribute("data-tab") || "1";
      activate(initialTab);

      function onClick(e: Event) {
        const a = (e.target as HTMLElement).closest?.("a[data-tab]");
        if (!a || !container.contains(a)) return;
        e.preventDefault();
        const tabNum = a.getAttribute("data-tab");
        if (tabNum) activate(tabNum);
      }
      container.addEventListener("click", onClick);
      cleanups.push(() => container.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
