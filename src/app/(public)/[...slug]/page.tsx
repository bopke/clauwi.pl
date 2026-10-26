import type { Metadata } from "next";
import "@/legacy/base.css";
import { notFound } from "next/navigation";
import { LegacyPage } from "@/components/clauwi/legacy-page";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { registry } from "@/legacy/registry";
import { staticPageMetadata } from "@/lib/clauwi/pages";

// Pages not yet rebuilt as React are prerendered from their mirrored
// WordPress HTML. Each rebuilt page gets its own route and leaves the registry.
export function generateStaticParams() {
  return Object.keys(registry).map((key) => ({ slug: key.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/");
  return registry[key] ? staticPageMetadata(key) : {};
}

export default async function LegacyRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const key = slug.join("/");
  const mod = registry[key];
  if (!mod) notFound();

  return (
    <>
      <PageJsonLd pageKey={key} />
      <LegacyPage css={mod.css} html={mod.html} bodyClass={mod.bodyClass} />
    </>
  );
}
