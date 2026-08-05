"use client";

import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TestimonialsCarousel } from "./testimonials-carousel";
import { TESTIMONIALS } from "@/lib/clauwi/testimonials";

// The homepage's legacy mirrored HTML has an empty
// <div id="testimonials-carousel-slot"> where the old (broken, JS-stripped)
// Kadence Testimonials carousel used to be — see scripts that generated
// src/legacy/home.ts. Since that slot lives outside React's own render tree
// (it's raw dangerouslySetInnerHTML content), mount a real React root into
// it directly rather than trying to hydrate/replace it in place. No-op on
// any page without the slot.
export function TestimonialsCarouselMount() {
  useEffect(() => {
    const slot = document.getElementById("testimonials-carousel-slot");
    if (!slot) return;
    const root: Root = createRoot(slot);
    root.render(<TestimonialsCarousel testimonials={TESTIMONIALS} />);
    return () => root.unmount();
  }, []);

  return null;
}
