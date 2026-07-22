// Per-post author + publish/modified dates, extracted from the mirrored blog
// post pages — used for Article/BlogPosting JSON-LD and accurate sitemap
// lastModified dates. Content is frozen (client not writing new posts), so
// this is a hand-maintained table rather than parsed at request time.
export type BlogPostMeta = {
  slug: string;
  author: string;
  datePublished: string; // ISO date
  dateModified: string; // ISO date
  image: string; // path under /media (already downloaded during earlier phases)
};

export const BLOG_POSTS: BlogPostMeta[] = [
  { slug: "siegnij-po-spelnienie-marzen-dobro-wraca", author: "Iza", datePublished: "2021-07-11", dateModified: "2022-07-16", image: "/media/blog-karolona.png" },
  { slug: "nowa-odslona-clauwi", author: "Iza", datePublished: "2021-07-11", dateModified: "2021-07-11", image: "/media/blog-karolona.png" },
  { slug: "nie-nos-bo-rozpiescisz", author: "Dagmara Stolarczyk", datePublished: "2023-01-11", dateModified: "2023-01-18", image: "/media/blog-joanna.jpg" },
  { slug: "noszenie-na-wsi", author: "Aleksandra Młodkowska", datePublished: "2023-01-18", dateModified: "2023-01-18", image: "/media/blog-joanna.jpg" },
  { slug: "noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa", author: "Karolina Faraś", datePublished: "2023-01-25", dateModified: "2023-01-25", image: "/media/blog-iza.jpg" },
  { slug: "a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go", author: "Izabela Banach", datePublished: "2023-02-13", dateModified: "2023-02-13", image: "/media/blog-iza.jpg" },
  { slug: "jak-dlugo-mozna-nosic-dziecko-w-chuscie", author: "Joanna Tworzydło", datePublished: "2023-03-08", dateModified: "2023-03-08", image: "/media/blog-joanna.jpg" },
  { slug: "chustonoszenie-jako-profilaktyka-problemow-logopedycznych", author: "Karolina Faraś", datePublished: "2023-10-10", dateModified: "2023-10-27", image: "/media/blog-karolona.png" },
];

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
