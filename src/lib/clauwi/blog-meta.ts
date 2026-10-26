// The blog's posts (frozen — the client isn't writing new ones), newest
// first as the blog lists them. Card fields (title, category, thumbnail,
// excerpt) are what the archive pages show; author and dates feed the
// BlogPosting JSON-LD and the sitemap's lastModified.
export type BlogCategory = "doradcy-pisza" | "bez-kategorii";

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string; href: string }> = {
  "doradcy-pisza": { label: "doradcy piszą", href: "/category/doradcy-pisza" },
  "bez-kategorii": { label: "Brak kategorii", href: "/category/bez-kategorii" },
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  category: BlogCategory;
  publishedAt: string; // ISO date-time, as WordPress published it
  thumbnail: { src: string; alt: string };
  excerpt: string;
  author: string;
  datePublished: string; // ISO date
  dateModified: string; // ISO date
  image: string; // path under /media (already downloaded during earlier phases)
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "chustonoszenie-jako-profilaktyka-problemow-logopedycznych",
    title: "Chustonoszenie jako profilaktyka problemów logopedycznych",
    category: "doradcy-pisza",
    publishedAt: "2023-10-10T20:45:47+02:00",
    thumbnail: { src: "/assets/wp-content/uploads/2023/10/201010Karolonafaras2.png", alt: "Chustonoszenie jako profilaktyka problemów logopedycznych" },
    excerpt:
      "Autorka: Karolina Faraś Aby zrozumieć w jakiś sposób chustonoszenie może mieć wpływ na profilaktykę ewentualnych problemów logopedycznych naszych pociech, w pierwszej kolejności musimy przestać oceniać człowieka patrząc na jego części. Oczywiście jesteśmy zbudowani z głowy, tułowia i czterech kończyn, ale wszystkie te elementy są ze sobą ściśle powiązane i każde z nich ma na siebie…",
    author: "Karolina Faraś",
    datePublished: "2023-10-10",
    dateModified: "2023-10-27",
    image: "/media/blog-karolona.png",
  },
  {
    slug: "jak-dlugo-mozna-nosic-dziecko-w-chuscie",
    title: "Jak długo można nosić dziecko w chuście?",
    category: "doradcy-pisza",
    publishedAt: "2023-03-08T08:07:33+01:00",
    thumbnail: { src: "/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-768x513.jpg", alt: "Jak długo można nosić dziecko w chuście?" },
    excerpt:
      "Autorka: Joanna Tworzydło Nosisz swoje dziecko w chuście, ale zastanawiasz się jak długo możesz to robić? Czy chustonoszenie jest zdrowe tylko dla noworodków, czy można bezpiecznie nosić i starsze niemowlęta? Ile godzin w ciągu dnia maluch może przebywać w chuście? To jedne z najczęstszych pytań, które słyszą doradcy noszenia podczas konsultacji chustowych. W chustę tkaną…",
    author: "Joanna Tworzydło",
    datePublished: "2023-03-08",
    dateModified: "2023-03-08",
    image: "/media/blog-joanna.jpg",
  },
  {
    slug: "a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go",
    title: "A co na to fizjoterapeuta, osteopata, ortopeda, pediatra? zapytaj go!",
    category: "doradcy-pisza",
    publishedAt: "2023-02-13T15:14:54+01:00",
    thumbnail: { src: "/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-768x540.jpg", alt: "A co na to fizjoterapeuta, osteopata, ortopeda, pediatra? zapytaj go!" },
    excerpt:
      "Autorka: Izabela Banach Jeśli chcesz upewnić się, czy Twój zaufany specjalista nie widzi przeciwwskazań do noszenia maluszka w chuście, zapytaj go koniecznie o zdanie. Pamiętaj jednak, aby sformułować pytanie w odpowiedni sposób, aby specjalista, nawet jeśli nie ma wiedzy o chustach, mógł ocenić sytuację realnie. Bez tego opinia jaką usłyszysz będzie oparta na wyobrażeniu o…",
    author: "Izabela Banach",
    datePublished: "2023-02-13",
    dateModified: "2023-02-13",
    image: "/media/blog-iza.jpg",
  },
  {
    slug: "noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa",
    title: "Noszenie w chuście przez rodzica z dyskopatią lędźwiową",
    category: "doradcy-pisza",
    publishedAt: "2023-01-25T20:41:55+01:00",
    thumbnail: { src: "/assets/wp-content/uploads/2023/01/230125KarolinaFaras2-768x356.png", alt: "Noszenie w chuście przez rodzica z dyskopatią lędźwiową" },
    excerpt:
      "Autor: Karolina Faraś Dyskopatia jest terminem obejmującym wiele patologii związanych z krążkiem międzykręgowym. Najczęściej mamy do czynienia z wypukliną lub przepukliną jądra miażdżystego i te patologie omówimy. Na początku wyjaśnijmy sobie krótko czym jest krążek międzykręgowy, jak jest zbudowany i w jaki sposób się odżywia.  Jest to tkanka łączna, dobrze uwodniona, która na zewnątrz jest zbudowana…",
    author: "Karolina Faraś",
    datePublished: "2023-01-25",
    dateModified: "2023-01-25",
    image: "/media/blog-iza.jpg",
  },
  {
    slug: "noszenie-na-wsi",
    title: "Noszenie na wsi.",
    category: "doradcy-pisza",
    publishedAt: "2023-01-18T18:41:57+01:00",
    thumbnail: { src: "/assets/wp-content/uploads/2023/01/230118OlaMlodkowska2-768x607.jpg", alt: "Noszenie na wsi." },
    excerpt:
      " Autor: Aleksandra Młodkowska Noszenie w chuście. Wciąż wzbudzające wiele kontrowersji wśród mieszkańców większych i mniejszych wsi, wciąż mało znane w wiejskim środowisku choć swoimi korzeniami sięga bardzo daleko. Wciąż mało praktykowane. Często demonizowane hasłami „nie noś bo przyzwyczaisz”, „dziecku w tej chuście jest przecież za ciasno” lub traktowane jako wymysł i trend dzisiejszych czasów, a…",
    author: "Aleksandra Młodkowska",
    datePublished: "2023-01-18",
    dateModified: "2023-01-18",
    image: "/media/blog-joanna.jpg",
  },
  {
    slug: "nie-nos-bo-rozpiescisz",
    title: "Nie noś, bo rozpieścisz.",
    category: "doradcy-pisza",
    publishedAt: "2023-01-11T16:05:55+01:00",
    thumbnail: { src: "/assets/wp-content/uploads/2023/01/DagmaraStolarczyk2-768x1152.jpg", alt: "Nie noś, bo rozpieścisz." },
    excerpt:
      "Autor: Dagmara Stolarczyk Nie noś, bo rozpieścisz – to zdanie słyszy wiele mam niemowląt, nie tylko noszonych w chuście. Istnieje mit, według którego dzieci noszone na rękach zostaną do tego przyzwyczajone, przez co rodzic będzie musiał je stale nosić. Niestety wiele mam nie zdaje sobie sprawy, że nie jest to prawda. Słucha rady i wbrew…",
    author: "Dagmara Stolarczyk",
    datePublished: "2023-01-11",
    dateModified: "2023-01-18",
    image: "/media/blog-joanna.jpg",
  },
  {
    slug: "nowa-odslona-clauwi",
    title: "Nowa odsłona ClauWI",
    category: "bez-kategorii",
    publishedAt: "2021-07-11T16:56:00+02:00",
    thumbnail: { src: "/assets/wp-content/uploads/2021/07/staraclauwi-768x432.jpg", alt: "Nowa odsłona ClauWI" },
    excerpt:
      "Po 12 latach przyszedł czas na refresh naszej strony internetowej. Wszyscy przyzwyczajeni byliśmy do starej wersji , ale z pewnością szybko przyzwyczaimy się do nowej, szczególnie, że jest dużo bardziej przyjazna. Strona jest nowa, ale szkoła wciąż ta sama, stara i dobra. Zapraszamy!",
    author: "Iza",
    datePublished: "2021-07-11",
    dateModified: "2021-07-11",
    image: "/media/blog-karolona.png",
  },
  {
    slug: "siegnij-po-spelnienie-marzen-dobro-wraca",
    title: "Sięgnij po spełnienie marzeń! dobro wraca!",
    category: "bez-kategorii",
    publishedAt: "2021-07-11T14:36:03+02:00",
    thumbnail: { src: "/assets/wp-content/uploads/2021/07/human-hand-company-3131802-768x532.jpg", alt: "Sięgnij po spełnienie marzeń! dobro wraca!" },
    excerpt:
      "Marzysz o tym, żeby zostać doradcą noszenia i wspierać młodych rodziców w ich początkach rodzicielstwa? Przebranżowienie jest dla Ciebie szansą na samodzielność finansową, ale koszty kursu przekraczają Twoje obecne możliwości finansowe? Gdybyś była po kursie, mogłabyś zarabiać, ale nie masz jak zrobić kursu, bo nie zarabiasz – błędne koło. Można je przerwać! Napisz do kontakt@clauwi.pl,…",
    author: "Iza",
    datePublished: "2021-07-11",
    dateModified: "2022-07-16",
    image: "/media/blog-karolona.png",
  },
];

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function blogPostsIn(category: BlogCategory): BlogPostMeta[] {
  return BLOG_POSTS.filter((p) => p.category === category);
}

const DATE_FORMAT = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });

/** "10 października 2023", as the theme printed post dates. */
export function formatPostDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}
