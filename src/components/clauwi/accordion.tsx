"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AccordionItem = { title: React.ReactNode; content: React.ReactNode };

/**
 * The FAQ accordion, styled after the original Getwid block: bordered rows,
 * link-coloured titles and a chevron that points down when closed and up
 * when open. Items open and close independently; `defaultOpen` lists the
 * ones open on load. Closed panels use hidden="until-found", so the
 * browser's find-in-page still searches them and opens the matching one.
 */
export function Accordion({ items, defaultOpen = [0] }: { items: AccordionItem[]; defaultOpen?: number[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onBeforeMatch = (e: Event) => {
      const i = Number((e.target as HTMLElement).dataset.index);
      setOpen((prev) => new Set(prev).add(i));
    };
    root.addEventListener("beforematch", onBeforeMatch);
    return () => root.removeEventListener("beforematch", onBeforeMatch);
  }, []);

  return (
    <div ref={rootRef}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const panelId = `accordion-panel-${i}`;
        return (
          <div key={i}>
            <h3 className={cn("border border-[#eee] font-[inherit] text-[length:inherit] font-normal leading-[inherit]", i > 0 && "border-t-0")}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="group flex w-full cursor-pointer items-center justify-between px-[12.75px] py-[8.5px] text-left text-[#3182ce] hover:text-[#2b6cb0] focus-visible:text-[#2b6cb0]"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "ml-[0.75em] size-2 shrink-0 border-r-2 border-b-2 border-current transition-transform duration-200 ease-in-out",
                    isOpen ? "-rotate-[135deg]" : "rotate-45",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              data-index={i}
              hidden={isOpen ? undefined : ("until-found" as unknown as boolean)}
              className="border border-t-0 border-[#eee] p-[25.5px]"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
