import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { Bleed, Breadcrumbs, ContentArea, PALATINO } from "@/components/clauwi/layout";
import { OpinionForm } from "@/components/clauwi/opinion-form";
import { TestimonialCard } from "@/components/clauwi/testimonial-card";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "opinie";

export const metadata: Metadata = staticPageMetadata(KEY);

const SYSTEM_FONT =
  '-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

// Testimonials exactly as published, formatting quirks included (some titles
// and texts are italic, some names bold).
export default function OpiniePage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <ContentArea>
        <Breadcrumbs trail={[{ label: "Opinie" }]} />
        <Bleed className="bg-[#f7fafc]">
          <div className="mx-auto max-w-[1290px] px-6">
            <div className="my-[35px]">
              <h2
                className="mb-[13px] text-[37px] font-extralight uppercase leading-[55.5px] text-[#692d2c]"
                style={{ fontFamily: PALATINO }}
              >
                Opinie kursantów
              </h2>
              <p
                className="text-[16px] font-light uppercase leading-[25.6px] tracking-[0.3px] text-[#b35755]"
                style={{ fontFamily: SYSTEM_FONT }}
              >
                Każda opinia naszych kursantów jest dla nas bardzo ważna i wartościowa i każda czegoś nas uczy. <br />Dzięki
                opiniom mamy możliwość stałego doskonalenia naszych kursów, by były jak najwyższej jakości.<br />Będzie nam
                ogromnie miło, jeśli po ukończonym kursie podzielisz się przemyśleniami o nim.
              </p>
            </div>
            <OpinionForm />
          </div>
        </Bleed>
        <div className="grid gap-[30px] pt-[25px] pb-[26px]">
        <TestimonialCard title={<><em>Idealne proporcje</em></>} author={<><strong>Adriana Stąpor (kurs I &nbsp;2017)</strong></>}>
          <em><em>Wybierając się na kurs, obawiałam się, że to będzie takie trochę “pitu pitu” , jakie to chusty są
          fajne… A tu niespodzianka – bardzo wysoki poziom merytoryczny i organizacyjny, idealne proporcje między wiedzą
          teoretyczną, a praktycznymi ćwiczeniami, świetnie opracowane materiały szkoleniowe, no i imponujące zaplecze
          chustowo-nosidłowe! Byłam pod ogromnym wrażeniem tego, jak można wykazać maksimum elastyczności wobec
          uczestniczek, które są też młodymi mamami, jednocześnie zachowując pełen profesjonalizm szkolenia. Wysokie
          wymagania wobec przyszłych doradców, którzy swoimi nazwiskami mają reprezentować ClauWi, a jednocześnie
          świetna, przyjacielska wręcz atmosfera spotkania.</em></em>
        </TestimonialCard>
        <TestimonialCard title={<>Nieocenione wsparcie poszkoleniowe</>} author={<>Aleksandra Gabor</>}>
          <em><em>Uczyłam się od ClauWianki i sama zapragnęłam nią zostać. Szkolenia tej szkoły to nie tylko technika,
          ale i budowanie kompetencji społecznych. Cudowna atmosfera i nieocenione wsparcie poszkoleniowe.</em></em>
        </TestimonialCard>
        <TestimonialCard title={<>Cierpliwe tłumaczenie</>} author={<><strong>Diana Wiśniowska-Krawczyk (kurs XI2016)</strong></>}>
          <em>Jako mama, która w temacie noszenia przeszła przez etap błądzenia, takie osoby jak Iza są jak światełko w
          tunelu. Poprzez cierpliwe omawianie zagadnień dotyczących noszenia, tłumaczenie filozofii i aspektów z
          noszeniem związanych oraz okraszanie tego poczuciem humoru, który rozładuje każde napięcie i stres związany z
          wiązaniem nawet te najmniej doświadczone mamy, Iza pełni rolę doskonałego przewodnika i
          nauczyciela.&nbsp;Motywuje, zachęca. Kurs prowadzony przez szkołę ClauWi otwiera oczy na to, co daje taka
          bliskość. Jak bliskość, która jest motana w prawidłowy sposób, może pomóc nie tylko dziecku ale również
          rodzicom. To godziny praktyki, potu i łez ale również ogromnej satysfakcji z tego, co można poprzez to
          osiągnąć</em>
        </TestimonialCard>
        <TestimonialCard title={<>Wiedza i doświadczenie</>} author={<><strong>Dobrochna Moździerz (kursXI2016)</strong></>}>
          <em>Wiedza i doświadczenie trenerki – Izy – nie do przecenienia. Bardzo mądra kobieta, dzięki której, przy
          odrobinie dobrej woli i otwartego umysłu odbiorcy, można dowiedzieć się bardzo wiele, ale też wiele sobie
          poukładać i sporo zrozumieć. Sam kurs na doradcę noszenia nie polega wyłącznie na odbiorze, uczestnik ma
          możliwosc poczuc i zrozumiec, nie tylko istotę noszenia, ale także myslenie i odczuwanie rodzicow, a jesli
          jest na to otwarty – takze cos w sobie. Zeby nie było zbyt kolorowo – zdjęcie profilowe… widywałam
          ładniejsze&nbsp;</em>
        </TestimonialCard>
        <TestimonialCard title={<>Ciągłe doskonalenie</>} author={<><strong>Agnieszka Ciupa</strong></>}>
          <em>Kurs mam w pamięci do dziś a sposób w jak trenerka Iza przekazuje wiedzę, jej podejście do uczestników
          sprawia, że nauka jest czystą przyjemnością. Możliwość regularnego kontaktu ze społecznością doradców ClauWi
          jak również z Izą, którą zapewnia Szkoła ClauWi pozwala na ciągłe doskonalenie swoich umiejętności oraz
          konsultowanie pojawiających się wątpliwości. Każdemu kto szuka kursu- szczerze polecam! Dziękuję !</em>
        </TestimonialCard>
        <TestimonialCard title={<>Rozłożenie wiązań na czynniki pierwsze</>} author={<><strong>Justyna Starzyk</strong></>}>
          <em>Jeśli zastanawiacie się nad kursem na doradcę noszenia, to szczerze polecam wybranie Szkoły Noszenia
          ClauWi. Podczas kursu można zdobyć wiedzę odnośnie rozwoju fizycznego małego człowieka, korzyściach noszenia
          czy też zasad prawidłowego i bezpiecznego noszenia. To, co było dla mnie bardzo wartościowe to rozłożenie
          wiązań na czynniki pierwsze, tak, aby dokładnie zrozumieć ich wpływ na dziecko i na osobę noszącą.</em><br /><em>Dodam,
          że Szkoła ClauWi to nie tylko kilkudniowy kurs, to grupa zrzeszająca doradców, na których zawsze można liczyć
          – wesprą zarówno profesjonalną wiedzą, jak i dobrym słowem. Fajnie znaleźć się w ich gronie</em>
        </TestimonialCard>
        <TestimonialCard title={<>Jako lekarz</>} author={<><strong>Anna Kuc</strong></>}>
          <em>Jestem pełna podziwu dla profesjonalizmu szkolenia dla doradców noszenia ClauWi. Jako lekarz zdecydowanie
          pozytywnie oceniam treści dotyczące rozwoju dziecka i anatomii. Odpowiednio dużo czasu poświęca się też na
          naukę wiązań. Kończąc kurs doradca jest wyposażony w umiejętności manualne, wiedzę oraz znajomość zasad jak
          powinna przebiegać dobra konsultacja. Byłam do tej pory uczestniczką licznych kursów na różny temat i niejeden
          raz miałam poczucie, że temat był ledwie zaczęty, a do wdrożenia do w praktykę jeszcze daleka droga. Tu jest
          zupełnie inaczej. Doradcy po kursie są gotowi by wyjść ze swoimi umiejętnościami do rodziców chcących nosić
          dzieci. Jestem również pod wrażeniem prowadzącej Izy Banach-Kubik. Rzadko się spotyka osobę, która potrafi być
          asertywna, rzeczowa i uprzejma jednocześnie. Polecam kurs gorąco, również profesjonalistom</em>
        </TestimonialCard>
        <TestimonialCard title={<>Nie zawiodłam się</>} author={<><strong>Diana Czajczyńska</strong></>}>
          <em>Kurs był pełen rzetelnej wiedzy dotyczącej rozwoju dziecka, każde zagadnienie było dokładnie zobrazowane
          na modelu kręgosłupa i poparte ćwiczeniami z własnym ciałem, dzięki czemu zdobyłam dużą świadomość zależności
          w pozycji dziecka i różnic w poszczególnych wiązaniach. Było też dużo praktycznej nauki z chustą, każdy
          uczestnik miał możliwość dokładnego dopracowania tego, co sprawia mu problem, wiązaliśmy chustę odwołując się
          zarówno do zdobytej wiedzy i omówienia kroków, jak i wyczucia i pamięci własnego ciała oraz uwagi na jego
          sygnały. Kurs miał bardzo logiczną strukturę tak, żeby stopniowo zrozumieć coraz większe szczegóły, teraz jako
          doradca w taki sam przejrzysty sposób tłumaczę rodzicom zagadnienia związane z prawidłowym noszeniem, a do
          materiałów z kursu zaglądam do dzisiaj. Małe, kameralne grupy oraz bardzo ciepła i wspierająca atmosfera w
          czasie szkoleń dawały możliwość uczenia się od siebie nawzajem, pomagania i zdobycia wielu cennych rad i
          opinii nie tylko od trenerów Szkoły, ale także od innych uczestników, często noszących rodziców lub
          specjalistów w pokrewnych dziedzinach.</em>
        </TestimonialCard>
        <TestimonialCard title={<>Dużo wiedzy i praktyki</>} author={<><strong>Gosia Bukal</strong></>}>
          <em>Wspaniałe 3 dni szkoleń! Był to bardzo miło spędzony czas z cudowną, pozytywną energia </em><span className="block size-4 text-left text-[16px] leading-4" role="img" aria-label="🙂">🙂</span><em> dużo
          wiedzy teoretycznej jak i praktycznej. Gorąco polecam</em>
        </TestimonialCard>
        <TestimonialCard title={<>W kręgu kobiet</>} author={<><strong>Ola Adamska</strong></>}>
          <em>To, co działo się przez te 3 dni to czysta magia. Jestem zaszczycona, że spędziłam ten czas w kręgu kobiet
          wierzących w to samo w kwestii macierzyństwa. Iza to mega ciepła i empatyczna a zarazem konkretna babka. Życzę
          sobie, abym szybko mogła powtórzyć to doświadczenie.</em>
        </TestimonialCard>
        <TestimonialCard title={<>Profesjonalnie i sympatycznie.</>} author={<><strong>Asia Krzywicka</strong></>}>
          <em>Te 3 dni szkoleń to był naprawdę przemiły czas. Zarówno część teoretyczna jak i praktyczna była prowadzona
          w bardzo profesjonalny sposób, z zachowaniem przy tym bardzo sympatycznej atmosfery. Mam nadzieję, że się
          jeszcze spotkamy na kursie zaawansowanym.</em>
        </TestimonialCard>
        <TestimonialCard title={<>Intensywny kurs</>} author={<><strong>Paulina Maciaszek</strong></>}>
          <em>Kurs bardzo intensywny, bogaty w wiedzę, poszerzający kompetencje i umiejętności. Szkolenie ogromnie
          pomogło mi poukładać sobie wiele rzeczy i zaufać sobie. Cieszę się, że zdecydowałam się na ten krok.</em>
        </TestimonialCard>
        <TestimonialCard title={<>Nie tylko JAK ale i PO CO</>} author={<><strong>Sylwia Piątkiewicz</strong></>}>
          <em>Brałam udział w kursie podstawowym na doradcę noszenia. Już wcześniej uczyłam się techniki poszczególnych
          wiązań, miałam parę lat praktyki, ale na kursie nauczyłam się czegoś więcej niż tego “jak”. Teraz wiem
          dokładnie “po co”</em><br /><em>Kurs był dla mnie nie tylko możliwością zdobycia nowych kompetencji, ale – jak
          okazało się w trakcie – chustowymi rekolekcjami (kto bywał na rekolekcjach, ten wie!), ponieważ pomógł mi
          poukładać wiele rzeczy w głowie, przemyśleć swoje cele związanie z noszeniem i uczeniem noszenia. Nie wspomnę
          już nawet o tym, że był on dla mnie przydatny osobiście/prywatnie – bo teraz z pełną świadomością noszę
          swojego malucha.</em><br /><em>Poza tym – to nie sam kurs, ale osoba prowadząca stanowi o jego jakości i tutaj
          muszę przyznać, że było to dla mnie wydarzenie nie tylko szkoleniowe, ale ogólnorozwojowe, ponieważ Iza
          integruje wiedzę z różnych dziedzin i przekazuje ją we wspaniały, spójny sposób swoim kursantom (a atmosfera
          mega sprzyjająca). Kompleksowa sprawa! Krótko mówiąc – polecam! Gdybym mogła, jutro bym to powtórzyła, dla
          czystej przyjemności.</em>
        </TestimonialCard>
        <TestimonialCard title={<>Pasja</>} author={<><strong>Magda Maliniewicz</strong></>}>
          <em>Kurs ClauWi to najlepsza decyzja jaką podjęłam. Niesamowicie aktywnie, miło i przyjemnie spędzony czas.
          Ogrom wiedzy przekazany w tak ciekawy i zajmujący sposób… . Mam nadzieję, że ta pozytywna energia, którą z
          taką pasją dzieli się Iza, będzie się we mnie ładnie rozwijać. Było… cudownie! Iza… nadal jestem pod wrażeniem
          i podoba mi się ten stan! Dziękuję</em>
        </TestimonialCard>
        <TestimonialCard title={<>Wyszłam z wiedzą i motywacją</>} author={<><strong>Paulina Baranowska</strong></>}>
          <em>Miałam ogromna przyjemność brać udział w szkoleniu na doradcę noszenia. Było cudownie! Wyszłam z ogromną
          wiedzą, motywacja i poczuciem że mogę więcej niż mi się wydawało.</em><br /><em>Kurs daje dużo wiedzy
          praktycznej ale też mnóstwo teoretycznej, szczególnie ważnej aby móc bezpiecznie nosić maleństwo. Szczerze
          polecam !</em>
        </TestimonialCard>
        <TestimonialCard title={<>Pełna aktualna wiedza</>} author={<><strong>Dominika Kalkowska</strong></>}>
          <em>Po trzech dniach kursant wychodzi z głową pełną aktualnej wiedzy o bezpiecznym noszeniu dzieci w chustach
          i nosidłach, oraz z powstałą w głowie w trakcie kursu listą nowych pyta na które sam chce szukać odpowiedzi,
          poprzez aktywne doradztwo i dalsze kształcenie w tym kierunku. Uczestnictwo w szkoleniu na Doradcę noszenia
          ClauWi, było dla mnie niesamowitym doświadczeniem, mam zaszczyt należeć do tego wyjątkowego grona osób
          szerzących rodzicielstwo bliskości, poprzez doradztwo. Pięknie dziękuję za tę możliwość i zaufanie.</em>
        </TestimonialCard>
        <TestimonialCard title={<>Stosy chust</>} author={<><strong>Weronika Dudek</strong></>}>
          <em>Pełen profesjonalizm, ogromna wiedza i bardzo dobry przekaz. Kurs minął w przyjaznej atmosferze. Cudowne
          stosy chust, materiały szkoleniowe do których wracam z chęcią. Polecam z całego serca!</em>
        </TestimonialCard>
        <TestimonialCard title={<>Będzie mi brakowało!</>} author={<><strong>Klaudia Balin</strong></>}>
          <em>Szkolenie było przefantastyczne i aż żal mi że to “tylko” 3 dni bo będzie mi brakowało was wszystkich,
          wspaniałej atmosfery oraz wykładów i treningu prowadzonych przez Izę która ma wspaniałe zdolności
          przekazywania wiedzy. Wszystkim mamom, tatusiom oraz pozostałym osobom które się wciąż nie mogą zdecydować
          serdecznie polecam!</em>
        </TestimonialCard>
        <TestimonialCard title={<>Więź między uczestnikami</>} author={<><strong>Aga Szyszka</strong></>}>
          <em>Iza jest otwartą, sympatyczną i ciepłą osobą ,która z niesamowitą łatwością i pełnym zaangażowaniem
          potrafi przekazać swoim kursantom obszerną wiedzę. Podczas kursu tworzy się między uczestnikami więź i wręcz
          rodzinna atmosfera, a to wszystko dzięki osobowości Izy. Iza przekazuje nam swoją wiedzę i zaraża nas
          optymizmem do działania i motywuje nas do pracy. Po zakończeniu kursu aż chce się iść na kolejny by znów móc
          to przeżyć. Jednak co najważniejsze po ukończonym kursie czuję się dużo bardziej świadoma w temacie zdrowego
          noszenia dzieci oraz gotowa by szerzyć swoją wiedzę i pomagać innym rodzicom raczkującym w temacie chust czy
          nosideł. Każdemu kto zastanawia się czy warto wybrać się na kurs odpowiem ,że zdecydowanie ja polecam</em>
        </TestimonialCard>
        </div>
      </ContentArea>
    </PageShell>
  );
}
