import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MailingView } from "@/components/clauwi/admin/MailingView";

export const metadata: Metadata = {
  title: "Wysyłka — ClauWi®",
  robots: { index: false, follow: false },
};

// Auth + D1 are request-scoped — never prerender this route at build time.
export const dynamic = "force-dynamic";

// One sent (or sending) message: progress, controls and its recipients.
export default async function MailingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin");
  const { id } = await params;
  return <MailingView id={id} />;
}
