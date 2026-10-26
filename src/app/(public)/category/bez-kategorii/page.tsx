import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { ContentArea } from "@/components/clauwi/layout";
import { PostGrid } from "@/components/clauwi/post-card";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { blogPostsIn } from "@/lib/clauwi/blog-meta";

const KEY = "category/bez-kategorii";

export const metadata: Metadata = staticPageMetadata(KEY);

export default function BezKategoriiPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <ContentArea>
        <PostGrid posts={blogPostsIn("bez-kategorii")} />
      </ContentArea>
    </PageShell>
  );
}
