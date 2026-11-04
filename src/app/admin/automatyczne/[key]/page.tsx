import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AutomationEditor } from "@/components/clauwi/admin/AutomationEditor";
import { AUTOMATION_KEYS, type AutomationKey } from "@/lib/clauwi/automations";

export const metadata: Metadata = {
  title: "Wiadomość automatyczna — ClauWi®",
  robots: { index: false, follow: false },
};

// Auth + D1 are request-scoped — never prerender this route at build time.
export const dynamic = "force-dynamic";

// Settings and wording of one automatic e-mail (admin "Automatyczne" tab).
export default async function AutomationPage({ params }: { params: Promise<{ key: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin");
  const { key } = await params;
  if (!AUTOMATION_KEYS.includes(key as AutomationKey)) redirect("/admin?tab=automatyczne");
  return <AutomationEditor automationKey={key as AutomationKey} />;
}
