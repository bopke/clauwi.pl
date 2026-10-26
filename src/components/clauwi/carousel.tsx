"use client";

import { Children, useRef } from "react";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" className="size-4" aria-hidden>
      {direction === "left" ? (
        <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z" />
      ) : (
        <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
      )}
    </svg>
  );
}

/**
 * Full-width slides with prev/next arrows, styled after the original
 * Stackable carousel (white round arrows over the slides). Uses native
 * horizontal scrolling with snap points, so swiping works too; the arrows
 * move one slide. In the WordPress mirror the arrows did nothing.
 */
export function Carousel({ children, label }: { children: React.ReactNode; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const step = (slide?.offsetWidth ?? track.clientWidth) + 30;
    const max = track.scrollWidth - track.clientWidth;
    // Wrap around at either end, like the original carousel's loop.
    const next = track.scrollLeft + dir * step;
    track.scrollTo({ left: next > max + 1 ? 0 : next < -1 ? max : next, behavior: "smooth" });
  };

  return (
    <div className="mb-4 min-[768px]:mb-6" role="region" aria-roledescription="karuzela" aria-label={label}>
      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-[30px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Children.map(children, (child) => (
            <div className="w-full shrink-0 snap-start">{child}</div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Poprzedni slajd"
            className="pointer-events-auto flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-black opacity-90"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Następny slajd"
            className="pointer-events-auto flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-black opacity-90"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
      {/* The original reserved this space for slide dots. */}
      <div className="mt-3 min-h-6" />
    </div>
  );
}
