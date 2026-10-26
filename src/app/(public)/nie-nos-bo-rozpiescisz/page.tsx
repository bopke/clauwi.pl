import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostImage } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "nie-nos-bo-rozpiescisz";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function NieNosBoRozpiesciszPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p><em>Autor: Dagmara Stolarczyk</em></p>
        <p>Nie noś, bo rozpieścisz – to zdanie słyszy wiele mam niemowląt, nie tylko noszonych w chuście. Istnieje
        mit, według którego dzieci noszone na rękach zostaną do tego przyzwyczajone, przez co rodzic będzie musiał je
        stale nosić. Niestety wiele mam nie zdaje sobie sprawy, że nie jest to prawda. Słucha rady i wbrew swojej
        intuicji odkłada płaczące dziecko do łóżeczka.&nbsp;</p>
        <p>No właśnie, kto ma racje? Czy faktycznie noszeniem możemy rozpieścić nasze dziecko? W tym artykule
        zapoznasz się z kilkoma faktami na temat rozwoju niemowląt i badaniami naukowymi właśnie w tym temacie.</p>
        <p>Jednym z pierwszych narzędzi budowania więzi z dzieckiem jest dotyk<strong>.</strong>&nbsp;Potrzeba dotyku,
        mimo że przez dłuższy czas tego nie widać jest tak samo ważna jak potrzeba zaspokojenia głodu czy snu. Kontakt
        fizyczny jest fundamentem tworzenia więzi między rodzicami i dzieckiem i podstawą poczucia
        bezpieczeństwa.&nbsp;</p>
        <p>W tym temacie jedno z przełomowych badań wykonał Harry Harlow. Wyniki tego badania były bardzo znaczące w
        temacie wiedzy o rozwoju więzi. Badania Harlowa wykonane na rezusach były dość drastyczne, a ich opisy
        znajdziesz w wielu książkach i w Internecie. Ja opiszę je tylko pokrótce.&nbsp;</p>
        <p>Harlow badał mechanizmy tworzenia więzi między matką i noworodkiem. Początkowo uważano, że podstawą
        tworzenia więzi jest zaspokajanie potrzeby pragnienia i głodu. Badania pokazały jednak, że małpki odizolowane
        od mam przywiązywały się do miękkich szmatek umieszczonych w ich klatkach. W późniejszych badaniach, kiedy
        Harlow stworzył dwie matki zastępcze: jedną z drutu, a drugą z materiału, Harlow zauważył, że niezależnie od
        tego, która z nich zaspokajała potrzebę głodu, małpki większość czasu spędzały z matką z materiału. W razie
        niebezpieczeństwa okazywała się też schronieniem (gdy małpkom pokazywano straszne zabawki uciekały do
        materiałowej małpki i się do niej przytulały). Te badania były drastyczne i według niektórych teorii
        przyczyniły się do powstania ruchu obrony zwierząt. Niemniej doprowadziły do ogromnie ważnych wniosków.&nbsp;</p>
        <p>Na podstawie swoich badań Harlow postawił hipotezę, że małpki rodzą się z biologiczną potrzebą bliskości i
        przytulania. Zaspokojenie tych potrzeb jest warunkiem komfortu emocjonalnego. Badania pokazały, że potrzeba
        więzi jest wrodzoną, podstawową potrzebą młodych naczelnych, a bezpieczna więź warunkiem optymalnego rozwoju
        emocjonalnego.&nbsp;&nbsp;Kolejni badacze potwierdzali teorię Harlowa. Jednym z nich był John Bowlby. Stworzył
        on definicję przywiązania, wg której zachowania, które mają na celu osiąganie bliskości są instynktowne i
        pełnią kluczową rolę w przetrwaniu gatunku. (2,6,7)</p>
        <p>Potrzeba kontaktu fizycznego nie jest wymysłem nowoczesnych metod wychowania, a największą, głęboko
        zakorzenioną potrzebą człowieka. Podobnie jak zapotrzebowanie na pożywienie, ciepło, tak i potrzeba bliskości
        jest podstawową potrzebą. Ludzkie dzieci są typem tzw. “noszeniaków”. Oznacza to, że jako niemowlęta okazują
        one przystosowania oraz zachowania dążące do realizowania bezpośredniej bliskości z opiekunem i ciągłego
        kontaktu fizycznego. Dużo fizycznej bliskości oraz uwagi nie rozpieszcza dziecka, a zaspokaja podstawowe
        zapotrzebowanie na bliskość i bezpieczeństwo. Zaspokojenie potrzeby bliskości jest tak samo ważna jak
        karmienie, przewinięcie czy inne konieczne czynności pielęgnacyjne. Do tego jest dla dziecka przyjemne. (5)</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-683x1024.jpg" alt="Dziecko noszone w chuście" width={346} height={520} align="left" srcSet="/assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-683x1024.jpg 683w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-200x300.jpg 200w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-768x1152.jpg 768w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-1024x1536.jpg 1024w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-300x450.jpg 300w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk1-600x900.jpg 600w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk1.jpg 1365w" sizes="(max-width: 346px) 100vw, 346px" caption={<>Autorem
        zdjęcia jest fotografka – Katarzyna Trepner – Fotografie KaTe.&nbsp;<a href="https://www.facebook.com/profile.php?id=100063451316546">https://www.facebook.com/profile.php?id=100063451316546</a></>}/>
        <p>Badania pokazują, że bliski kontakt fizyczny jest najlepszym sposobem na uspokojenie niemowlaka. Już w 1986
        roku zespół pediatrów z Montrealu zbadał 99 par – mama i niemowlę. Połowa z nich nosiła swoje dzieci 3 godziny
        dziennie (nawet jeśli nie płakały i nie marudziły)&nbsp;&nbsp;i na ten czas dostały nosidła. Druga grupa mam
        nie otrzymała zaleceń odnośnie noszenia. Po 6 tygodniach i zakończeniu badania, badacze ustalili, że
        niemowlęta z grupy mam noszących w nosidłach płakały o 43% mniej niż te z grupy kontrolnej. (8)</p>
        <p>Czasem z noszenia na rękach/w chuście może skorzystać i nieco starsze dziecko. Kiedy dziecko jest mocno
        przebodźcowane, zachowuje się w sposób trudny, nie kontroluje swoich emocji, to właśnie czas blisko mamy czy
        taty, w chuście/nosidle/na rękach pozwoli nawiązać kontakt fizyczny, rozładować stres, wzmocnić pewność
        siebie. (8)&nbsp;Badania pokazują, że bliski kontakt z dzieckiem połączony z ruchem ma wpływ na układ nerwowy
        i zmniejszenie stresu. Stymuluje wydzielanie oksytocyny – hormonu, który obniża poziom lęku, stresu i
        agresji.&nbsp;Nawet w dorosłym życiu przytulanie pomaga nam rozładować stres.</p>
        <p>Co więcej, płacz dziecka, na który się nie reaguje ma negatywny wpływ na jego mózg. A to za sprawą
        kortyzolu – hormonu stresu. Jeśli narażenie na stres związany z nieskutecznym wzywaniem opiekuna będzie
        długotrwałe, może prowadzić do zaburzeń emocjonalnych, trudności z nauką, koncentracją uwagi, samoregulacją,
        odpornością i wiele innych. Gdy nie reagujemy na płacz dziecka poziom kortyzolu wzrasta do niebezpiecznego
        poziomu. Warto pamiętać, że każde dziecko płacze i jest to zupełnie normalne – jest to sposób, w jaki dziecko
        się z nami komunikuje. Ale jako rodzice powinniśmy na ten płacz reagować i starać się zaspokoić potrzeby
        dziecka, jeśli jest taka możliwość. (2,11)&nbsp;Stres zmniejsza się, gdy niemowlęta są równocześnie głaskane i
        równolegle się do nich mówi, kołysze, utrzymuje kontakt wzrokowy. Takie możliwości oczywiście daje nie tylko
        noszenie, ale na pewno taki kontakt ułatwia.</p>
        <p>W tym temacie ważne jest też to, by pamiętać, że dla niemowląt płacz jest formą komunikacji a nie
        manipulacji. Niejednokrotnie tu nasuwa się kolejny mit na temat tego, że niemowlę coś na nas “wymusza” czy
        “manipuluje”, by coś osiągnąć. Być może sama słyszałaś również takie “dobre” rady. Płacz jest sygnałem,
        którego trzeba wysłuchać i odpowiedzieć. Płacz jest narzędziem komunikacji, a nie manipulacji – to też zmienia
        nastawienie rodzica do noszenia.&nbsp;</p>
        <p>Dzieci nie płaczą, bo są złośliwe. Płaczą, bo chcą zakomunikować swoje niespełnione potrzeby, nieprzyjemne
        odczucia. Co ciekawe badania pokazały, że najoptymalniej jest zareagować na płacz dziecka do 1,5 minuty.
        Pozostawienie płaczącego dziecka na 5 minut dwukrotnie wydłuża czas, który będzie potrzebny na uspokojenie
        dziecka. A całkowite niezwracanie uwagi na płacz, wydłuży ten czas trzykrotnie (5). Oczywiście nie mówimy tu o
        tylko o natychmiastowym noszeniu. Mowa o obecności, bliskości, spokojnym mówieniu, głaskaniu itp. – pokazaniu,
        że jesteśmy blisko. Kolejne badania pokazują, że dzieci, których płacz spotykał się w pierwszych miesiącach z
        szybką odpowiedzią, w późniejszym czasie płakały mniej. Z drugiej strony opóźnianie reakcji może prowadzić do
        większego płaczu – dziecko uczy się, że aby zyskać uwagę trzeba wybuchnąć płaczem. A to nie jest korzystne dla
        żadnej ze stron. (8)</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/DagmaraStolarczyk2-1-683x1024.jpg" alt="Dagmara Stolarczyk nosząca dziecko w chuście" width={349} height={522} align="right" srcSet="/assets/wp-content/uploads/2023/01/DagmaraStolarczyk2-1-683x1024.jpg 683w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk2-1-200x300.jpg 200w, /assets/wp-content/uploads/2023/01/DagmaraStolarczyk2-1-300x450.jpg 300w" sizes="(max-width: 349px) 100vw, 349px" caption={<>Autorem
        zdjęcia jest fotografka – Katarzyna Trepner – Fotografie KaTe.&nbsp;<a href="https://www.facebook.com/profile.php?id=100063451316546">https://www.facebook.com/profile.php?id=100063451316546</a></>}/>
        <p>Dodatkowym atutem bycia noszonym jest otwarcie dzieci na świat zewnętrzny – na stymulację dźwiękową,
        wizualną. Ciekawe doświadczenia zdobywane razem z rodzicem sprawiają, że w rozwijającym się mózgu dziecka
        tworzą się kolejne połączenia. A podczas noszenia w chuście można zrobić naprawdę dużo. Dziecko widzi, słyszy,
        dzieli emocje razem z rodzicem. Uczy się języka ciała, wyrazu ludzkiej twarzy, tworzą się rytuały. Dzięki
        temu, że dziecko jest wyżej, częściej nawiązuje kontakt wzrokowy, co wpływa na zdolności słuchania i rozwój
        mowy (8). Plus noszenia jest również taki, że dzieci które stymulowane są w zakresie układu przedsionkowego
        (kołysane bujane, noszone na rękach) mają lepiej rozwinięte zdolności ruchowe i skutecznie integrują odruchy
        bezwarunkowe. Tu jednak warto zachować umiar i zadbać o różnorodność doświadczeń dziecka na wielu
        płaszczyznach. (2)</p>
        <p>Przytulanie pozytywnie wpływa nie tylko na dziecko, ale i na mamę – przyspieszając powrót do dobrej formy i
        wsparcie laktacji. Przytulanie powoduje, że wydzielają się neurotransmitery, które są odpowiedzialne za dobre
        samopoczucie, równowagę emocjonalną i poczucie bezpieczeństwa. Przytulanie i kołysanie nie tylko działa
        uspokajająco, ale też pozytywnie wpływa na rozwój dziecka i wzmacnia więź oraz zaufanie do rodzica. Pomaga
        nawiązać bliską relację, rodzic może łatwo podążać za reakcjami dziecka. (1)</p>
        <p>W temacie więzi jest także ciekawe badanie Anisfeld i jego współpracowników. Do badania zaproszono w
        szpitalu, po porodzie matki żyjące w wyjątkowo trudnych warunkach społecznych. Jedna grupa dostała leżaczki
        dla niemowląt, a druga chusty do noszenia. Mamy z chustami miały codziennie używać chust. Przez pierwszy rok
        życia regularnie prowadzono wywiady z obiema grupami mam. Tylko połowa mam używała chusty średnio przez 8
        miesięcy każdego dnia. Inne robiły to 2-3 razy w tygodniu, a niektóre rzadziej. Ale mimo to chustomamy po
        kilku miesiącach obchodziły się z dziećmi w bardziej wrażliwy sposób i szybciej reagowały na potrzeby dzieci
        niż mamy z leżaczkami. Po roku badań dzieci chustomam reprezentowały raczej bezpieczną, ufną więź z matką
        (83%), w przypadku dzieci nienoszonych było to 38%. U prawie wszystkich dzieci, które były noszone w chustach
        prawie codziennie wykształciła się bezpieczna więź z matką. Dodatkowo jasność wyników badania zaburzyło to, że
        po ok. 2 miesiącach 4 mamy, które otrzymały leżaczki same zdecydowały się też używać chusty. Mimo to nadal
        należały do grupy kontrolnej ze względów naukowo-statystycznych. Jak widzisz ta różnica procentowa mogła
        okazać się jeszcze większa. (5)</p>
        <p>Ponadto badania pokazują, że dzieci noszone i przytulane są później bardziej samodzielne. Dzięki wsparciu,
        jakie dajemy dzieciom, tworzymy podstawę radzenia sobie z negatywnymi doświadczeniami. Okazuje się, że zbyt
        wczesna “nauka” niezależności, tak naprawdę może sprawić, że doprowadzi do większej zależności. Reagowanie na
        potrzeby dziecka sprawia, że tworzy się więź, rośnie zaufanie, co sprawia, że w późniejszym wieku dzieci są
        bardziej niezależne i gotowe do podejmowania nowych wyzwań.&nbsp;(4,8)</p>
        <p>Jak widzisz badania jasno pokazują, że nie można rozpieścić niemowlęcia przytulaniem i reagowaniem na jego
        potrzeby. Wręcz przeciwnie, dotyk i kontakt fizyczny z dorosłymi pozwala im rozkwitać.&nbsp;</p>
        <p>Nadmierna pobłażliwość, ilość pochwał, kupowanie zbyt dużej ilości dóbr materialnych – to elementy mogące
        rozpieścić nasze dziecko. Ale to byłby już temat na całkiem inny, obszerny artykuł. Miłość, bliskość,
        obecność, gdy dziecko potrzebuje są mu niezbędne i nie warto tego odmawiać.&nbsp;</p>
        <p>Bibliografia:</p>
        <p>1.Charęzińska A., Szulc J. Sensoryczne niemowlę, Mamania.&nbsp;</p>
        <p>2.Eliot L. Co tam się dzieje, Media Rodzina.</p>
        <p>3.Esposito G., Yoshida S., Ohnishi R i in.. Infant calming responses during maternal carrying in humans and mice. Curr Biol. 2013 6;23(9):739-45.</p>
        <p>4.Hewlett B., Lamb M. Hunter-Gatherer childhoods.,New York, 2005.</p>
        <p>5.Kirkilionis E. Więź daje siłę, Mamania.</p>
        <p>6.Medina J. Jak wychować szczęśliwe dziecko, Wydawnictwo Literackie, 2012.</p>
        <p>7.Minge N. Minge K. Jak kreatywnie wspierać rozwój dziecka, Samo Sedno.</p>
        <p>8.Sears W., Sears M. Księga Rodzicielstwa Bliskości, Mamania, 2022.</p>
        <p>9.Sears W.M. Księga wymagającego dziecka, Mamania, Warszawa, 2015.</p>
        <p>10.Siegiel D., Bryson T. Grzeczne dziecko, poradnik dla mądrych rodziców, MUZA SA.Warszawa, 2015.</p>
        <p>11.Sunderland M.&nbsp;&nbsp;Mądrzy rodzice, Warszawa, Świat Książki 2008.</p>
        <p></p>
        <p><em>Autorka artykułu</em>{" "}<em><strong>Dagmara Stolarczyk{" "}</strong>jest doradcą noszenia z 6-letnim
        stażem. Prowadzi też bloga dla rodziców – Dziubdziak.pl –{" "}<a href="http://www.dziubdziak.pl">www.dziubdziak.pl</a></em></p>
        <p>fb:&nbsp;<a href="https://www.facebook.com/dziubdziak">https://www.facebook.com/dziubdziak</a></p>
      </BlogPostLayout>
    </PageShell>
  );
}
