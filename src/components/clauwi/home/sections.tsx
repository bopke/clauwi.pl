import Link from "next/link";
import { AssetImage } from "../asset-image";
import { StackableButton } from "../stackable-button";
import { ContactForm } from "../contact-form";
import { TestimonialsCarousel } from "../testimonials-carousel";
import { TESTIMONIALS } from "@/lib/clauwi/testimonials";
import { BLOG_POSTS, type BlogPostMeta } from "@/lib/clauwi/blog-meta";

// The home page's sections, reproducing the original Kadence/Stackable
// layout. Breakpoints follow the plugins that produced each block: Kadence
// rows switch at 768/1025px, Stackable text sizes at 769/1026px.

const HEADING = "font-heading text-[#692d2c]";

/** Full-width photo with the translucent "CLAUWI® / Szkoła noszenia" box. */
export function HomeHero() {
  return (
    <div
      className="bg-cover"
      style={{ backgroundImage: "url(/assets/wp-content/uploads/2021/07/PB081342-kopia-scaled.jpg)", backgroundPosition: "0% 0%" }}
    >
      {/* Three columns from 1025px (the last two empty), the box spanning a
          row of two on tablets; the empty columns still add their 32px gaps. */}
      <div className="mx-auto grid max-w-[1170px] grid-cols-1 gap-8 px-5 pt-[100px] pb-[81px] min-[768px]:grid-cols-2 min-[768px]:px-0 min-[1025px]:grid-cols-[calc(60%-21.333px)_calc(20.1%-21.333px)_calc(19.9%-21.333px)] min-[1025px]:pt-[110px] min-[1025px]:pb-[119px]">
        <div className="flex flex-col justify-center bg-[rgba(244,244,244,0.9)] px-[25px] pt-[37px] min-[768px]:col-span-2 min-[1025px]:col-span-1 min-[1025px]:pt-0">
          <h2 className={`${HEADING} my-[35px] text-[50px] leading-[75px] min-[1026px]:text-[76px] min-[1026px]:leading-[114px]`}>CLAUWI®</h2>
          <div className="-mt-8 mb-[35px] min-[769px]:-mt-[27px]">
            <h3 className="mb-2.5 font-heading text-[19px] leading-[1.9px] text-[#1a202c] uppercase min-[769px]:text-[26px] min-[769px]:leading-[2.6px]">
              Szkoła noszenia
            </h3>
          </div>
          <div className="py-2.5 text-center">
            <AssetImage
              src="/assets/wp-content/uploads/2021/05/logo_clauwi.png"
              alt="Logo ClauWi® — Szkoła Doradców Noszenia"
              priority
              width={150}
              height={152}
              className="inline-block w-[150px] align-middle"
            />
          </div>
        </div>
        <div />
        <div />
      </div>
    </div>
  );
}

/** Grey band announcing the conference. */
export function ConferenceBar() {
  return (
    <div className="flow-root bg-[#f4f4f4] pt-4">
      <h3 className={`${HEADING} mt-[35px] mb-[35px] text-center text-[36px] leading-[54px] uppercase min-[768px]:mt-0`}>
        Konferencja Doradców Noszenia Dzieci – ClauWi® 2025
      </h3>
      <StackableButton
        href="/konferencja-clauwi2025"
        hover="scale"
        className="bg-[#cb8c7c] px-[26px] py-2"
        labelClassName="text-[16px] leading-6 text-white uppercase"
      >
        przeczytaj więcej
      </StackableButton>
    </div>
  );
}

/** Three grey dots between buttons. */
function DotsDivider() {
  return (
    <div className="my-[35px] flex justify-center">
      <div className="flex w-[10%] justify-between overflow-hidden">
        <span className="size-[9px] rounded-full bg-[#ddd]" />
        <span className="size-[9px] rounded-full bg-[#ddd]" />
        <span className="size-[9px] rounded-full bg-[#ddd]" />
      </div>
    </div>
  );
}

/** A short grey rule between buttons; from 768px its negative margins pull the buttons closer. */
function LineDivider() {
  return (
    <div className="my-[35px] flex justify-center min-[768px]:-mt-[28px] min-[768px]:-mb-[19px]">
      <hr className="h-px w-[48%] border-0 bg-[#ddd]" />
    </div>
  );
}

const SECTION_HEADING = `${HEADING} mb-3 text-[50px] leading-[75px] min-[1026px]:text-[75px] min-[1026px]:leading-[112.5px]`;

