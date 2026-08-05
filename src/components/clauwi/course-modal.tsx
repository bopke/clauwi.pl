"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

// Chrome for the intercepted course-detail route (@modal/(.)[id]) — an
// overlay on top of the course list, closable via backdrop click, Escape, or
// the × button. Closing goes back to /kalendarz-wydarzen via router.back()
// rather than a hardcoded href, so the list's scroll position is preserved.
export function CourseModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10 sm:py-16"
      onClick={close}
    >
      <div
        className="relative w-full max-w-2xl rounded-[1px] bg-white p-6 shadow-xl sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Zamknij"
          className="absolute right-4 top-4 text-ink/40 transition-colors hover:text-brand"
        >
          <X className="size-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
