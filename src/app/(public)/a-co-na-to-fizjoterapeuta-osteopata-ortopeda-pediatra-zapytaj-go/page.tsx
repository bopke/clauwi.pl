import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostImage } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function ACoNaToFizjoterapeutaOsteopataOrtopedaPediatraZapytajGoPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p><em>Autorka: Izabela Banach</em></p>
        <p>Jeśli chcesz upewnić się, czy Twój zaufany specjalista nie widzi przeciwwskazań do noszenia maluszka w
        chuście, zapytaj go koniecznie o zdanie. Pamiętaj jednak, aby sformułować pytanie w odpowiedni sposób, aby
        specjalista, nawet jeśli nie ma wiedzy o chustach, mógł ocenić sytuację realnie. Bez tego opinia jaką
        usłyszysz będzie oparta na wyobrażeniu o chustach, lub domysłach, albo zaobserwowaniu na ulicy lub w serialu
        rodzica z dzieckiem w chuście zawiązanym niezbyt poprawnie.</p>
        <p>Zatem co powinien wiedzieć specjalista, aby wypowiedzieć się nt twojego dziecka w chuście?</p>
        <PostImage src="/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-1024x720.jpg" alt="Izabela Banach nosząca dziecko w chuście kangurowej" width={292} height={205} align="right" srcSet="/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-1024x720.jpg 1024w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-300x211.jpg 300w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-768x540.jpg 768w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2-600x422.jpg 600w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur2.jpg 1227w" sizes="(max-width: 292px) 100vw, 292px" caption={<>wiązanie
        Kangur zdj. dzięki uprzejmości www.przytobie.com</>}/>
        <p>Charakterystyka pozycji dziecka do jakiej dążymy w chuście to pozycja zgięciowo-odwiedzeniowa. W naszym
        doradczym żargonie nazywamy ją pzo. W tej pozycji odwiedzenie kończyn dolnych nie przekracza 90 stopni,
        natomiast stawy biodrowe pozostają w zgięciu przekraczającym 90 stopni. Ta pozycja umożliwia pochylenie
        miednicy dziecka do tyłu, a to z kolei prowokuje kręgosłup do pozostawania z lekkim zaokrągleniu oraz kieruje
        aktywność mięśniową dziecka do przodu. Zatem ciało dziecka pozostaje zebrane, a jego główka ma tendencję do
        opadania na ciało rodzica i przenoszenia tam swojego ciężaru, zamiast na niedojrzały kręgosłup. Przywiedzione
        do tułowia i zgięte w łokciach rączki pomagają ustabilizować symetrię ułożenia ciała maluszka i ułożenie
        główki w osi kręgosłupa. Przy odrobinie uważności przy pozycjonowaniu, dziecko może dostać aktywizację z guzów
        kulszowych, co wpłynie bardzo korzystnie na dystrybucję napięcia mięśniowego. Chusta zapewnia bezpieczne
        podparcie całego ciała dziecka, co odciąża dodatkowo jego kręgosłup, chroni dziecko przez nadmiernym
        pobudzeniem, a także pozwala mu pozostawać w zgięciu nie prowokując do wyprostów. Pozwala dziecku długotrwale
        przywrzeć do rodzica zgodnie z jego największą potrzebą. Odwiedzenie kończyn dolnych jest stabilne i
        symetryczne, a głowy kości udowych naciskają centralnie na panewkę stawu, co sprzyja prawidłowemu dojrzewaniu
        tych struktur. W różnych wiązaniach wartości odwiedzenia i zgięcia bioder różnią się, doradca noszenia pomoże
        dobrać to właściwe.</p>
        <PostImage src="/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur.jpg" alt="Izabela Banach, autorka wpisu, doradczyni noszenia ClauWi®" width={293} height={306} align="left" full srcSet="/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur.jpg 734w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur-287x300.jpg 287w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur-300x313.jpg 300w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur-600x627.jpg 600w" sizes="(max-width: 293px) 100vw, 293px" caption={<>wiązanie
        Kangur zdj. dzięki uprzejmości www.przytobie.com</>}/>
        <p>A co z mamą? Przecież mama noworodka to kobieta w połogu, zatem jej ciało także potrzebuje uważnego
        traktowania! Przecież połóg to czas regeneracji, a nie dźwigania dziecka!</p>
        <p>Czas wiosek, w których mama otoczona była kręgiem wsparcia niestety już minął, a młoda rodzina w której
        pojawiło się dziecko często musi liczyć tylko na siebie. Ma to swoje dobre strony, bo rodzice mogą wszystko
        ułożyć w życiu dokładnie tak jak sami chcą, ale jeśli dziecko jest wrażliwe, dużo płacze i potrzebuje
        noszenia, mama także dźwiga. Zmęczone ciało obciążone niespokojnym maluszkiem będzie przyjmować postawę pełną
        kompensacji. Obiad sam się nie zrobi, starsze dziecko samo się nie przewinie…</p>
        <p>Co może mamie dać chusta? Pozwoli jej zachować symetryczną postawę rozkładając równomiernie i symetrycznie
        ciężar na jej ciele. To bardzo dużo. A jeśli mama wybierze wiązanie kangur, jej miednica pozostanie
        niewypchnięta do przodu a lordoza lędźwiowa niepogłębiona, jej brzuch pozostanie nieuciśnięty, co pozwoli
        zachować niezmienione ciśnienie śródbrzuszne, zatem korzyści dla obszaru jej miednicy i mdm będą
        zwielokrotnione. W kangurze nieuciśnięte pozostają także piersi, co może mieć kolosalne znaczenie w
        początkowej fazie laktacji.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur3-1024x720.jpg" alt="Dziecko noszone w chuście kangurowej" width={290} height={204} align="right" srcSet="/assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur3-1024x720.jpg 1024w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur3-300x211.jpg 300w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur3-768x540.jpg 768w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur3-600x422.jpg 600w, /assets/wp-content/uploads/2023/02/2023-02-13-Iza-Banach-kangur3.jpg 1227w" sizes="auto, (max-width: 290px) 100vw, 290px" caption={<>wiązanie
        Kangur, zdj. dzięki uprzejmości www.przytobie.com</>}/>
        <p>Każdej młodej mamie polecamy wizytę u fizjoterapeuty uroginekologicznego ze sobą, i u fizjoterapeuty lub
        osteopaty dziecięcego z maluszkiem. W przypadku jakichkolwiek nieprawidłowości dobrze zawiązana chusta wesprze
        terapię! A jeśli nieprawidłowości nie ma – dobrze zawiązana chusta będzie profilaktyką ich ewentualnego
        pojawienia się. Pamiętaj też, że istnieją doradcy noszenia, którzy mogą pomóc Ci prawidłowo dobrać wiązanie do
        waszych potrzeb i ograniczeń.</p>
        <p>To tyle o podstawowych sprawach związanych z somą w kontekście chusty.</p>
        <p>Chusta wspiera też poczucie kompetencji i sprawczości u mamy, obniża poziom pobudzenia u niej i u dziecka…
        pozytywnie oddziałuje na nich na wiele sposobów, ale to temat na inny, obszerny artykuł.&nbsp;</p>
        <p><em>Autorka{" "}<strong>Izabela Banach</strong>{" "}jest trenerem ClauWi, a w roli doradcy noszenia pracuje z
        młodymi rodzicami na terenie Warszawy i okolic.&nbsp;</em></p>
        <p><em>Można ją znaleźć na:&nbsp;<a href="http://mocdotyku.pl/">http://mocdotyku.pl</a></em></p>
        <p>Autor zdjęć: Grzegorz Czajka, <a href="https://www.facebook.com/GrzegorzCzajkaFotografia">https://www.facebook.com/GrzegorzCzajkaFotografia</a></p>
      </BlogPostLayout>
    </PageShell>
  );
}
