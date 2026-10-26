import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostImage } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function NoszenieWChusciePrzezMameZDyskopatiaLedzwiowaPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p><em>Autor: Karolina Faraś</em></p>
        <p>Dyskopatia jest terminem obejmującym wiele patologii związanych z krążkiem międzykręgowym. Najczęściej mamy
        do czynienia z wypukliną lub przepukliną jądra miażdżystego i te patologie omówimy.</p>
        <p>Na początku wyjaśnijmy sobie krótko czym jest krążek międzykręgowy, jak jest zbudowany i w jaki sposób się
        odżywia.&nbsp;&nbsp;Jest to tkanka łączna, dobrze uwodniona, która na zewnątrz jest zbudowana z mocnego w
        swojej budowie pierścienia włóknistego, a im bardziej do wewnątrz tym bardziej jego struktura staje się luźna.
        W centrum natomiast znajduje się galaretowata substancja nosząca nazwę jądro miażdżyste. Żeby zrozumieć jak
        nasze funkcjonowanie wpływa na krążek międzykręgowy musimy z jednej strony wyobrazić sobie gąbkę, a z drugiej
        strony mydełko. Gąbka przy nacisku traci wodę. Pobiera ją, kiedy nacisk się zwalnia. Właśnie w taki sposób
        nasze dyski się odżywiają, zjawisko to nazywa się osmozą. To właśnie dlatego rano jesteśmy troszkę wyżsi niż
        po całym dniu w pracy. Dysk możemy porównać także do mydła miedzy dłońmi. Kiedy zbliżamy do siebie opuszki
        palców, a oddalamy nasady dłoni, mydełko ucieka ku tyłowi. Kiedy zbliżamy do siebie krawędzie małych palców,
        te od strony kciuków&nbsp;&nbsp;pozwalają, żeby mydełko przesunęło się w ich stronę. To samo dzieje się z
        dyskiem. Jądro miażdżyste przez swoją galaretowata budowę ma możliwość przesuwania się. Krążek międzykręgowy
        nie jest unerwiony w środku, dlatego tych ruchów nie czujemy.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/230125KarolinaFaras1.png" alt="Rodzic z dyskopatią lędźwiową noszący dziecko w chuście" width={349} height={151} align="left" full srcSet="/assets/wp-content/uploads/2023/01/230125KarolinaFaras1.png 1023w, /assets/wp-content/uploads/2023/01/230125KarolinaFaras1-300x129.png 300w, /assets/wp-content/uploads/2023/01/230125KarolinaFaras1-768x330.png 768w, /assets/wp-content/uploads/2023/01/230125KarolinaFaras1-600x258.png 600w" sizes="(max-width: 349px) 100vw, 349px" caption={<>Ryc.
        Zgięcie i wyprost kręgosłupa lędźwiowego [3]</>}/>
        <p>Skrzywienia kręgosłupa anatomiczne bądź tylko funkcjonalne, siedzący tryb życia lub właśnie forsowne
        treningi powodują, że nasz dysk doświadcza więcej sił działających na niego kompresyjnie, do tego zazwyczaj
        asymetrycznie. Dochodzi do jego odwodnienia, co powoduje, że jest on mniej odporny na uszkodzenia. Woda z
        gąbeczki ucieka, a mydełko przesuwa w którąś ze stron, najczęściej jest to kierunek ku tyłowi i bocznie. Może
        wtedy dojść do wypukliny lub przepukliny jądra miażdżystego. Kiedy dodamy do tego mechaniczny uraz, na
        przykład podczas dźwignięcia ciężkiego przedmiotu, nasz dysk może się uszkodzić bardziej, w najgorszym
        przypadku mamy do czynienia z przepukliną wraz z oderwanym sekwestrem. Na szczęście jest to sytuacja rzadka.
        To w jakim stopniu przepuklina będzie nam dokuczała zależy od wielu czynników. Między innymi wielkości
        uszkodzenia, indywidualnej budowy naszego kręgosłupa, a przede wszystkim to czy przepuklina uciska na korzeń
        nerwowy. Uwaga! Nie każda dyskopatia będzie objawiać się bólem. Nawet ok 60% osób, które nigdy wcześniej nie
        doświadczyły bólu okolicy lędźwiowej taką przepuklinę posiada!</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/230125KarolinaFaras2-1024x475.png" alt="Karolina Faraś nosząca dziecko pomimo dyskopatii lędźwiowej" width={345} height={157} align="right" caption={<>Ryc.
        Wypukliny i przepukliny jądra miażdżystego [5]</>}/>
        <p>Ważny jest również fakt, że dyski przy odpowiednich warunkach goją się. Być może doświadczyliśmy w
        przeszłości bólu na przykład po podniesieniu cięższego przedmiotu, kilka dni bolało i samo przeszło? To co się
        rozlało niestety nie ma szansy już wrócić na swoje miejsce, ale nawet przy większych uszkodzeniach, kiedy mija
        stan ostry taka przepuklina z soczystego winogrona staje się rodzynką, a sam dysk się zabliźnia. Taki
        samonaprawiony krążek może nie będzie spełniał 100% swojego zadania, niemniej jednak dalej jest funkcjonalną
        jednostką.&nbsp;</p>
        <p>Czy chustonoszenie jest odpowiednie dla osoby mającej zdiagnozowaną dyskopatię lędźwiową? Żeby to wiedzieć
        najpierw odpowiedzmy sobie na kilka pytań:</p>
        <p>Czy aktualnie mamy dolegliwości bólowe?&nbsp;&nbsp;Sama diagnoza dyskopatii lędźwiowej w przeszłości, bez
        aktualnego bólu nie oznacza, że nie możemy nosić swoich dzieci w chuście. Tak jak wspominałam, wiele osób ma
        dyskopatię i nawet o tym nie wie, bo wcale nie musi ona dawać nam objawów. Jeśli jednak doświadczyliśmy bólu w
        przeszłości i wiemy, że taka dyskopatię posiadamy, to powinniśmy wiedzieć&nbsp;&nbsp;jak dbać o swój
        kręgosłup, żeby sytuacja się nie pogarszała. Z całą pewnością chustonoszenie przy odpowiednio dobranym i
        wykonanym wiązaniu będzie mniej obciążać kręgosłup niż noszenie na rękach.&nbsp;</p>
        <p>Jeśli jednak odczuwamy ból, to czy na pewno jest to ból spowodowany samą dyskopatią? Rozważmy pewien
        przykład, z którym często się spotykam w gabinecie. Odczuwamy ból odcinka lędźwiowego, może nawet
        promieniujący do nogi . Nie jest to stan ostry, pojawia się okresowo, w pewnych sytuacjach. Do tego mamy w
        badaniu MRI lub RTG stwierdzoną dyskopatię. Jednak bez dokładnego badania klinicznego, nie jesteśmy w stanie
        stwierdzić czy ból i parestezje są faktycznie przyczyną tej dyskopatii. Taki stan może być spowodowany na
        przykład tak popularnym mięśniem gruszkowatym, który przez swoje napięcie daje bóle pseudokorzeniowe. Co
        więcej, będzie to wpływało na ustawienie naszej miednicy, a co za tym idzie na pozycję kręgosłupa. Wiemy już,
        że skrzywienia kręgosłupa powodują, że nasze ,,mydełko” się przesuwa, więc jeśli ten stan trwa bardzo długo, a
        przy tym mamy pracę biurową, to bardzo możliwe, że badania obrazowe faktycznie pokażą nam dyskopatię.
        Oczywiście są to stany zazwyczaj bardziej złożone i wymagają dokładnego badania, ale najpewniej jest tak, że
        to nie ta dyskopatia, którą widzimy na obrazie jest przyczyną naszego bólu, lecz tkanki miękkie. To czy można
        nosić dziecko w chuście w tym wypadku uzależnione jest od stopnia nasilenia bólu i czy chusta będzie nam ten
        ból wzmagać czy nie. Ta sytuacja jest o tyle dobra, że fizjoterapeuta lub osteopata może pomóc nam z takim
        bólem się uporać i będziemy mogli nosić bez obaw.</p>
        <p>&nbsp;Jeśli jednak mamy do czynienia z ostrą lub podostrą fazą przepukliny, to z pewnością żadne noszenie
        nie będzie wskazane, a nawet możliwe przez duży ból. Często taka sytuacja sprawia, że mamy wymuszoną pozycję
        odbarczającą uciśnięty korzeń nerwowy. W tym wypadku nie będziemy nawet w stanie poprawnie wykonać wiązania.
        Taki stan powinien być pod stałą opieką fizjoterapeuty i to on da nam zielone światło do noszenia w
        odpowiednim już momencie.</p>
        <p>No dobrze, wiemy już w jakich sytuacjach chustonoszenie jest możliwe. Dostajemy pozwolenie od naszego
        fizjoterapeuty lub nie mamy dolegliwości bólowych i wiemy, jak dbać o swój kręgosłup. Co dalej? Koniecznie
        umówmy się z doradcą chustonoszenia. Rodzaj i jakość wiązania będzie miało bardzo duże znaczenie. W przypadku
        dyskopatii ważne jest, aby wiązanie nie zwiększało ciśnienia śródbrzusznego. Takie możliwości stwarza nam
        kangurek i plecak prosty. Ale pamiętajmy, że nie wszystkie bóle są dyskopatią spowodowane. Czasami przy
        zawiązaniu kieszonki poczujemy się pewniej. Dlatego należy zawsze brać pod uwagę subiektywne odczucia osoby
        noszącej.&nbsp;</p>
        <p>Podsumowując, pamiętajmy, że sam fakt posiadania dyskopatii nie oznacza, że nie możemy nosić swoich dzieci
        w chuście. Wręcz przeciwnie! Dobrze dobrane i dociągnięte wiązanie odciąży nasz kręgosłup przenosząc ciężar
        dziecka na inne partie ciała. Jeśli jednak odczuwamy ból, to udajmy się najpierw do fizjoterapeuty bądź
        osteopaty po poradę. Jeśli motanie będzie możliwe, zgłośmy się do&nbsp;&nbsp;doradcy chustonoszenia, który
        powie nam które wiązanie będzie dla nas odpowiednie. Przy takim postępowaniu uporamy się z bólem, poznamy
        swoje ciało i będziemy mogli razem ze swoim dzieckiem rozpocząć piękną przygodę jaką jest chustowanie.&nbsp;</p>
        <p>Autorka{" "}<strong>Karolina Faraś</strong>{" "}jest fizjoterapeutą i mamą dwóch córeczek, które były
        inspiracją do zostania także doradcą chustonoszenia. Działa w okolicach Legionowa, Nowego Dworu Mazowieckiego,
        Wieliszewa, Jabłonny</p>
        <p>Znajdziecie ją na:&nbsp;<a href="https://www.facebook.com/MotajZFizjo">https://www.facebook.com/MotajZFizjo</a></p>
        <p>Bibliografia:</p>
        <ol><li>Kraemer J., Choroby krążka międzykręgowego, pod red. A. Dziak, wyd. Elsevier Urban & Partner, Wrocław 2013</li>
        <li>Platzer W., Podręczny atlas anatomii człowieka. Narząd ruchu Tom I, red. Gołąb B., wyd. Medyczne Słotwiński Verlag Brema, Brema, 1997</li>
        <li>Kapandji A., The physiology of the joints- the spinal column, pelvic girdle and head, wyd.&nbsp;Elsevier
        Urban & Partner, Maloine 2006r, str. 19-25</li>
        <li>Rakowski A., Terapia manualna holistyczna, Wyd. Centrum Terapii Manualnej, Poznań 2011</li>
        <li>Kiwerski J., Kowalski M., Krasuski M., W. Szymanik, Schorzenia i urazy kręgosłupa, pod red. J, Kiwerski, wyd. PZWL, Warszawa 1997, 2001</li>
        <li>Rakowski A., Kręgosłup w stresie, Wyd. Centrum Terapii Manualnej, Poznań 2022</li></ol>
      </BlogPostLayout>
    </PageShell>
  );
}
