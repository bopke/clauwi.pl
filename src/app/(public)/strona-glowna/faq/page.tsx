import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { Accordion, type AccordionItem } from "@/components/clauwi/accordion";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "strona-glowna/faq";

export const metadata: Metadata = staticPageMetadata(KEY);

// Questions and answers exactly as published (the FAQPage JSON-LD keeps its
// own copy in faq-data.ts).
const ITEMS: AccordionItem[] = [
  {
    title: <>Czy opłaty za kurs muszę dokonać od razu przy zakupie? Czy konieczna jest wpłata za cały kurs?</>,
    content: (
      <div className="flow">
        <p>Nie, zakup kursu nie wiąże się z obowiązkiem zapłaty i do momentu zapłacenia zaliczki jest traktowany jak wstępne zgłoszenie. Wszelkie instrukcje dotyczące płatności są zawarte w mailu, który otrzymasz od razu po rezerwacji miejsca na kursie</p>
      </div>
    ),
  },
  {
    title: <>Jestem mamą karmiącą. Czy mogę zabrać dziecko ze sobą na kurs?</>,
    content: (
      <div className="flow">
        <p>Zachęcamy mamy karmiące do realizowania karmienia na żądanie. Jednak sprawowanie osobistej opieki nad niemowlęciem podczas kursu może być zbyt obciążające dla uczestniczki, która powinna być możliwie najbardziej skupiona na treściach kursu. Na pozostałych uczetsników szkolenia obecność słodkiego maluszka także działa rozprężająco. Dlatego konieczne będzie wsparcie dodatkowej osoby, która zajmie się maluszkiem podczas gdy jego mama będzie ćwiczyć wiązania na kursie. Taką osobą może być Tata, Babcia, Ciocia, przyjaciel rodziny… Zawsze przy sali szkoleniowej jest dostępna dodatkowa przestrzen, gdzie mogą przebywac niemowlaki z opiekunami i w razie potrzeby maja blisko do mamy. A mama do nich 🙂</p>
      </div>
    ),
  },
  {
    title: <>Czy płatność za kurs można rozbić na raty?</>,
    content: (
      <div className="flow">
        <p>Płatności należy dokonać w dwóch częściach – zaliczka 600 zł po zgłoszeniu, która rezerwuje miejsce na kursie, i pozostała kwota 1900 zł płatna do dwóch tygodni przed kursem. Możliwe jest jednak opłacenie kursu w terminach niestandardowych, każdorazowo jest to ustalane indywidualnie, zapytaj!</p>
      </div>
    ),
  },
  {
    title: <>Czy konieczne jest ukończenie kursu zaawansowanego?</>,
    content: (
      <div className="flow">
        <p>Nie. Kurs zaawansowany jest szkoleniem dla chętnych, którzy chcą w sposób usystematyzowany poszerzać swoje kompetencje. Opanowanie treści kursu podstawowego wystarcza, aby w sposób prawidłowy i satysfakcjonujący pracować z rodzicami w charakterze doradcy noszenia</p>
      </div>
    ),
  },
  {
    title: <>Dlaczego zaświadczenie o ukończeniu kursu ważne jest tylko dwa lata</>,
    content: (
      <div className="flow">
        <p>Wiedza idzie do przodu, doradca powinien być na bieżąco. Szkoła chce też mieć pewność, że rekomenduje doradców pracujących zgodnie ze standardami szkoły, znających podstawowe techniki pracy z chustą i rodzicami. To dlatego raz na dwa lata doradca jest zobligowany do wzięcia udziału w refreshu, jednodniowym spotkaniu, które pozwala odświeżyć kompetencje i wymienic doświadczenia z innymi doradcami</p>
      </div>
    ),
  },
  {
    title: <>Jestem młodą mamą, pasjonatką noszenia. Mam spryt do wiązania, ale nie mam wiedzy dotyczącej anatomii, czy to nie przeszkoda?</>,
    content: (
      <div className="flow">
        <p>To wspaniałe, że chcesz dzielić się swoją pasją z innymi młodymi mamami! Na kursie będziesz mogła zweryfikowac swoje techniki wiązania tak, aby stały sie one bardziej uniwersalne i abyś świadomie mogła je dobierać w indywidualnej pracy z rodzicami. Poznasz też w wystarczającym stopniu podstawy anatomii, a także fizjologii, rozwoju dziecka, zmian okołoporodowych w kobiecie i w rodzinie. Otrzymasz listę lektur, dzięki którym będziesz mogła poszerzyć wiedzę w tych zakresach. No i dostaniesz wsparcie grupy doradców!</p>
      </div>
    ),
  },
  {
    title: <>Wykonuję zawód medyczny, znajomość technik wiązania chusty przyda mi się w pracy zawodowej, ale nigdy jeszcze nie dotykałam chusty. Czy dam rade nauczyć się technik wiązania przez trzy dni?</>,
    content: (
      <div className="flow">
        <p>Cudownie, że chcesz wesprzeć swoich pacjentów/pacjentki chustą 🙂 Przez trzy dni nie osiągniesz beigłosci w wiązaniu, ale poznasz mechanikę chusty, wielokrotnie wiążąc zautomatyzujesz większość ruchów, pod czujnym okiem trenera wyeliminujesz większość błędów i otrzymasz wskazówki, w jaki sposób dalej ćwiczyć, aby osiągnąć niezbędny poziom. Możesz brać udział w refreshach – nawet od razu po kursie 🙂 możesz też uzyskac dalszą pomoc, jeśli tylko będzie potrzebna. Celem szkoły jest, aby wszyscy absolwenci byli aktywni i wierzyli w swoje siły i umiejętności, by realnie wykorzystywac je w codziennej pracy z rodzicami {"<"}3&nbsp;</p>
      </div>
    ),
  },
  {
    title: <>Chcę skorzystac z dofinansowania, czy jest taka możliwość?</>,
    content: (
      <div className="flow">
        <p>Tak, firma znajduje się w Rejestrze Firm Szkoleniowych, kilka udanych dofinansowanych kursów/szkoleń za nami 🙂 najważniejsze jednak – wszystkie procedury urzędowe muszą być zakończone na co najmniej tydzień przed rozpoczęciem kursu. Muszą! Możliwe jest też finansowanie z BUR, ale ta możliwość ograniczona jest do kursów odbywających się w Lublinie</p>
      </div>
    ),
  },
];

export default function FaqPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <div className="flex justify-center px-[25px] pt-[7px] pb-[17px]">
        <div className="mb-8 w-full max-w-[740px] pt-[10px]">
          <h2 className="mb-[60px] text-center text-[28px] font-bold leading-[42px] text-[#1a202c]">Najczęściej zadawane pytania</h2>
          <Accordion items={ITEMS} />
        </div>
      </div>
    </PageShell>
  );
}
