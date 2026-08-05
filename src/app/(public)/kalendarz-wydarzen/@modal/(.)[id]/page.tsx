import { notFound } from "next/navigation";
import { CourseModal } from "@/components/clauwi/course-modal";
import { CourseDetailContent } from "@/components/clauwi/course-detail-content";
import { getCourseById, getBookedCount } from "@/lib/clauwi/courses-repo";
import { CourseUtil } from "@/lib/clauwi/courses";

export const dynamic = "force-dynamic";

export default async function CourseDetailModal({
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
    <CourseModal>
      <CourseDetailContent course={course} left={left} />
    </CourseModal>
  );
}
