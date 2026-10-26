import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { ContentArea } from "@/components/clauwi/layout";
import { PostGrid } from "@/components/clauwi/post-card";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { BLOG_POSTS } from "@/lib/clauwi/blog-meta";

const KEY = "blog";

export const metadata: Metadata = staticPageMetadata(KEY);

export default function BlogPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <ContentArea>
        <PostGrid posts={BLOG_POSTS} />
      </ContentArea>
    </PageShell>
  );
}
