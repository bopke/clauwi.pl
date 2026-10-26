import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { PageHeading, Row } from "@/components/clauwi/layout";
import { Tabs, type TabItem } from "@/components/clauwi/tabs";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "strona-glowna/system-ksztalcenia";

export const metadata: Metadata = staticPageMetadata(KEY);

const SYSTEM_FONT =
  '-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const TABS: TabItem[] = [
  {
    id: "kurs-podstawowy",
    title: "Kurs Podstawowy",
    content: (
      <div className="flow pb-[25px]">
        <p><strong>1. Czas trwania</strong>: 30 godzin szkoleniowych (obszerny blok zajęć praktycznych)</p>
                  <p><strong>2. Kurs przeznaczony jest dla osób</strong>, które:&nbsp;</p>
                  <ul><li>pragną propagować prawidłowe noszenie dzieci w chustach wiązanych (pasjonaci noszenia, bez wykształcenia medycznego)</li>
                    <li>pragną podnieść swoje kwalifikacje</li>
                    <li>nie mają doświadczenia chustowego, ale na co dzień zawodowo mają kontakt z małymi dziećmi i z rodzicami (fizjoterapeuci, położne, lekarze)</li></ul>
                  <p><strong>3.</strong>&nbsp;<strong>Uprawnienia po ukończeniu kursu</strong>:&nbsp;</p>
                  <ul><li>Uczestnik ma uprawnienia do prowadzenia zajęć indywidualnych z rodzicami oraz spotkań informacyjnych na temat noszenia dla rodziców oraz personelu fachowego. Osoby, które posiadają umiejętności prowadzenia zajęć grupowych mogą po tym kursie prowadzić również małe grupy warsztatowe.</li>
                    <li>Uczestnik po pozytywnym ukończeniu kursu otrzymuje zaświadczenie oraz tytuł&nbsp;<strong>Doradcy Noszenia ClauWi®.&nbsp;</strong></li>
                    <li>Uprawnienia są ważne dwa lata od wydania zaświadczenia.</li></ul>
                  <p><strong>4. Ogólny zarys programu szkoleniowego:</strong></p>
                  <ul><li>Podstawy anatomii i rozwoju dziecka w 1 roku życia</li>
                    <li>Ćwiczenia z własnym ciałem utrwalające zdobytą wiedzę w zakresie rozwoju dziecka w pierwszym roku życia</li>
                    <li>Intensywna nauka wiązań – wszystkie wiązania podstawowe: kangur, kieszonka, plecak prosty, 2x, chusta kółkowa z odwróconą krawędzią</li>
                    <li>Zalety noszenia dla dziecka</li>
                    <li>Zalety noszenia dla rodziców</li>
                    <li>Noszenie bliźniąt i dzieci przedwcześnie urodzonych</li>
                    <li>Kangurowanie dzieci przedwcześnie urodzonych</li>
                    <li>Zasady prawidłowego i bezpiecznego noszenia</li>
                    <li>Metodyka prowadzenie zajęć z rodzicami&nbsp;</li>
                    <li>Umiejętność doboru odpowiedniej chusty i nosidła dla dziecka na określonym etapie rozwojowym oraz dla rodzica</li>
                    <li>Analiza fizjoterapeutyczna poszczególnych wiązań pod względem ich wpływu na dziecko i rodzica</li>
                    <li>Zasady ergonomii pracy Doradcy (jak chronić własne stawy i układ kostno-mięśniowy)</li>
                    <li>Omówienie profesjonalnego wyposażenia Doradcy</li></ul>
                  <p><strong>5. Cena kursu:</strong>&nbsp;2 800 zł.&nbsp;</p>
                  <p></p>
                  <p className="text-center">sprawdź <Link href="/kalendarz-wydarzen">terminy kursów</Link></p>
      </div>
    ),
  },
  {
    id: "kurs-zaawansowany",
    title: "Kurs Zaawansowany",
    content: (
      <div className="flow pb-[25px]">
        <ol><li><strong>Czas trwania:</strong> 35 godzin szkoleniowych ( obszerny blok zajęć praktycznych), zajęcia piątek-niedziela</li>
                    <li>Kurs przeznaczony jest <strong>dla</strong> osób, które ukończyły kurs podstawowy i posiadają tytuł Doradcy Noszenia ClauWi®</li>
                    <li><strong>Uprawnienia</strong> po ukończeniu kursu: uczestnik może rozpocząć proces certyfikacji</li>
                    <li>Ogólny <strong>zarys</strong> programu szkoleniowego:<br />* Pogłębienie <strong>metodyki</strong> prowadzenia zajęć z rodzicami, techniki prowadzenia zajęć.<br />* <strong>Praca rozwojowa w grupie</strong> z zadaniami domowymi z Kursu podstawowego.<br />* Sposoby prawidłowej stymulacji niemowlęcia poprzez zabawę i techniki <strong>naturalnej pielęgnacji</strong> z uwzględnieniem etapu rozwojowego: sposoby bezpiecznego przenoszenia, przekazywania sobie dziecka przez rodziców, wykonywania podstawowych czynności pielęgnacyjnych<br />* Noszenie dzieci <strong>z wyzwaniami rozwojowymi</strong> – strona fizyczna oraz emocjonalna:<br />wcześniaki, tracheotomia, stomia, zespół Downa, mukowiscydoza, sondy, monitorowanie, zaburzenia trawienia, podwyższone i obniżone napięcie mięśniowe, dzieci z rozszczepem wargi i podniebienia, dzieci spastyczne, AZS, dermatoza itd. <br />* Noszenie <strong>w sytuacjach szczególnych</strong> dla rodziców: cesarskie cięcie, problemy z kręgosłupem, depresja poporodowa, wózek inwalidzki.<br />* <strong>Praktyczna nauka wiązań</strong>: powtórzenie wiązań z kursu podstawowego oraz nowe wiązania (duża część kursu): plecak z koszulką, plecak z krzyżem, kanga z chusty długiej, kangur na biodrze, siodełko. <br />* Dobór <strong>nosideł</strong>, obszerny blok praktyczny</li>
                    <li>Kurs zaawansowany zawiera w sobie refresh.</li></ol>
                  <p>Cena kursu to 2 200 zł.</p>
      </div>
    ),
  },
  {
    id: "tab-certyfikat",
    title: "Certyfikat",
    content: (
      <div className="flow py-6">
        <p>O&nbsp;<strong>Certyfikat i tytuł Certyfikowanego Doradcy Noszenia ClauWi®</strong>&nbsp;może ubiegać się osoba, która ukończyła&nbsp;<strong>Kurs zaawansowany</strong>. Każdy uczestnik tego szkolenia otrzymuje komplet pytań egzaminacyjnych.</p>
                  <ul><li>Aby otrzymać&nbsp;<strong>Certyfikat ClauWi®</strong>&nbsp;należy w ciągu&nbsp;<strong>3 miesięcy</strong>&nbsp;<strong>od ukończenia Kursu zaawansowanego</strong>&nbsp;przedłożyć wskazanemu trenerowi opracowaną samodzielnie pracę egzaminacyjną. Przedłużenie tego terminu może nastąpić jedynie za pisemną zgodą Szkoły ClauWi®.</li>
                    <li>Praca zostanie zweryfikowana w ciągu&nbsp;<strong>3 miesięcy</strong>&nbsp;od momentu jej przedłożenia.&nbsp;</li></ul>
                  <p>Doradca otrzymuje szczegółowe uwagi do swojego opracowania. Dopuszcza się składanie drobnych poprawek oraz uzupełnień do pracy egzaminacyjnej, o ile ogólny poziom pracy jest zadowalający.</p>
                  <p>Poprawioną wersję pracy należy przesłać do trenera w ciągu&nbsp;<strong>30 dni</strong>.</p>
                  <ul><li>Po zaakceptowaniu pracy Doradca otrzymuje tytuł&nbsp;<strong>Certyfikowanego Doradcy Noszenia ClauWi®</strong></li></ul>
                  <p><strong>Opłata</strong></p>
                  <p>Koszt wydania Certyfikatu wynosi 400 zł. Opłatę należy uiścić w momencie składania pracy certyfikacyjnej w ClauWi®. Jest to warunkiem rozpoczęcia jej weryfikacji.</p>
      </div>
    ),
  },
  {
    id: "refresh",
    title: "Refresh",
    content: (
      <div className="flow">
        <p>Doradcy Noszenia Clauwi® po&nbsp;<strong>Kursie podstawowym</strong>&nbsp;oraz po&nbsp;<strong>Kursie zaawansowanym</strong>&nbsp;zobowiązani są do udziału w jednodniowych&nbsp;<strong>Spotkaniach Doszkalających</strong>&nbsp;“Refresh” organizowanych przez Szkołę Noszenia ClauWi® w poszczególnych regionach Polski lub online.</p>
          <p>W celu zachowania uprawnień Doradca będzie się doszkalał n<strong>ie rzadziej niż raz na 2 lata</strong>. Jeśli organizator wyrazi zgodę, Doradca może wziąć udział w Spotkaniu Doszkalającym “Refresh” również w innym regionie. Podczas Spotkań aktualizowana i weryfikowana będzie głównie praktyczna umiejętność wykonywania poszczególnych wiązań i przekazywane informacje niezbędne do wykonywania pracy Doradcy Noszenia ClauWi®.</p>
          <p>Brak terminowego udziału w Spotkaniu Doszkalającym “Refresh” skutkuje usunięciem danych z listy rekomandowanych doradców ClauWi, oraz odebraniem dostępu do doradczej grupy wsparcia. Aby przywrócić uprawnienia w ciągu roku od ich wygaśnięcia wystarczy ukończyć “Refresh”, natomiast jeśli minie więcej niż rok – konieczne będzie ponowne ukończenie kursu podstawowego. Można w takiej sytuacji ubiegac się o obniżkę ceny kursu o 50%.</p>
      </div>
    ),
  },
  {
    id: "tab-zapewniamy",
    title: "Zapewniamy",
    content: (
      <div className="flow">
        <p><strong>W cenie kursu zapewniamy:</strong></p>
          <ul><li>profesjonalne materiały szkoleniowe w j.polskim</li>
            <li>pomoce dydaktyczne, modele</li>
            <li>różnego rodzaju chusty i nosidła, a także lalki na których uczestnicy mogą wykonywać wiązania</li>
            <li>komfortowe sale szkoleniowe</li>
            <li>literatura fachowa do wglądu</li>
            <li>wpisanie danych uczestnika na&nbsp;<strong>listę Doradców Noszenia ClauWi®</strong></li>
            <li>zaświadczenie o ukończeniu kursu</li>
            <li>przerwy kawowe, drobne przekąski i napoje</li>
            <li>uczestnicy mogą na szkolenie przybyć z niemowlęciem karmionym piersią (konieczny jest udział osoby do opieki nad dzieckiem)</li></ul>
          <p>Cena kursu nie obejmuje kosztów obiadów i innych posiłków, noclegów oraz przejazdów.</p>
      </div>
    ),
  },
  {
    id: "tab-cozabranakurs",
    title: "Co zabrać na kurs",
    content: (
      <div className="flow">
        <p><strong>Aby na kursie ClauWi® czuć się komfortowo prosimy o zabranie:</strong></p>
          <ul><li>obowiązkowo&nbsp;<strong>sportowego</strong>, wygodnego ubrania</li>
            <li>ciepłych skarpetek lub miękkiego obuwia na zmianę</li>
            <li>lalki o następujących parametrach:
              <ul><li>wielkości noworodka (53-55 cm)</li>
                <li>dociążonej do wagi minimum 3 kg</li>
                <li>nóżki od kolan, ud wykonane z miekkiego materiału</li></ul></li></ul>
          <p>Instrukcję wypełnienia lalki możemy podać na życzenie.</p>
          <ul><li>ewentualnie swojej ulubionej chusty wiązanej, kółkowej, nosidła</li></ul>
          <p>Dla osób nie posiadających lalki lub chust zapewniamy na czas kursu odpowiednią lalkę i chusty do ćwiczeń. Jednak najlepiej posiadać swój sprzęt, aby bezpośrednio po kursie mieć na czym pracować.&nbsp;</p>
      </div>
    ),
  },
];

