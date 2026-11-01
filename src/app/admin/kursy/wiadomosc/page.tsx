import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageComposer } from "@/components/clauwi/admin/MessageComposer";

export const metadata: Metadata = {
  title: "Wiadomość do uczestników — ClauWi®",
  robots: { index: false, follow: false },
};

// Auth + D1 are request-scoped — never prerender this route at build time.
export const dynamic = "force-dynamic";

// Writing to participants ticked on a course's booking list (admin "Kursy" tab).
export default async function CourseMessagePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin");
  return <MessageComposer kind="course" />;
}
