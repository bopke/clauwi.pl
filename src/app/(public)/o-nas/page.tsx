import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { PALATINO, Row } from "@/components/clauwi/layout";
import { AssetImage } from "@/components/clauwi/asset-image";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { cn } from "@/lib/utils";

const KEY = "o-nas";

export const metadata: Metadata = staticPageMetadata(KEY);

const SYSTEM_FONT =
  '-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

/** Big salmon button jumping to a section of this page. */
function AnchorButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    // flow-root keeps the button's 8.5px bottom margin inside its wrapper.
    <div className="my-[35px] flow-root">
      <a
        href={href}
        className="mb-[8.5px] block rounded-[1px] bg-[#cb8c7c] px-[35px] py-[26px] transition-transform duration-200 ease-in-out hover:scale-[1.03]"
      >
        <span className="block font-sans text-[19px] font-medium uppercase leading-[28.5px] text-white min-[769px]:text-[23px] min-[769px]:leading-[34.5px] min-[1026px]:text-[22px] min-[1026px]:leading-[33px]">
          {children}
        </span>
      </a>
    </div>
  );
}

/** One trainer: rounded photo on the left (40%), name and bio on the right (60%). */
function Trainer({
  name,
  photo,
  photoAlt,
  photoClassName,
  textClassName,
  children,
}: {
  name: React.ReactNode;
  photo: string;
  photoAlt: string;
  photoClassName: string;
  /** Phone-only pull-up of the text column, as in the original. */
  textClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 min-[768px]:grid-cols-[calc(40%-16px)_calc(60%-16px)]">
      <div className={cn("pb-2.5 text-center", photoClassName)}>
        <AssetImage src={photo} alt={photoAlt} width={340} height={340} className="inline-block aspect-square w-[340px] max-w-full rounded-[18px] object-cover" />
      </div>
      <div className={cn("min-[768px]:mt-0", textClassName)}>
        <div className="my-[35px]">
        <h2 className="mb-2 font-heading text-[28px] font-bold leading-[42px] text-[#1a202c]">{name}</h2>
        <p>{children}</p>
        </div>
      </div>
    </div>
  );
}

/** Thin centred rule between trainers. */
function Divider({ width, height }: { width: string; height: string }) {
  return (
    <div className={cn("flex items-center justify-center", height)}>
      <hr className={cn("border-0 border-t border-[#eee]", width)} />
    </div>
  );
}

/** Full-width pale box with the ClauWi logo, a title and centred text. */
function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#f7fafc] p-4 text-center">
      <div className="mx-[15px]">
        <div className="inline-block max-w-full overflow-hidden p-2.5">
          <AssetImage src="/assets/wp-content/uploads/2021/05/logo_clauwi.png" alt="Logo ClauWi® — Szkoła Doradców Noszenia" width={84} height={85} className="block w-[84px]" />
        </div>
      </div>
      <h2 className="mt-[5px] mb-2.5 font-heading text-[25px] font-normal leading-[37.5px] text-[#1a202c]">{title}</h2>
      <p className="text-[#4a5568]">{children}</p>
    </div>
  );
}

export default function ONasPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />

      <div className="bg-[#f4f4f4]">
        <div className="grid grid-cols-1 gap-y-8 px-6 pt-[25px] min-[768px]:grid-cols-[45%_55%]">
          {/* A flex column, so the heading's and the buttons' margins add up instead of collapsing. */}
          <div className="flex flex-col">
            <div className="my-[35px]">
              <h2
                className="mb-2 text-[50px] font-extralight uppercase leading-[75px] text-[#692d2c] min-[1026px]:text-[77px] min-[1026px]:leading-[115.5px]"
                style={{ fontFamily: PALATINO }}
              >
                O Nas
              </h2>
              <p
                className="text-[26px] font-light uppercase leading-[41.6px] tracking-[0.3px] text-[#b35755]"
                style={{ fontFamily: SYSTEM_FONT }}
              >
                Szkoła noszenia ClauWi®
              </p>
            </div>
            {/* 32px above the buttons: the gap after an empty column in the original row. flow-root
                keeps the first and last button margins inside, like the original grid did. */}
            <div className="flow-root px-6 pt-8 text-center">
              <AnchorButton href="#cele">Cele</AnchorButton>
              <AnchorButton href="#trenerki">Nasze trenerki</AnchorButton>
              <AnchorButton href="#kodeks">Kodeks Doradcy</AnchorButton>
            </div>
          </div>
          {/* Pulled up 40px on phones, as the original column was. */}
          <div className="-mt-10 py-2.5 min-[768px]:mt-0">
            <figure className="overflow-hidden shadow-[2px_2px_3px_0_rgba(0,0,0,0.2)]">
              <AssetImage
                src="/assets/wp-content/uploads/2021/07/bez-nazwy2.png"
                alt="Szkoła ClauWi® — zdjęcie promocyjne"
                priority
                className="block h-[650px] w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </div>

      <div className="bg-[#f4f4f4] px-6 py-2.5 text-center text-[16px] leading-[25.6px]">
        <p>