/** "O nas": photo beside the heading and links. */
export function AboutSection() {
  return (
    <div className="mx-auto grid max-w-[1561px] grid-cols-1 gap-8 px-5 min-[768px]:px-0 min-[1025px]:grid-cols-2">
      <div className="py-2.5">
        <AssetImage
          src="/assets/wp-content/uploads/2021/07/baby-newborn-baby-feet-4077353.jpg"
          alt="Bose stópki noworodka noszonego blisko rodzica"
          className="block h-auto w-full"
        />
      </div>
      <div className="mt-[-45px] mr-[50px] ml-10 flow-root">
        {/* flow-root keeps the heading's 12px bottom margin inside its block, as the original's flex block did. */}
        <div className="my-[35px] flow-root">
          <h2 className={SECTION_HEADING}>O NAS</h2>
        </div>
        <StackableButton
          href="/o-nas"
          full
          hover="fade"
          className="border-2 border-[#e8bebe] px-[26px] py-2"
          labelClassName="text-[25px] leading-[37.5px] text-[#e8bebe]"
        >
          Poznaj szkołę ClauWi®
        </StackableButton>
        <DotsDivider />
        <StackableButton
          href="/o-nas/lista-doradcow"
          full
          hover="fade"
          className="border-2 border-[#dfc0c0] px-[35px] py-2"
          labelClassName="text-[23px] leading-[34.5px] text-[#dfc0c0] min-[1026px]:text-[25px] min-[1026px]:leading-[37.5px]"
        >
          Lista Doradców Noszenia
        </StackableButton>
        {/* Points at a page that doesn't exist (it 404'd on the original site too) — kept as published. */}
        <StackableButton
          href="/aktualizacja-danych/"
          full
          wrapperClassName="min-[768px]:-mt-[33px]"
          className="bg-[#dfc0c0] px-[35px] py-[7px]"
          labelClassName="text-[23px] leading-[34.5px] text-white uppercase min-[1026px]:text-[14px] min-[1026px]:leading-[21px]"
        >
          Aktualizacja danych Doradcy noszenia ClauWi®
        </StackableButton>
      </div>
    </div>
  );
}

const COURSE_TILES = [
  { title: "Kursy podstawowe", href: "/strona-glowna/system-ksztalcenia#kurs-podstawowy", image: "/assets/wp-content/uploads/2021/07/P3194801-kopia-min-1024x1024-1-1024x1024.jpg" },
  { title: "kursy zaawansowane", href: "/strona-glowna/system-ksztalcenia#kurs-zaawansowany", image: "/assets/wp-content/uploads/2021/07/P3184732-kopia-min-1024x1024-1-1024x1024.jpg" },
  { title: "refreshe", href: "/strona-glowna/system-ksztalcenia#refresh", image: "/assets/wp-content/uploads/2021/07/P3194924-kopia-min-1024x1024-2-1024x1024.jpg" },
];

