import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageComposer } from "@/components/clauwi/admin/MessageComposer";

export const metadata: Metadata = {
  title: "Nowa wiadomość — Newsletter — ClauWi®",
  robots: { index: false, follow: false },
};

// Auth + D1 are request-scoped — never prerender this route at build time.
export const dynamic = "force-dynamic";

// Composing a mailing to the people picked on the admin "Newsletter" tab.
export default async function NewsletterMessagePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin");
  return <MessageComposer kind="newsletter" />;
}
