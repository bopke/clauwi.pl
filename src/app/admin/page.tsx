import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminApp } from "@/components/clauwi/admin/AdminApp";
import { AdminLogin } from "@/components/clauwi/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Panel administracyjny — ClauWi®",
  robots: { index: false, follow: false },
};

// Auth + D1 are request-scoped — never prerender this route at build time.
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [session, sp] = await Promise.all([auth(), searchParams]);

  if (!session?.user?.email) {
    return <AdminLogin denied={!!sp.error} />;
  }

  const u = session.user;
  return <AdminApp user={{ email: u.email!, name: u.name ?? null, image: u.image ?? null }} />;
}