Szkoła Noszenia ClauWi® powstała w 1999 roku w Niemczech i była jedną z pierwszych tego typu instytucji w
Europie.<br /><br />ClauWi® szkoli Doradców Noszenia w kilku krajach Europy, w USA, Izraelu, Kanadzie i
Australii. Dzięki stabilności i renomie Szkoła posiada ugruntowaną pozycję na rynku szkoleniowym. Z kolei
liczna i dobrze wykształcona kadra trenerska gwarantuje wysoki poziom szkoleń dla Doradców Noszenia.<br /><br />Podstawą
i bardzo ważnym aspektem działalności ClauWi® są międzynarodowe kontakty z najlepszymi specjalistami w
dziedzinie noszenia dzieci.<br /><br />Wieloletnie doświadczenie Szkoły Noszenia ClauWi® gwarantuje
dopracowaną w szczegółach koncepcję szkoleniową sprawdzoną podczas dziesiątek przeprowadzonych kursów. Ogromną
pomocą dla Doradców są profesjonalne i obszerne materiały szkoleniowe w języku ojczystym.<br /><br />Przedstawiciel
Szkoły na Polskę jest wpisany do Rejestru Instytucji Szkoleniowych pod numerem 2.14/00060/2017.
        </p>
      </div>

      <div id="trenerki" />
      {/* On phones each trainer row is pulled up 60px, as in the original. */}
      <Row className="-mt-[60px] min-[768px]:mt-0">
        <div className="py-6">
          <Trainer name={<><em>IZABELA BANACH</em></>}photo="/assets/wp-content/uploads/2021/07/1.png"
          photoAlt="Trenerki ClauWi® podczas prowadzenia kursu" photoClassName="pt-[65px]" textClassName="-mt-[50px]">
            <strong>Ludzie, budowanie ich kompetencji, praca z nimi z chustą w tle to moja pasja.</strong>{" "}Najmłodsze z
            trojga dzieci od urodzenia nosiłam w chuście. Chustowanie córki okazało się być dla mnie inspirujące nie tylko
            rodzicielsko. Odeszłam z bankowości, porzuciłam życie korporacyjne i zaczęłam realizować życie zawodowe wg
            własnych zasad. Od kiedy w 2011 roku zostałam doradcą noszenia ClauWi®, profesjonalnie dzielę się wiedzą i
            doświadczeniem z rodzicami, którzy pragną mieć dzieci blisko siebie i używają w tym celu chust lub nosideł. W
            2013 roku rozpoczęłam pracę trenerską w ClauWi®, współprowadząc z Anną Nogajską kursy dla Doradców. Bardzo mi
            w tym pomogło moje wcześniejsze doświadczenie trenerskie i coachingowe – wieloletnia praca jako coach, trener,
            manager w korporacjach dała mi bardzo mocne podstawy. Prowadzenie przedstawicielstwa szkoły na Polskę to dla
            mnie wspaniała okazja do szerokiego dzielenia się wiedzą, do wspierania ludzi w ich rozwoju, a także do
            poszerzania własnych kompetencji. Zdobywanie szerokiej wiedzy o człowieku to moje hobby. Na studiach
            skończyłam specjalizację z antropologii kulturowej, mam za sobą sporo szkoleń z zakresu neuropsychologii,
            rozwoju dzieci, opieki okołoporodowej, funkcji miednicy, a ostatnie duże szkolenie jakie zrobiłam to terapeuta
            czaszkowo-krzyżowy i utonęłam w pasji poszerzania wiedzy z anatomii i fizjologii człowieka. Temat chust
            wpisuje się pozytywnie we wszystkie te obszary, zatem prowadząc kursy ClauWi pomimo skupienia na technicznych
            aspektach, nadaję użyciu chust szeroki kontekst. <strong>Rozwijajmy się razem!</strong>
          </Trainer>
        </div>
        <Divider width="w-[68%]" height="h-[23px]" />
      </Row>
      <Row className="-mt-[60px] min-[768px]:mt-0" innerClassName="pt-[25px]">
        <Trainer name={<><em><em>ANNA NOGAJSKA</em></em></>}photo="/assets/wp-content/uploads/2021/05/2.png"
        photoAlt="Trenerka ClauWi® podczas kursu doradcy noszenia" photoClassName="pt-[65px]" textClassName="-mt-10">
          <strong>M</strong>ama dwójki dzieci, które nosi w miękkich nosidłach, chustach od ich urodzenia.<br /><strong>O
          sobie</strong>:<br />Noszenie tak mnie zafacynowało, że krótko po tym jak zaczęłam noszenie mojego synka,
          rozpoczęłam w tym kierunku intensywne kształcenie w Niemczech. Szybko narodziła się chęć podzielenia się z tą
          wiedzą z innymi rodzicami, dlatego prowadziłam i prowadzę liczne warsztaty. Cały czas miałam jednak
          świadomość, że w Polsce za mało jest Doradców Noszenia, tak aby rodzice &nbsp;mieli szansę na szybki kontakt
          ze specjalistą. Naturalną konsekwencją tych przemyśleń było &nbsp;otwarcie przedstawicielstwa
          renomowanej&nbsp;<strong>Szkoły Noszenia ClauWi®.</strong><br /><strong>Pracując z ClauWi® postawiłam na</strong>:<br />10
          letnie doświadczenie tej Szkoły&nbsp;<br />ugruntowaną pozycję i renomę Szkoły (a także jej Doradców) oraz jej
          stabilność na rynku szkoleniowym<br />liczną i wykształconą międzynarodową kadrę trenerską. Obecnie Doradców
          szkoli 3 trenerów z Niemiec, 2 trenerów ze Szwajcarii, 6 trenerów z Francji i 2 trenerów z Polski.<br />międzynarodowe
          kontakty Szkoły z najlepszymi specjalistami w dziedzinie noszenia (ortopedzi, psycholodzy, autorzy książek
          badający różne aspekty noszenia itd)<br />międzynarodową sieć Doradców Noszenia – liczne kontakty z nimi są
          dla mnie nieustającą inspiracją<br />możliwość udziału w szkoleniach i konferencjach na temat noszenia, które
          odbywają się w Europie – to wspaniała platforma do zdobywania nowej wiedzy i przekazywania jej polskim
          Doradcom Noszenia<br />bardzo dobrą koncepcję kształcenia Doradców sprawdzoną podczas dziesiątek
          przeprowadzonych kursów<br />bardzo profesjonalnie opracowane materiały szkoleniowe<br />bardzo profesjonalną
          wymianę doświadczeń z Petrą Wilhelm, która stale dzieli się swoją wiedzą z Doradcami Noszenia.
        </Trainer>
        <Divider width="w-[80%]" height="h-[60px]" />
      </Row>
      <Row className="-mt-[60px] min-[768px]:mt-0">
        <div className="pb-[25px]">
          <Trainer name={<><em><em><em>PETRA WILHELM</em></em></em></>}photo="/assets/wp-content/uploads/2021/05/3.png"
          photoAlt="Materiały szkoleniowe wykorzystywane na kursach ClauWi®" photoClassName="pt-[60px]" textClassName="-mt-10">
            Petra Wilhelm, założycielka i pomysłodawczyni&nbsp;Szkoły&nbsp;Noszenia&nbsp;ClauWi®, którą stworzyła wraz z
            przyjaciółką, Claudią Hahn. Cały czas czynnie działa prowadząc kursy dla Doradców Noszenia na całym świecie.<br />O
            sobie:<br />Swojego pierwszego syna urodzonego w roku 1987 nosiłam w NRD-owskiej chuście Dyade. Po ukończeniu
            kursów na Doradcę Laktacyjnego w roku 1993 noszenie zyskało dla mnie zupełnie inny wymiar. Stwierdziłam, że
            noszenie dziecka i karmienie piersią to dwa nierozerwalnie ze sobą związane aspekty macierzyństwa. Wtedy
            narodziła się we mnie chęć dzielenia się tą wiedzą z innymi rodzicami.<br /><br />Moje trzecie dziecko
            cierpiało na syndrom KISS i nosiłam je ponad 10 godzin dziennie. Efektem tego były ogromne problemy z
            kręgosłupem, ból i cierpienie. Po tych doświadczeniach stwierdziłam, że muszę, a przede wszystkim chcę bliżej
            zająć się tematem noszenia dzieci w chustach.<br /><br />Doszłam do wniosku, że w noszeniu ważne są nie tylko
            bliskość i bezpieczeństwo, a także właściwa pozycja dziecka. Co dzieje się z kręgosłupem dziecka? Jak do
            noszenia ma się kręgosłup, miednica i inne części ciała noszącej matki? Bo przecież noszenie noszeniu
            nierówne! Jedno pytanie rodziło kolejne…I tak udałam się na poszukiwania odpowiedzi. Liczne rozmowy z
            ortopedami, osteopatami, fizjoterapeutami itd. rozwiały wiele naszych wątpliwości. Stało się jasne, że
            noszenie może być przyjemne nie tylko dla dziecka, ale i dla rodzica – nie musi być związane z bólem
            kręgosłupa, pleców i zmęczeniem. Swoje czwarte dziecko nosiłam już bez bólu, chętnie i długo.<br />Dzięki tym
            wszystkim doświadczeniom powstała&nbsp;Szkoła Noszenia ClauWi®. Szkoła oczywiście nieustannie rozwija się,
            integruje nowe badania i odkrycia w dziedzinie noszenia dzieci będąc w stałym kontakcie ze specjalistami
          </Trainer>
        </div>
      </Row>

      <div id="cele" className="pb-[25px]">
        <InfoBox title="CELE SZKOŁY">
          <strong>Doradcy Noszenia</strong><br />Kształcimy Doradców Noszenia, którzy profesjonalnie przekazują Rodzicom
          wiedzę na temat zasad prawidłowego noszenia dzieci w chustach i innych miękkich nosidłach, a także w zakresie
          budowy oraz rozwoju kręgosłupa i bioderek małego dziecka.&nbsp;Dzięki swojej gruntownej wiedzy, Doradcy
          Noszenia ClauWi® zachęcają Rodziców do noszenia dzieci w chustach w sposób bezpieczny i świadomy (rodzice
          wiedzą na co powinni zwrócić szczególną uwagę).&nbsp;Doradca Noszenia Clauwi® towarzyszy Rodzicom w ich
          drodze. Czyni to wykorzystując swoją wiedzę fachową, ze zrozumieniem, przyjaznym nastawieniem i zawsze
          dopasowując się do indywidualnych potrzeb danego Rodzica.<br />&nbsp;<br />&nbsp;<strong>Trenerzy Szkoły
          Noszenie ClauWi®</strong><br />Kształcimy Trenerów Szkoły Noszenia ClwuWi®, którzy przekazują swoją wiedzę
          Doradcom Noszenia oraz personelowi fachowemu w ich języku ojczystym z uwzględnieniem uwarunkowań kulturowych i
          panujących w danym kraju zwyczajów.<br />&nbsp;<br /><strong>Personel Fachowy/ grupy zawodowe</strong><br />Zdając
          sobie sprawę z tego jak ważną rolę odgrywa noszenie w wielu dziedzinach obejmujących dzieci z wyzwaniami
          rozwojowymi kształcimy personel fachowy: położne, pediatrów, pielęgniarki, przedszkolanki, rehabilitantów,
          fizjoterapeutów, masażystów itd.&nbsp;Kursy Doradców Noszenia ClauWi® stanowią dla tych osób logiczne i bardzo
          pomocne w pracy uzupełnienie kwalifikacji zawodowych.<br />&nbsp;<br /><strong>Współpraca ze specjalistami</strong><br />Celem
          Szkoły Noszenia ClauWi® jest międzynarodowa współpraca ze specjalistami, którzy w sposób pośredni oraz
          bezpośredni zajmują się problematyką noszenia dzieci w chustach. Efektem tej współpracy są nowe badania,
          odkrycia, publikacje itd.<br />&nbsp;<br /><strong>Standardy noszenia</strong><br />Szkołą Noszenia ClauWi®
          wraz ze swoimi Doradcami tworzy dobre standardy noszenia dzieci zdrowych oraz dzieci z wyzwaniami rozwojowymi.
          Szkoła wypracowuje również nowe metody dopasowując je do najnowszych badań i opracowań.<br />&nbsp;<br /><strong>Propagowanie</strong><br />Celem
          Szkoły Noszenia ClauWi® jest propagowanie idei noszenia dzieci w chustach i nosidłach miękkich oraz idei
          Rodzicielstwa Bliskości na całym świecie.&nbsp;<br />&nbsp;<br /><strong>Integrowanie</strong><br />Szkoła
          Noszenia ClauWI® &nbsp;jest platformą do wymiany doświadczeń na temat noszenia dzieci i integruje osoby
          pracujące w tym obszarze.
        </InfoBox>
        <div id="kodeks" className="pb-[25px]">
          <InfoBox title="KODEKS ETYCZNY DORADCY NOSZENIA CLAUWI®">
            <br />1.&nbsp;&nbsp;&nbsp;&nbsp; Zapoznanie się i przestrzeganie kodeksu etycznego jest obowiązkiem każdego
            doradcy noszenia ClauWi®<br />2.&nbsp;&nbsp;&nbsp;&nbsp; Doradca działa w granicach prawa obowiązującego w
            kraju zamieszkania.<br />3.&nbsp;&nbsp;&nbsp;&nbsp; Doradca działa zgodnie z ogólnie przyjętymi zasadami
            przyzwoitości.<br />4.&nbsp;&nbsp;&nbsp;&nbsp; Doradca stara się być ostrożny w działaniach i wypowiedziach,
            unika agresji w jakimkolwiek jej przejawie.&nbsp;<br />5.&nbsp;&nbsp;&nbsp;&nbsp; Doradca prowadząc
            konsultacje działa zgodnie z dokumentem <strong>Zasady Pracy Doradcy</strong>{" "}podpisanym przez siebie po
            kursie podstawowym.&nbsp;<br />6.&nbsp;&nbsp;&nbsp;&nbsp; Doradca nie działa na szkodę innych doradców.<br />7.&nbsp;&nbsp;&nbsp;&nbsp;
            Doradca zobowiązuje się do ciągłego poszerzania i aktualizowania swojej wiedzy.<br />8.&nbsp;&nbsp;&nbsp;&nbsp;
            Doradca nie kopiuje treści udostępnianych przez innych specjalistów bez oznaczenia autora publikacji<br />9.&nbsp;&nbsp;&nbsp;&nbsp;
            Mając na celu dobro klientów doradca powinien powstrzymać się od wydawania osądów dotyczących sposobu
            opiekowania się dzieckiem przez jego opiekunów.<br />10.&nbsp; Ostateczny wybór sposobu noszenia należy do
            opiekunów dziecka, a doradca nie ocenia wyborów rodziców i nie wydaje osądów tych wyborów.<br />11.&nbsp;
            Doradca przestrzega zasad uczciwej konkurencji.<br />12.&nbsp; Jeśli jest to niezbędne do przeprowadzenia
            konsultacji, a doradcy brakuje narzędzi,&nbsp; wiedzy, doświadczenia w zakresie wsparcia złożonego problemu
            rodziny, która zgłosiła się na konsultację, to korzysta on ze wsparcia specjalistów lub innych doradców szkoły
            ClauWi®.<br />13.&nbsp; Sytuacje sporne w pierwszej kolejności należy próbować rozwiązać bezpośrednio między
            sobą. W przypadku braku powodzenia należy zwrócić się do osoby prowadzącej szkołę, która postara się pomóc w
            uzyskaniu porozumienia. Doradcy, którzy posiedli wiedzę o złamaniu przez kogoś kodeksu, lub doświadczyli
            złamania zasad kodeksu przez innego doradcę, mogą zgłosić się do trenera szkoły i omówić zaistniałą sytuację.
            Jeśli trener doszuka się przesłanek do podjęcia działań w związku ze złamaniem kodeksu, takowe podejmuje.
            Trener nie zajmuje się anonimami, a wszystkie jego działania są jawne. Możliwe konsekwencje złamania kodeksu
            to usunięcie z grupy wsparcia doradców, a także usunięcie z listy doradców szkoły ClauWi® z odpowiednią
            adnotacją w aktualnościach na stronie.&nbsp;
          </InfoBox>
        </div>
      </div>
    </PageShell>
  );
}
