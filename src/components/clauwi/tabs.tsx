"use client";

import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; title: string; content: React.ReactNode };

/**
 * Kadence's vertical tabs, as on /strona-glowna/system-ksztalcenia: titles
 * in a 30% column, the active panel beside them. Below 768px it becomes an
 * accordion (each title directly above its panel) — what the original site
 * did on phones; the WordPress mirror had lost that and showed only the
 * first panel.
 *
 * Each title keeps the id it had in WordPress, and a matching URL hash
 * (/strona-glowna/system-ksztalcenia#refresh) opens that tab.
 */
export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fromHash = () => {
      const i = tabs.findIndex((t) => `#${t.id}` === window.location.hash);
      if (i >= 0) setActive(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  return (
    <div
      className="grid grid-cols-1 min-[768px]:grid-cols-[30%_70%] min-[768px]:[grid-template-rows:var(--rows)]"
      // Titles take one row each; the trailing 1fr row absorbs a panel taller
      // than the title column, so the titles keep their spacing.
      style={{ "--rows": `repeat(${tabs.length}, auto) 1fr` } as React.CSSProperties}
    >
      {tabs.map((tab, i) => {
        const isActive = i === active;
        return (
          <Fragment key={tab.id}>
            <button
              type="button"
              id={tab.id}
              aria-expanded={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActive(i)}
              className={cn(
                "relative -mr-px mb-1 flex cursor-pointer items-center border p-[15px] text-left text-[22px] leading-[35px] min-[768px]:col-start-1 min-[768px]:row-start-(--row)",
                // Only the active title sits above the panel; the panel's border
                // covers the others' right edge, as in the original.
                isActive
                  ? "z-[4] border-[#bbb] bg-[#cb8c7c] text-black"
                  : "border-[#692d2c] bg-[#f7fafc] text-[#692d2c] hover:border-[#bbb] hover:bg-[#cb8c7c] hover:text-[#444]",
              )}
              // Declared exactly as the original: the font never loaded there
              // either, so it falls back to the browser's default serif.
              style={{ fontFamily: '"Ubuntu Condensed"', "--row": i + 1 } as React.CSSProperties}
            >
              {tab.title}
            </button>
            <div
              id={`${tab.id}-panel`}
              hidden={!isActive}
              className="relative z-[1] min-h-[695px] border-2 border-[#cb8c7c] bg-white p-[22px] min-[768px]:col-start-2 min-[768px]:row-start-1 min-[768px]:row-end-(--end)"
              style={{ "--end": tabs.length + 2 } as React.CSSProperties}
            >
              {tab.content}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
