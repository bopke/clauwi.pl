import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, DROP_CAP } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "siegnij-po-spelnienie-marzen-dobro-wraca";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function SiegnijPoSpelnienieMarzenDobroWracaPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p className={DROP_CAP}>Marzysz o tym, żeby zostać doradcą noszenia i wspierać młodych rodziców w ich
        początkach rodzicielstwa? Przebranżowienie jest dla Ciebie szansą na samodzielność finansową, ale koszty kursu
        przekraczają Twoje obecne możliwości finansowe? Gdybyś była po kursie, mogłabyś zarabiać, ale nie masz jak
        zrobić kursu, bo nie zarabiasz – błędne koło.{" "}<strong>Można je przerwać!</strong></p>
        <p>Napisz do{" "}<strong>kontakt@clauwi.pl</strong>, coś wymyślimy – na przykład na część płatności poczekamy,
        więc na kurs zarobisz już po nim, udzielając konsultacji chustowych dzięki kompetencjom zdobytym na szkoleniu.</p>
      </BlogPostLayout>
    </PageShell>
  );
}