/** "Kursy": links on the left, three photo tiles on the right. */
export function CoursesSection() {
  return (
    <div className="bg-[#f4f4f4]">
      <div className="mx-auto grid max-w-[1290px] grid-cols-1 gap-y-8 px-5 pt-[42px] min-[768px]:grid-cols-[45%_55%] min-[768px]:px-0">
        <div className="mt-[-45px] mr-[50px] ml-10 flow-root">
          <div className="my-[35px] flow-root">
            <h2 className={SECTION_HEADING}>KURSY</h2>
          </div>
          <StackableButton
            href="/strona-glowna/system-ksztalcenia"
            full
            hover="scale-more-fade"
            className="border-2 border-[#e8bebe] px-[26px] py-2"
            labelClassName="text-[#e8bebe] uppercase"
          >
            System kształcenia
          </StackableButton>
          <LineDivider />
          <StackableButton
            href="/strona-glowna/system-ksztalcenia#uprawnienia"
            full
            hover="scale-more-fade"
            className="border-2 border-[#e8bebe] px-[26px] py-2"
            labelClassName="text-[#e8bebe] uppercase"
          >
            Ważność uprawnień
          </StackableButton>
          <LineDivider />
          <StackableButton
            href="/regulam-i-zasady-naboru"
            full
            hover="scale-more"
            className="bg-[#dfc0c0] px-[35px] py-2"
            labelClassName="text-[23px] leading-[34.5px] text-white uppercase min-[1026px]:text-[25px] min-[1026px]:leading-[37.5px]"
          >
            zasady naboru
          </StackableButton>
        </div>
        <div className="-mt-5 flow-root">
          <div className="my-[35px] grid grid-cols-1 gap-[35px] text-center min-[768px]:grid-cols-3">
            {COURSE_TILES.map((tile) => (
              <div
                key={tile.href}
                className="relative flex h-[300px] flex-col justify-center overflow-hidden bg-white px-[23.333px] py-10 min-[768px]:p-0 shadow-[0_5px_5px_0_rgba(18,63,82,0.035),0_0_0_1px_rgba(176,181,193,0.2)] min-[1026px]:h-[429px]"
              >
                <div className="absolute inset-0 z-[1] bg-cover bg-center" style={{ backgroundImage: `url(${tile.image})` }} />
                <div className="absolute inset-0 z-[2] bg-black opacity-40" />
                <div className="relative z-[4]">
                  <h4 className="mb-4 font-heading text-[22px] font-bold leading-[33px] text-[#f7fafc] uppercase">{tile.title}</h4>
                </div>
                <Link href={tile.href} className="absolute inset-0 z-[5]" aria-label={tile.title} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Font Awesome's "user" glyph, inline instead of loading the icon font for one icon. */
function UserIcon() {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className="mr-[3px] inline-block h-3 w-[10.5px] align-[-1px]" aria-hidden>
      <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
    </svg>
  );
}

// The home page used its own (larger) image sizes for these tiles.
const TILE_IMAGES: Record<string, string> = {
  "chustonoszenie-jako-profilaktyka-problemow-logopedycznych": "/assets/wp-content/uploads/2023/10/201010Karolonafaras2.png",
  "jak-dlugo-mozna-nosic-dziecko-w-chuscie": "/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-1024x684.jpg",
  "a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go": "/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-1024x720.jpg",
};

const ROBOTO = { fontFamily: "Roboto, sans-serif" }; // never loaded on the original either: renders as the system sans

/**
 * A latest-post tile: the photo darkened, title and author over it. The
 * photo is shown at its natural size (only enlarged when smaller than the
 * tile), centred — so a large file shows as a close crop, as it did.
 */
function PostTile({ post }: { post: BlogPostMeta }) {
  const href = `/${post.slug}`;
  return (
    <div className="relative h-[267px] overflow-hidden">
      <div className="absolute inset-0 z-[2] overflow-hidden">
        <Link href={href} tabIndex={-1} aria-hidden>
          <AssetImage
            src={TILE_IMAGES[post.slug] ?? post.thumbnail.src}
            alt={post.thumbnail.alt}
            className="absolute top-1/2 left-1/2 block h-auto min-h-full w-auto min-w-full max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-[rgba(16,27,60,0.35)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 grid content-center overflow-hidden p-5">
        <h2 className="pb-1.5 text-[32px] font-bold leading-8 text-[#1a202c]" style={ROBOTO}>
          <Link href={href} className="pointer-events-auto text-white hover:text-[#ff0096]">
            {post.title}
          </Link>
        </h2>
        <div className="pb-8 text-[12px] leading-[22px] text-white" style={ROBOTO}>
          {/* WordPress credited every post to the account that published it ("Iza"), whoever wrote it. */}
          <span className="relative pr-3">
            <UserIcon /> By Iza
          </span>
        </div>
      </div>
    </div>
  );
}

/** "Blog": the three latest posts, then the testimonials band. */
export function BlogSection() {
  return (
    <div className="flow-root pb-[25px]">
      <h2 className={`${HEADING} my-[35px] text-center text-[50px] font-light leading-[75px] uppercase min-[1026px]:text-[76px] min-[1026px]:leading-[114px]`}>
        blog
      </h2>
      <div className="py-2.5">
        <div className="grid gap-x-4 gap-y-[30px] min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <PostTile key={post.slug} post={post} />
          ))}
        </div>
      </div>
      <StackableButton
        href="/blog"
        hover="scale"
        className="bg-[#cb8c7c] px-[26px] py-2.5"
        labelClassName="font-sans text-[15px] leading-[22.5px] text-white uppercase min-[769px]:text-[23px] min-[769px]:leading-[34.5px] min-[1026px]:text-[25px] min-[1026px]:leading-[37.5px]"
      >
        Zobacz więcej wpisów
      </StackableButton>
      <TestimonialsSection />
    </div>
  );
}

/** "Opinie": heading beside the testimonials carousel. */
function TestimonialsSection() {
  return (
    <div className="bg-[#f4f4f4]">
      <div className="mx-auto grid max-w-[1290px] grid-cols-1 content-center gap-8 px-6 pt-[25px] min-[768px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] min-[1025px]:grid-cols-[calc(25%-16px)_calc(75%-16px)]">
        <div className="flex flex-col justify-center">
          <h2 className={`${HEADING} my-[35px] text-[50px] leading-[75px] uppercase min-[1026px]:text-[76px] min-[1026px]:leading-[114px]`}>opinie</h2>
        </div>
        <div className="flex flex-col justify-center">
          {/* A plain block between the flex column and the carousel, so the carousel takes the column's width. */}
          <div>
            <TestimonialsCarousel testimonials={TESTIMONIALS} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Kontakt": the contact form in the right-hand column. */
export function ContactSection() {
  return (
    <div className="mx-auto grid max-w-[1290px] grid-cols-1 content-center gap-8 px-6 pt-[68px] pb-[65px] min-[1025px]:grid-cols-[calc(45%-16px)_calc(55%-16px)]">
      <div />
      <div>
        <div className="mt-[35px] mb-[35px] min-[768px]:-mt-[52px]">
          <h2 className={`${HEADING} mb-[-24px] text-center text-[50px] font-light leading-[75px] uppercase min-[1026px]:text-[80px] min-[1026px]:leading-[120px]`}>
            Kontakt
          </h2>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
