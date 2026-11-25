import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageComposer } from "@/components/clauwi/admin/MessageComposer";

export const metadata: Metadata = {
  title: "Powiadomienie o kursie — ClauWi®",
  robots: { index: false, follow: false },
};

// Auth + D1 are request-scoped — never prerender this route at build time.
export const dynamic = "force-dynamic";

// Writing to people who asked for a course in their town (admin "Zapytania" tab).
export default async function RequestMessagePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin");
  return <MessageComposer kind="request" />;
}
