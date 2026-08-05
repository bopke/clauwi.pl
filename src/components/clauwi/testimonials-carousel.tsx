"use client";

import { useEffect, useRef } from "react";
import Splide from "@splidejs/splide";
import "@splidejs/splide/css";
import "./testimonials-carousel.css";
import Link from "next/link";
import type { Testimonial } from "@/lib/clauwi/testimonials";

// Real carousel (replaces the homepage's old Kadence Testimonials block,
// which only ever worked with Kadence's own stripped JS — see
// splide-hydrator.tsx's history of a reverted attempt to hack it back to
// life via the original markup). This renders fresh, self-contained slides
// and mounts Splide directly, so it doesn't inherit any legacy CSS baggage.
export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const splide = new Splide(trackRef.current, {
      type: "loop",
      perPage: 2,
      perMove: 1,
      gap: "1.5rem",
      arrows: true,
      pagination: true,
      autoplay: true,
      interval: 7000,
      speed: 400,
      pauseOnHover: true,
      breakpoints: {
        768: { perPage: 1 },
      },
    });
    splide.mount();
    return () => {
      splide.destroy();
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={trackRef} className="splide" aria-label="Opinie o kursach ClauWi®">
        <div className="splide__track">
          <ul className="splide__list">
            {testimonials.map((t, i) => (
              <li key={i} className="splide__slide">
                <div className="flex h-full flex-col rounded-[1px] border border-border bg-white p-6">
                  <p className="font-heading text-lg font-medium text-brand">{t.title}</p>
                  <p className="mt-3 flex-1 text-sm italic text-ink/80">&ldquo;{t.content}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-ink">— {t.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/opinie"
          className="inline-flex items-center rounded-[1px] border border-brand px-6 py-2.5 text-sm uppercase tracking-wide !text-brand transition-colors hover:bg-brand hover:!text-white"
        >
          Przeczytaj więcej opinii lub napisz swoją
        </Link>
      </div>
    </div>
  );
}
