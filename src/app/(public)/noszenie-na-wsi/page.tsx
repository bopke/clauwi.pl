import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostImage } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "noszenie-na-wsi";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function NoszenieNaWsiPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p><em>&nbsp;Autor: Aleksandra Młodkowska</em></p>
        <p>Noszenie w chuście. Wciąż wzbudzające wiele kontrowersji wśród mieszkańców większych i mniejszych wsi,
        wciąż mało znane w wiejskim środowisku choć swoimi korzeniami sięga bardzo daleko. Wciąż mało praktykowane.
        Często demonizowane hasłami „nie noś bo przyzwyczaisz”, „dziecku w tej chuście jest przecież za ciasno” lub
        traktowane jako wymysł i trend dzisiejszych czasów, a przecież potrafi tak bardzo ułatwić obowiązki związane z
        gospodarstwem, domem czy pracami podwórkowymi i znane było naszym przodkom wiele lat temu.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/230118OlaMlodkowska2.jpg" alt="Aleksandra Młodkowska nosząca dziecko na wsi" width={451} height={376} align="right" full />
        <p>&nbsp;Chustonoszenie praktykowane było już bardzo dawno temu, przede wszystkim przez kobiety na wsi, które
        w chuście lub drewnianej opasce niosły swoje dzieci idąc do pracy w polu czy obejściu. Mając niemowlęta
        przywiązane do siebie mogły sprawować opiekę nad dzieckiem reagując na jego potrzeby i jednocześnie pełnić
        obowiązki gospodyni. (1)</p>
        <p><strong>Chusty, szmaty, zapaski, hacki, odziewacki</strong>. Tak, w zależności od regionu Polski, nazywano
        materiał, który służył kobietom do noszenia i ułatwiał opiekę nad niemowlęciem. Wiejskie kobiety nosiły w
        trójkątnych lub prostokątnych chustach, równie często w haftowanych fartuchach, które wykonane były z różnych
        tkanin, w zależności od pory roku i regionu Polski. Nosiło również starsze rodzeństwo, które często opiekowało
        się niemowlętami gdy matki szły do pracy w polu. Chusty przeznaczone do noszenia były najczęściej kolorowe, z
        frędzlami, choć używano również kocy czy pledów, którymi przywiązywano do siebie niemowlęta. Podczas II Wojny
        Światowej, w sytuacji zagrożenia, gdy trzeba było szybko uciekać i ewakuować się z domu wiązano dzieci w to,
        co akurat było pod ręką, byle sprawnie i szybko móc się przemieścić, uciec i skryć w bezpiecznym
        miejscu.&nbsp;</p>
        <p>Dzieci noszono zarówno przywiązane materiałem z przodu jak i na plecach, technika wiązania przekazywana była z pokolenia na pokolenie. (2)</p>
        <p>Matki i babki uczyły wiązać swoje córki gdy te zostawały matkami, aż do momentu, kiedy chusty i różnego
        rodzaju nosidła do noszenia dzieci zostały wyparte przez wózki. A te do powszechnego użytku trafiły dopiero w
        pierwszej połowie XX wieku, najpierw w mieście, wśród bogatszych warstw społecznych, później również na
        wsiach. Wiedza o noszeniu i sposoby motania dzieci przestały być potrzebne, zapomniano na chwilę o
        możliwościach, jakie daje chustonoszenie, społeczeństwo zachłysnęło się wygodą wożenia dzieci w wózkach, by
        pod koniec XX wieku ze zdwojoną siłą temat noszenia w chustach i nosidłach powrócił, pociągając za sobą morze
        wiedzy na temat dobrodziejstwa i potrzeby bliskości, a także prawidłowej pozycji dziecka, która jest ważna dla
        jego prawidłowego rozwoju. Potrzeba noszenia i ułatwienia sobie codzienności z noszeniakiem, jakim jest
        niemowlę zrodziła również potrzebę zawodu doradcy noszenia, który jest w stanie przekazać wiedzę i techniki
        wiązania współczesnym rodzicom.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/230118OlaMlodkowska1-1-603x1024.jpg" alt="Dziecko noszone w chuście na wsi" width={334} height={567} align="right" srcSet="/assets/wp-content/uploads/2023/01/230118OlaMlodkowska1-1-603x1024.jpg 603w, /assets/wp-content/uploads/2023/01/230118OlaMlodkowska1-1-177x300.jpg 177w, /assets/wp-content/uploads/2023/01/230118OlaMlodkowska1-1-300x509.jpg 300w, /assets/wp-content/uploads/2023/01/230118OlaMlodkowska1-1-600x1018.jpg 600w, /assets/wp-content/uploads/2023/01/230118OlaMlodkowska1-1.jpg 750w" sizes="(max-width: 334px) 100vw, 334px" />
        <p>Znów, w pierwszej kolejności, jak w przypadku wózków, wiązanie chusty zaczęły praktykować głównie kobiety z
        miasta, świadome potrzeb swoich dzieci i chcące spróbować ułatwienia choćby w spacerach bez konieczności
        wnoszenia wózka, jednak jako doradca chustonoszenia mieszkający na wsi coraz częściej widzę potrzebę noszenia
        również wśród rodziców zamieszkujących małe miejscowości i coraz więcej rodziców decyduje się na naukę. Ten
        trend napawa mocno optymizmem, że zdanie mieszkańców wsi o chustowaniu w niedługim czasie się zmieni na
        lepsze.</p>
        <p>Warto mieć pogląd na to, jak sprawnie dzięki chustonoszeniu może pójść praca, którą do wykonania ma
        niemalże każdy mieszkaniec wsi. Nosząc dziecko w chuście można bez problemu zebrać owoce wchodząc w dość
        grząski sad, w który nie wjedzie żaden wózek. Można skosić trawę, zagrabić ją i wywieźć do kompostownika.
        Rodzice mają możliwość ze śpiącym spokojnie na plecach dzieckiem, zająć się ogródkiem warzywnym, podlać
        kwiaty, przyciąć winorośl, zrobić przetwory na zimę z zebranych plonów.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/01/230118OlaMlodkowska3.jpg" alt="Aleksandra Młodkowska z dzieckiem w chuście" width={356} height={266} align="left" full srcSet="/assets/wp-content/uploads/2023/01/230118OlaMlodkowska3.jpg 750w, /assets/wp-content/uploads/2023/01/230118OlaMlodkowska3-300x224.jpg 300w, /assets/wp-content/uploads/2023/01/230118OlaMlodkowska3-600x448.jpg 600w" sizes="auto, (max-width: 356px) 100vw, 356px" />
        <p>Mieszkanie na wsi to też dla większości mieszkańców częste spacery do lasu, po którym bez problemu
        spaceruje się z dzieckiem w chuście, zbierając jesienią grzyby i borówki, obserwując przyrodę, słuchając
        ptaków. Las zimą jest nieprzejezdny dla wózka natomiast bez problemu można go przejść mając dziecko na swojej
        piersi. Zakupy na targowisku i bazarze to brak koszyka czy wózka sklepowego na kółkach, potrzebne są wolne
        ręce więc tu również chustonoszenie sprawdza się idealnie. &nbsp;</p>
        <p>Noszenie w chuście może być bardzo pomocne również wśród rodziców posiadających gospodarstwo rolne i
        zwierzęta, które każdego dnia trzeba nakarmić, wydoić, sprzątnąć ich miejsce przebywania.&nbsp;</p>
        <p className="text-left">Z moich obserwacji wynika, że coraz szersze grono rodziców mieszkających na wsiach
        chce nosić dzieci w chustach i nosidłach, nawet jeśli nie są w tym wspierani przez swoich najbliższych. Często
        negatywnie nastawieni dziadkowie i pradziadkowie, którzy nie mieli styczności z chustonoszeniem przekonują się
        o słuszności wiązania dzieci gdy te podczas nauki zasypiają spokojnie wtulone w rodzica. Noszenie w chuście
        staje się coraz częstszym wyborem rodziców z małych miejscowości i ma szansę stać się popularne nawet na
        najmniejszych wioskach Polski, ułatwiając rodzicielstwo i obowiązki, z którymi mierzą się osoby zamieszkujące
        domy jednorodzinne, posiadające podwórka i gospodarstwa rolne.</p>
        <p>Bibliografia:</p>
        <p>1) „Noszenie Dzieci” Marta Szperlich- Kosmala, Wydawnictwo Natuli, 2020</p>
        <p>2) „Dziecko w dawnej Polsce” Dorota Żołądź-Strzelczyk, Wydawnictwo Poznańskie, 2002</p>
        <p>—</p>
        <p><em>Autorką artykułu oraz właścicielką zdjęć jest <strong>Aleksandra Młodkowska</strong>, doradczyni noszenia z okolic Tłuszcza</em></p>
        <p><a href="https://www.facebook.com/ola.jaknajblizej">https://www.facebook.com/ola.jaknajblizej</a></p>
      </BlogPostLayout>
    </PageShell>
  );
}
