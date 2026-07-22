import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { listUpcomingCourses, getBookedCount } from "@/lib/clauwi/courses-repo";
import { CourseUtil } from "@/lib/clauwi/courses";
import type { Course } from "@/lib/clauwi/courses";

const TITLE = "Kalendarz kursów";
const DESCRIPTION = "Nadchodzące kursy i szkolenia ClauWi® — terminy, ceny, zapisy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/kalendarz-wydarzen" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/kalendarz-wydarzen", type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

// Kursy zarządzane są z panelu admina — dane muszą być zawsze aktualne.
export const dynamic = "force-dynamic";

function formatRange(od: string, doo: string) {
  const a = new Date(od.replace(" ", "T"));
  const b = new Date(doo.replace(" ", "T"));
  const fmt = (d: Date) => d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const sameDay = a.toDateString() === b.toDateString();
  return sameDay ? fmt(a) : `${fmt(a)} – ${fmt(b)}`;
}

function itemListJsonLd(courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://clauwi.pl/kalendarz-wydarzen/${c.id}`,
      name: c.nazwa,
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
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-center font-heading text-4xl font-medium uppercase text-brand md:text-5xl">
            Kalendarz kursów
          </h1>
          <p className="mt-4 text-center text-ink/75">
            Nadchodzące kursy i szkolenia — wybierz termin i zapisz się.
          </p>

          {withCounts.length === 0 ? (
            <p className="mt-16 text-center text-ink/60">Brak zaplanowanych kursów w tej chwili. Zapraszamy wkrótce!</p>
          ) : (
            <ul className="mt-12 space-y-4">
              {withCounts.map(({ course, booked }) => {
                const left = CourseUtil.spotsLeft(course, booked);
                return (
                  <li key={course.id}>
                    <Link
                      href={`/kalendarz-wydarzen/${course.id}`}
                      className="flex flex-col gap-2 rounded-[1px] border border-border p-6 transition-colors hover:border-brand sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-brand">{course.typ}</span>
                        <h2 className="font-heading text-xl font-medium text-ink">{course.nazwa}</h2>
                        <p className="mt-1 text-sm text-ink/60">
                          {formatRange(course.dataOd, course.dataDo)} · {course.miejsce}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-lg text-ink">{course.cena} zł</p>
                        <p className={`text-sm ${left === 0 ? "text-red-600" : "text-ink/60"}`}>
                          {left === 0 ? "Brak miejsc" : `Wolnych miejsc: ${left}`}
                        </p>
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
