import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Users, Banknote, ArrowRight, CalendarX } from "lucide-react";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { listUpcomingCourses, getBookedCount } from "@/lib/clauwi/courses-repo";
import { CourseUtil } from "@/lib/clauwi/courses";
import type { Course } from "@/lib/clauwi/courses";
import { formatRange } from "@/lib/clauwi/time";

const TITLE = "Kalendarz kursów";
const DESCRIPTION = "Nadchodzące kursy i szkolenia ClauWi® — terminy, ceny, zapisy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/kalendarz-wydarzen" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/kalendarz-wydarzen", type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

// Courses are managed from the admin panel — this data must never be stale.
export const dynamic = "force-dynamic";

function itemListJsonLd(courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://clauwi.pl/kalendarz-wydarzen/${c.id}`,
      name: c.name,
    })),
  };
}

export default async function KalendarzWydarzenPage() {
  const courses = await listUpcomingCourses();
  const withCounts = await Promise.all(
    courses.map(async (c) => ({ course: c, booked: await getBookedCount(c.id) })),
  );

  return (
    <div className="flex min-h-full flex-col">
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Strona główna", url: "/" },
          { name: "Kursy", url: "/kalendarz-wydarzen" },
        ])}
      />
      {courses.length > 0 && <JsonLd data={itemListJsonLd(courses)} />}
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-center font-heading text-4xl font-medium uppercase text-brand md:text-5xl">
            Kalendarz kursów
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand/40" />
          <p className="mt-6 text-center text-ink/75">
            Nadchodzące kursy i szkolenia — wybierz termin i zapisz się.
          </p>

          {withCounts.length === 0 ? (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-[1px] border border-border px-8 py-12 text-center">
              <CalendarX className="size-8 text-brand/60" />
              <p className="text-ink/70">Brak zaplanowanych kursów w tej chwili. Zapraszamy wkrótce!</p>
              <Link href="/kontakt" className="text-sm text-brand underline decoration-brand/40 underline-offset-2 hover:text-ink">
                Napisz do nas, aby zapytać o najbliższy termin
              </Link>
            </div>
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {withCounts.map(({ course, booked }) => {
                const left = CourseUtil.spotsLeft(course, booked);
                const soldOut = left === 0;
                const lowSpots = !soldOut && left <= 3;
                return (
                  <li key={course.id}>
                    <Link
                      href={`/kalendarz-wydarzen/${course.id}`}
                      className="group flex h-full flex-col rounded-[1px] border border-border p-6 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
                    >
                      <span className="inline-block w-fit rounded-[1px] border border-brand/30 bg-brand/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                        {course.type}
                      </span>
                      <h2 className="mt-3 font-heading text-xl font-medium text-ink">{course.name}</h2>

                      <dl className="mt-4 space-y-2 text-sm text-ink/70">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="size-4 shrink-0 text-brand" />
                          <span>{formatRange(course.startsAt, course.endsAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 shrink-0 text-brand" />
                          <span>{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="size-4 shrink-0 text-brand" />
                          <span className={soldOut ? "font-medium text-red-600" : lowSpots ? "font-medium text-brand" : ""}>
                            {soldOut ? "Brak miejsc" : `Wolnych miejsc: ${left}`}
                          </span>
                        </div>
                      </dl>

                      <div className="mt-6 flex flex-1 items-end justify-between border-t border-border pt-4">
                        <span className="flex items-center gap-1.5 font-heading text-lg text-ink">
                          <Banknote className="size-4 text-brand" />
                          {course.price} zł
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-brand transition-transform group-hover:translate-x-0.5">
                          Zapisz się <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
