import type { Metadata } from "next";
import "@/legacy/base.css";
import { notFound } from "next/navigation";
import { LegacyPage } from "@/components/clauwi/legacy-page";
import { JsonLd } from "@/components/clauwi/json-ld";
import { registry } from "@/legacy/registry";
import { SEO_DESCRIPTIONS } from "@/lib/clauwi/seo-descriptions";
import { cleanMirroredTitle } from "@/lib/clauwi/seo";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { FAQ_ITEMS } from "@/lib/clauwi/faq-data";
import { getBlogPostMeta } from "@/lib/clauwi/blog-meta";

// Every mirrored static page is prerendered at build time from the registry.
export function generateStaticParams() {
  return Object.keys(registry).map((key) => ({ slug: key.split("/") }));
}

function lookup(slugParts: string[]) {
  return registry[slugParts.join("/")];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const key = slug.join("/");
  const mod = lookup(slug);
  if (!mod) return {};

  const title = cleanMirroredTitle(mod.title || key);
  const description = SEO_DESCRIPTIONS[key];
  const url = `/${key}`;
  const post = getBlogPostMeta(key);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: post
      ? { title, description, url, type: "article", publishedTime: post.datePublished, modifiedTime: post.dateModified, authors: [post.author], images: [post.image] }
      : { title, description, url, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

// Breadcrumb trail per page — blog posts/categories nest under Blog, courses
// aren't part of this catch-all (they have their own route), everything else
// nests directly under the home page.
function breadcrumbsFor(key: string, title: string) {
  const home = { name: "Strona główna", url: "/" };
  if (key === "blog") return [home, { name: "Blog", url: "/blog" }];
  if (key.startsWith("category/")) return [home, { name: "Blog", url: "/blog" }, { name: title, url: `/${key}` }];
  if (getBlogPostMeta(key)) return [home, { name: "Blog", url: "/blog" }, { name: title, url: `/${key}` }];
  return [home, { name: title, url: `/${key}` }];
}

export default async function LegacyRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const key = slug.join("/");
  const mod = lookup(slug);
  if (!mod) notFound();

  const title = cleanMirroredTitle(mod.title || key);
  const post = getBlogPostMeta(key);
  const description = SEO_DESCRIPTIONS[key];

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(breadcrumbsFor(key, title))} />
      {key === "strona-glowna/faq" && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
      )}
      {post && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description,
            author: { "@type": "Person", name: post.author },
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            image: `https://clauwi.pl${post.image}`,
            publisher: { "@type": "EducationalOrganization", name: "ClauWi®", logo: { "@type": "ImageObject", url: "https://clauwi.pl/brand/logo-clauwi.png" } },
            mainEntityOfPage: `https://clauwi.pl/${key}`,
          }}
        />
      )}
      <LegacyPage css={mod.css} html={mod.html} bodyClass={mod.bodyClass} />
    </>
  );
}
