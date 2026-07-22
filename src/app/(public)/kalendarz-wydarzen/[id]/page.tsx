import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { BookingForm } from "@/components/clauwi/booking-form";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { getCourseById, getBookedCount } from "@/lib/clauwi/courses-repo";
import { CourseUtil } from "@/lib/clauwi/courses";
import type { Course } from "@/lib/clauwi/courses";

export const dynamic = "force-dynamic";

function formatRange(od: string, doo: string) {
  const a = new Date(od.replace(" ", "T"));
  const b = new Date(doo.replace(" ", "T"));
  const fmtDate = (d: Date) => d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (d: Date) => d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  const sameDay = a.toDateString() === b.toDateString();
  return sameDay
    ? `${fmtDate(a)}, ${fmtTime(a)}–${fmtTime(b)}`
    : `${fmtDate(a)} – ${fmtDate(b)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) return { title: "Kurs" };
  const title = course.nazwa;
  const description = `${course.typ} — ${formatRange(course.dataOd, course.dataDo)}, ${course.miejsce}. Cena: ${course.cena} zł. Zapisz się na kurs ClauWi®.`;
  const url = `/kalendarz-wydarzen/${id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

function courseJsonLd(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.nazwa,
    description: course.opis || `${course.typ} — kurs Szkoły Noszenia ClauWi®.`,
    provider: { "@type": "EducationalOrganization", name: "ClauWi®", sameAs: "https://clauwi.pl" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: course.miejsce.toLowerCase().includes("online") ? "online" : "onsite",
      startDate: course.dataOd.replace(" ", "T"),
      endDate: course.dataDo.replace(" ", "T"),
      location: course.miejsce.toLowerCase().includes("online")
        ? undefined
        : { "@type": "Place", name: course.miejsce },
    },
    offers: {
      "@type": "Offer",
      price: course.cena,
      priceCurrency: "PLN",
      availability: "https://schema.org/InStock",
      url: `https://clauwi.pl/kalendarz-wydarzen/${course.id}`,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course || !course.aktywny) notFound();

  const booked = await getBookedCount(course.id);
  const left = CourseUtil.spotsLeft(course, booked);

  return (
    <div className="flex min-h-full flex-col">
      <JsonLd data={courseJsonLd(course)} />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Strona główna", url: "/" },
          { name: "Kursy", url: "/kalendarz-wydarzen" },
          { name: course.nazwa, url: `/kalendarz-wydarzen/${course.id}` },
        ])}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <Link href="/kalendarz-wydarzen" className="text-sm text-ink/60 hover:text-brand">
            ← Wszystkie kursy
          </Link>

          <span className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand">{course.typ}</span>
          <h1 className="font-heading text-3xl font-medium text-ink md:text-4xl">{course.nazwa}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-[1px] border border-border p-6 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink/50">Termin</dt>
              <dd className="mt-1 text-sm text-ink">{formatRange(course.dataOd, course.dataDo)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink/50">Miejsce</dt>
              <dd className="mt-1 text-sm text-ink">{course.miejsce}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink/50">Cena</dt>
              <dd className="mt-1 text-sm text-ink">{course.cena} zł</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink/50">Wolne miejsca</dt>
              <dd className={`mt-1 text-sm ${left === 0 ? "text-red-600" : "text-ink"}`}>{left} / {course.limitMiejsc}</dd>
            </div>
          </dl>

          {course.opis && <p className="mt-8 whitespace-pre-line text-ink/80">{course.opis}</p>}

          <h2 className="mt-12 font-heading text-2xl font-medium text-brand">Zapisz się</h2>
          <div className="mt-6">
            <BookingForm courseId={course.id} spotsLeft={left} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
