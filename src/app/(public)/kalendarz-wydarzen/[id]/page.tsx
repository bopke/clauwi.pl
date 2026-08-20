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
import { formatRange, localSqlToDate } from "@/lib/clauwi/time";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) return { title: "Kurs" };
  const title = course.name;
  const description = `${course.type} — ${formatRange(course.startsAt, course.endsAt, { withTime: true })}, ${course.location}. Cena: ${course.price} zł. Zapisz się na kurs ClauWi®.`;
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
    name: course.name,
    description: course.description || `${course.type} — kurs Szkoły Noszenia ClauWi®.`,
    provider: { "@type": "EducationalOrganization", name: "ClauWi®", sameAs: "https://clauwi.pl" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: course.location.toLowerCase().includes("online") ? "online" : "onsite",
      startDate: localSqlToDate(course.startsAt).toISOString(),
      endDate: localSqlToDate(course.endsAt).toISOString(),
      location: course.location.toLowerCase().includes("online")
        ? undefined
        : { "@type": "Place", name: course.location },
    },
    offers: {
      "@type": "Offer",
      price: course.price,
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
  if (!course || !course.active) notFound();

  const booked = await getBookedCount(course.id);
  const left = CourseUtil.spotsLeft(course, booked);

  return (
    <div className="flex min-h-full flex-col">
      <JsonLd data={courseJsonLd(course)} />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Strona główna", url: "/" },
          { name: "Kursy", url: "/kalendarz-wydarzen" },
          { name: course.name, url: `/kalendarz-wydarzen/${course.id}` },
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
