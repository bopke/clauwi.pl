import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostComments } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "nowa-odslona-clauwi";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published, with the one published comment.
export default function NowaOdslonaClauwiPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout
        post={post}
        previous={previous}
        next={next}
        after={
          <PostComments
            postSlug={KEY}
            title="One Comment"
            comments={[
              {
                id: 15,
                author: "Natalia",
                authorUrl: "http://www.doradcatulenia.pl",
                avatar:
                  "https://secure.gravatar.com/avatar/817a3b03cf77db2f92a847288013ea2e4ee33421ccb03f9e0ef5f127c62bc288?s=60&d=mm&r=g",
                date: "2021-07-12T13:29:54+02:00",
                dateLabel: "12 lipca 2021 o 13:29",
                content: (
                  <p>
                    Piękna odsłona. Bardzo mi się podoba i rewelacyjne zdjęcia &lt;3 Mam nadzieje, że teraz chustonoszenie i
                    nauka noszenia w chuście noworodków i niemowląt jeszcze bardziej będzie rozpropagowane. Idea bliskości i
                    poczucia bezpieczeństwa jest piękna. Gratulacje !!!
                  </p>
                ),
              },
            ]}
          />
        }
      >
        <p>Po 12 latach przyszedł czas na refresh naszej strony internetowej. Wszyscy przyzwyczajeni byliśmy do starej
        wersji , ale z pewnością szybko przyzwyczaimy się do nowej, szczególnie, że jest dużo bardziej przyjazna.
        Strona jest nowa, ale szkoła wciąż ta sama, stara i dobra. Zapraszamy!</p>
        <p></p>
      </BlogPostLayout>
    </PageShell>
  );
}
