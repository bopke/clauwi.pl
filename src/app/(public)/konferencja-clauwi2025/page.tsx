import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { ContentArea } from "@/components/clauwi/layout";
import { AssetImage } from "@/components/clauwi/asset-image";
import { Carousel } from "@/components/clauwi/carousel";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "konferencja-clauwi2025";

export const metadata: Metadata = staticPageMetadata(KEY);

/** WordPress's default gallery: three per row, two below 600px (an odd last photo fills its row). */
function Gallery({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-[8.5px]">{children}</div>;
}

function GalleryImage({ src }: { src: string }) {
  return (
    <figure className="w-[calc(50%-4.25px)] grow min-[600px]:w-[calc(33.333%-5.667px)] min-[600px]:grow-0">
      <AssetImage src={src} alt="Zdjęcie z konferencji ClauWi® 2025" className="block aspect-[3/2] w-full object-cover" />
    </figure>
  );
}

const YOUTUBE_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

export default function KonferencjaPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <ContentArea>
        <h2
          id="konferencja-doradcow-noszenia-dzieci-clau-wi-juz-za-nami"
          className="mb-px text-center text-[28px] font-bold leading-[42px] text-[#1a202c]"
        >
          Konferencja Doradców Noszenia Dzieci ClauWi® – już za nami!
        </h2>
        <div className="pt-6 pb-2">
          <Carousel label="Zdjęcia z konferencji">
            <Gallery>
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A1226-1.jpg" />
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0716-1.jpg" />
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0792-1.jpg" />
            </Gallery>
            <Gallery>
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0834.jpg" />
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0697.jpg" />
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A1101.jpg" />
            </Gallery>
            <Gallery>
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0382.jpg" />
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0572.jpg" />
              <GalleryImage src="/assets/wp-content/uploads/2025/10/7G3A0413.jpg" />
            </Gallery>
          </Carousel>
        </div>
        <div className="flow">
          <p>11 października 2025 roku w Krakowie odbyła się Konferencja Doradców Noszenia ClauWi® – wyjątkowe
          spotkanie, które po raz kolejny połączyło pasję, wiedzę i wspólnotę osób pracujących z rodzicami i dziećmi.
          Tegoroczne wydarzenie miało miejsce w gościnnych progach Fundacji Głos na Pustyni przy ul. Balickiej 214.</p>
          <p>Atmosfera była pełna inspiracji, rozmów i radości z bycia razem. W konferencji wzięło udział prawie 50
          doradców noszenia z całej Polski – zarówno doświadczonych konsultantów, jak i nowych osób w sieci ClauWi®.
          Wspólna przestrzeń wymiany doświadczeń, praktycznej wiedzy i refleksji nad codzienną pracą z rodzinami stała
          się impulsem do dalszego rozwoju i budowania społeczności świadomego noszenia.</p>
          <p>Nie zabrakło również wystawców, którzy zaprezentowali swoje produkty i nowości:<br />👉{" "}<a href="https://pl.lennylamb.com/" target="_blank" rel="noopener noreferrer">LennyLamb</a>,<br />👉{" "}<a href="https://kavkababy.com/" target="_blank" rel="noopener noreferrer">KAVKA</a>,<br />👉{" "}<a href="https://gattner.pl/" target="_blank" rel="noopener noreferrer">Pracownia
          GATTNER</a>,<br />👉{" "}<a href="https://www.facebook.com/unicornfactoryart/" target="_blank" rel="noopener noreferrer">Unicorn
          Factory</a>.<br />Ich obecność dodała konferencji praktycznego wymiaru – można było obejrzeć, dotknąć i
          przetestować nosidła oraz akcesoria, o których na co dzień rozmawiamy z rodzicami.</p>
          <p>Program merytoryczny obejmował pięć różnorodnych paneli tematycznych, które wzbudziły ogromne
          zainteresowanie uczestników:<br />1️⃣ Kolorowy i zdrowy świat nosideł<br />2️⃣ Aktywność mam w połogu i po nim
          jako profilaktyka depresji poporodowej<br />3️⃣ Rodzic–dziecko–chusta, czyli balans napięć i kompensacji<br />4️⃣
          Zachustowana niepełnosprawność<br />5️⃣ Nosidło takie, że mucha nie siada, gdy dziecko jeszcze nie siada</p>
          <p>Każdy z paneli wniósł coś unikalnego – od aspektów zdrowotnych i psychologicznych po praktyczne spojrzenie
          na ergonomię i indywidualne potrzeby rodzin.</p>
          <p>Konferencja 2025 pokazała, że środowisko doradców ClauWi® to nie tylko eksperci, ale przede wszystkim
          społeczność ludzi z pasją, którzy wspierają się nawzajem, uczą od siebie i nieustannie rozwijają, by jeszcze
          lepiej służyć rodzicom i dzieciom.</p>
          <p>Już nie możemy się doczekać kolejnej edycji! 💛</p>
        </div>
        {/* The original kept the video's 32px bottom margin (empty paragraphs followed it). */}
        <figure className="my-8">
            <iframe
              src="https://www.youtube.com/embed/7dEyojm6zuc?feature=oembed"
              title="Konferencja Doradców Noszenia ClauWi® 2025"
              allow={YOUTUBE_ALLOW}
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
              className="block aspect-video w-full"
            />
        </figure>
      </ContentArea>
    </PageShell>
  );
}
