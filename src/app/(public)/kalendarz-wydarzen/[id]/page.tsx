import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/clauwi/site-header";
import { SiteFooter } from "@/components/clauwi/site-footer";
import { JsonLd } from "@/components/clauwi/json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { CourseDetailContent } from "@/components/clauwi/course-detail-content";
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

          <div className="mt-4">
            <CourseDetailContent course={course} left={left} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
