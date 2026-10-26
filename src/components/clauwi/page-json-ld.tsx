import { JsonLd } from "./json-ld";
import { breadcrumbListJsonLd } from "@/lib/clauwi/breadcrumbs";
import { getStaticPage, staticPageBreadcrumbs } from "@/lib/clauwi/pages";
import { SEO_DESCRIPTIONS } from "@/lib/clauwi/seo-descriptions";
import { FAQ_ITEMS } from "@/lib/clauwi/faq-data";
import { getBlogPostMeta } from "@/lib/clauwi/blog-meta";

/** Structured data for a static page: breadcrumbs, plus FAQPage / BlogPosting where they apply. */
export function PageJsonLd({ pageKey }: { pageKey: string }) {
  const { title } = getStaticPage(pageKey);
  const post = getBlogPostMeta(pageKey);

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(staticPageBreadcrumbs(pageKey))} />
      {pageKey === "strona-glowna/faq" && (
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
            description: SEO_DESCRIPTIONS[pageKey],
            author: { "@type": "Person", name: post.author },
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            image: `https://clauwi.pl${post.image}`,
            publisher: { "@type": "EducationalOrganization", name: "ClauWi®", logo: { "@type": "ImageObject", url: "https://clauwi.pl/brand/logo-clauwi.png" } },
            mainEntityOfPage: `https://clauwi.pl/${pageKey}`,
          }}
        />
      )}
    </>
  );
}
