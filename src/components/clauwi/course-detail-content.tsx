import { BookingForm } from "@/components/clauwi/booking-form";
import type { Course } from "@/lib/clauwi/courses";
import { formatRange } from "@/lib/clauwi/time";

// Shared between the full course-detail page (/kalendarz-wydarzen/[id], used
// for direct links, SEO, and non-JS fallback) and the intercepted modal
// route (@modal/(.)[id]) that overlays the course list on client-side nav.
export function CourseDetailContent({ course, left }: { course: Course; left: number }) {
  return (
    <>
      <span className="block text-xs font-semibold uppercase tracking-wide text-brand">{course.type}</span>
      <h1 className="font-heading text-3xl font-medium text-ink md:text-4xl">{course.name}</h1>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-[1px] border border-border p-6 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Termin</dt>
          <dd className="mt-1 text-sm text-ink">{formatRange(course.startsAt, course.endsAt, { withTime: true })}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Miejsce</dt>
          <dd className="mt-1 text-sm text-ink">{course.location}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Cena</dt>
          <dd className="mt-1 text-sm text-ink">{course.price} zł</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Wolne miejsca</dt>
          <dd className={`mt-1 text-sm ${left === 0 ? "text-red-600" : "text-ink"}`}>
            {left} / {course.capacity}
          </dd>
        </div>
      </dl>

      {course.description && <p className="mt-8 whitespace-pre-line text-ink/80">{course.description}</p>}

      <h2 className="mt-12 font-heading text-2xl font-medium text-brand">Zapisz się</h2>
      <div className="mt-6">
        <BookingForm courseId={course.id} spotsLeft={left} />
      </div>
    </>
  );
}