export default function SystemKsztalceniaPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <Row className="bg-[#f4f4f4]" innerClassName="pt-[25px]">
        <div className="my-[35px]">
          <PageHeading className="my-0 mb-[29px] text-center">system kształcenia</PageHeading>
          <p
            className="text-[16px] font-light uppercase leading-[25.6px] tracking-[0.3px] text-[#b35755]"
            style={{ fontFamily: SYSTEM_FONT }}
          >
            Szkoła Noszenia ClauWi® proponuje kompleksowy system kształcenia w zakresie noszenia dzieci w chustach wiązanych i oferuje trzy poziomy ścieżki doradczej.<br />
          </p>
        </div>
      </Row>
      <Row innerClassName="pb-[65px]">
        <Tabs tabs={TABS} />
      </Row>
      <Row className="bg-[#f4f4f4]" innerClassName="pt-[25px]" id="uprawnienia">
        <div className="my-[35px]">
          <PageHeading className="my-0 mb-[50px] text-center">ważność uprawnień</PageHeading>
          <p className="text-[#b35755]">
            Doradca Noszenia ClauWi® zobowiązany jest do stałego podnoszenia swoich kwalifikacji i utrzymywania prowadzonego doradztwa na wysokim poziomie. W tym celu konieczna jest stała&nbsp;<strong>aktualizacja</strong>&nbsp;oraz&nbsp;<strong>weryfikacja</strong>&nbsp;wiedzy Doradcy.&nbsp;<br /><br /><strong>Certyfikat ClauWi®</strong>&nbsp;ważny jest <strong>2 lata</strong> od momentu jego wydania. W celu przedłużenia ważności Certyfikatu Doradca Noszenia zobowiązany jest do udziału w Konferencji Doszkalającej organizowanej przez Szkołę Noszenia ClauWi® w Polsce. Doradca może również wziąć udział w Konferencji Doszkalającej organizowanej przez Szkołę ClauWi® za granicą. Konferencje będą odbywać się raz na dwa lub trzy lata, w zależności od potrzeb.<br /><br />Doradcy Noszenia Clauwi® po&nbsp;<strong>Kursie podstawowym</strong>&nbsp;oraz po&nbsp;<strong>Kursie zaawansowanym</strong>&nbsp;zobowiązani są do udziału w jednodniowych&nbsp;<strong>Spotkaniach Doszkalających</strong>&nbsp;organizowanych przez Szkołę Noszenia ClauWi® w poszczególnych regionach Polski. W celu zachowania uprawnień Doradca będzie się doszkalał nie rzadziej niż <strong>raz na 2 lata</strong>. Jeśli organizator wyrazi zgodę, Doradca może wziąć udział w Spotkaniu Doszkalającym również w innym regionie. Podczas Spotkań aktualizowana i weryfikowana będzie głównie praktyczna umiejętność wykonywania poszczególnych wiązań i przekazywane informacje niezbędne do wykonywania pracy Doradcy Noszenia ClauWi®.<br />
          </p>
        </div>
      </Row>
    </PageShell>
  );
}
