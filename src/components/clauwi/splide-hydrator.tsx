"use client";

import { useEffect } from "react";
import Splide from "@splidejs/splide";

/**
 * Kadence carousels (homepage image gallery, each blog post's "Similar Posts"
 * row) are Splide.js sliders configured entirely through data-* attributes,
 * initialized by WordPress JS we stripped. Without it they fall back to a
 * static CSS grid — fine when there are ≤3 items, but wrapping into multiple
 * rows once there are more (verified: the LIVE site does the same with JS
 * disabled — this isn't a regression, just an unfinished progressive
 * enhancement). Mounting the real Splide library here restores the intended
 * single-row carousel with working arrows/dots.
 *
 * NOTE: this only handles carousels that already ship real Splide markup
 * (.splide__track > .splide__list > .splide__slide), which covers the blog
 * "Similar Posts" row. The homepage/opinie testimonial carousel
 * (`kt-blocks-carousel-init kb-gallery-carousel`) has NO such markup —
 * Kadence's JS builds it from flat children at runtime. A prior attempt to
 * replicate that DOM construction here fixed mobile but badly broke the
 * 768–1024px range (slides rendered 194px × 3859px), so it was reverted;
 * that carousel is a known, accepted visual gap for now.
 */
export function SplideHydrator() {
  useEffect(() => {
    const instances: Splide[] = [];

    document.querySelectorAll<HTMLElement>(".splide:not(.is-initialized)").forEach((el) => {
      const d = el.dataset;
      const perPage = Number(d.columnsXxl || d.columnsXl || 3);
      const splide = new Splide(el, {
        type: d.sliderLoop === "true" ? "loop" : "slide",
        perPage,
        perMove: Number(d.sliderScroll || 1),
        gap: `${d.sliderGutter || 0}px`,
        arrows: d.sliderArrows === "true",
        pagination: d.sliderDots === "true",
        autoplay: d.sliderAuto === "true",
        interval: Number(d.sliderSpeed || 5000),
        speed: Number(d.sliderAnimSpeed || 400),
        pauseOnHover: d.sliderHoverPause === "true",
        breakpoints: {
          1200: { perPage: Number(d.columnsXl || perPage) },
          996: { perPage: Number(d.columnsMd || perPage) },
          768: { perPage: Number(d.columnsSm || perPage) },
          576: { perPage: Number(d.columnsXs || perPage) },
          400: { perPage: Number(d.columnsSs || 1) },
        },
      });
      splide.mount();
      instances.push(splide);

      // Kadence's own CSS-grid no-JS fallback classes on .splide__list
      // (grid-cols grid-*-col-N) are MORE specific than Splide's plain
      // `.splide__list{display:flex}` rule, so they keep winning even after
      // Splide mounts. Splide manages this element entirely now — drop them.
      const list = el.querySelector(".splide__list");
      list?.classList.forEach((c) => {
        if (c === "grid-cols" || /^grid-.*-col-\d+$/.test(c)) list.classList.remove(c);
      });
    });

    return () => instances.forEach((s) => s.destroy());
  }, []);

  return null;
}
