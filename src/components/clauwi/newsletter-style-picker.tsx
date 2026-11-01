"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { NEWSLETTER_STYLES, forgetDismissed, getStyle, setStyle, subscribe, wasDismissed, type NewsletterStyle } from "./newsletter-store";

/**
 * Staging-only switcher for the newsletter bar's candidate styles, living in
 * the staging bar. "Pokaż" brings the bar back after it's been dismissed.
 * Goes away together with the losing styles once one is picked.
 */
export function NewsletterStylePicker() {
  const style = useSyncExternalStore(subscribe, getStyle, () => 1 as NewsletterStyle);
  const dismissed = useSyncExternalStore(subscribe, wasDismissed, () => false);

  return (
    <div className="flex items-center gap-1 normal-case tracking-normal">
      <span className="mr-1 max-[639px]:hidden">Newsletter:</span>
      {NEWSLETTER_STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          title={s.name}
          onClick={() => {
            setStyle(s.id);
            forgetDismissed();
          }}
          className={cn(
            "h-5 min-w-5 cursor-pointer rounded-sm px-1 text-[11px] font-bold",
            style === s.id ? "bg-white text-orange-600" : "bg-orange-600/60 text-white hover:bg-orange-700",
          )}
        >
          {s.id}
          <span className="max-[899px]:hidden"> {s.name}</span>
        </button>
      ))}
      {dismissed && (
        <button type="button" onClick={forgetDismissed} className="ml-1 cursor-pointer rounded-sm bg-orange-700 px-1.5 text-[11px] hover:bg-orange-800">
          Pokaż
        </button>
      )}
    </div>
  );
}
