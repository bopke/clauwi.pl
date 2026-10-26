import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostImage } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "chustonoszenie-jako-profilaktyka-problemow-logopedycznych";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function ChustonoszenieJakoProfilaktykaProblemowLogopedycznychPage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p><em>Autorka: Karolina Faraś</em></p>
        <p className="text-left">Aby zrozumieć w jakiś sposób chustonoszenie może mieć wpływ na profilaktykę
        ewentualnych problemów logopedycznych naszych pociech, w pierwszej kolejności musimy przestać oceniać
        człowieka patrząc na jego części. Oczywiście jesteśmy zbudowani z głowy, tułowia i czterech kończyn, ale
        wszystkie te elementy są ze sobą ściśle powiązane i każde z nich ma na siebie nawzajem wpływ.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/10/231010Karolinafaras1.png" alt="Karolina Faraś podczas konsultacji z rodzicem" width={445} height={300} cssWidth={335} cssHeight={226} align="center" full srcSet="/assets/wp-content/uploads/2023/10/231010Karolinafaras1.png 445w, /assets/wp-content/uploads/2023/10/231010Karolinafaras1-300x202.png 300w" sizes="(max-width: 445px) 100vw, 445px" caption={<>Ryc.
        1 Przykładowe łańcuchy mięśniowo- powięziowe[2]</>}/>
        <p>Wiadomo już, że nasze ciało jest całym system skomplikowanych powiązań. Opracowano kilka teorii łańcuchów
        mięśniowo-powięziowych. Jedne są bardziej szczegółowe, inne mniej, natomiast każda z nich zakłada, że nie ma
        pojedynczych mięśni w ciele. Są one połączone dzięki powięzi. To właśnie ta struktura scala nasz organizm i
        powoduje, że ruch jednej jego części wyzwala całe spektrum napięć&nbsp;&nbsp;w innych miejscach. Wyobraźmy
        sobie, że mamy na sobie obcisły strój pokrywający całe nasze ciało i w nim unosimy rękę. Materiał napnie się
        nie tylko w obrębie barku, lecz w znacznie większej jego części.&nbsp;&nbsp;Tak samo ruch miednicy, wpływa na
        ustawienie naszego kręgosłupa, głowy i żuchwy. To z kolei przyczynia się do rozkładu napięć taśm mięśniowo-
        powięziowych, w tym również języka i innych struktur aparatu mowy.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/10/201010Karolonafaras2.png" alt="Karolina Faraś, doradczyni noszenia ClauWi®" width={325} height={255} cssWidth={408} cssHeight={320} align="center" full srcSet="/assets/wp-content/uploads/2023/10/201010Karolonafaras2.png 325w, /assets/wp-content/uploads/2023/10/201010Karolonafaras2-300x235.png 300w" sizes="(max-width: 325px) 100vw, 325px" caption={<>Ryc.
        2 Wpływ ustawienia miednicy na pozycję głowy</>}/>
        <p>Fizjologicznie, kręgosłup noworodka ma kształt literki C, a jego miednica ustawiona jest w tyłopochyleniu,
        potocznie mówiąc jest podwinięta. I ta właśnie pozycja przyczynia się prawidłowego ustawienia reszty jego
        ciała, w tym żuchwy, jak również optymalnego napięcia tkanek, dzięki któremu niemowle może swobodnie
        ssać.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/10/201010Karolonafaras3.png" alt="Dziecko noszone w chuście — profilaktyka logopedyczna" width={500} height={230} cssWidth={461} cssHeight={211} align="center" full srcSet="/assets/wp-content/uploads/2023/10/201010Karolonafaras3.png 500w, /assets/wp-content/uploads/2023/10/201010Karolonafaras3-300x138.png 300w" sizes="auto, (max-width: 500px) 100vw, 500px" caption={<>Ryc.
        3 Fizjologiczne ustawienie kręgosłupa noworodka [1]</>}/>
        <p className="text-left">Jeśli karmiąc nasze dziecko nie ustawimy jego nóżek w zgięciu, jego miednica znajdzie
        się w przodopochyleniu, to napięcie tkanek, które ta pozycja będzie wymuszała, będzie pociągało żuchwę do
        tyłu, co zmniejszy jej ruchomość ku przodowi, jak również nie pozwoli językowi na swobodne poruszanie się.
        Taka samą reakcje tkankową spowodujemy odchylając naszą głowe do tyłu. Żuchwa spada w kierunku szyi, powodując
        szereg napięć struktur aparatu mowy.&nbsp;</p>
        <PostImage src="/assets/wp-content/uploads/2023/10/201010Karolonafaras4.png" alt="Dziecko noszone w chuście — profilaktyka logopedyczna" width={320} height={440} cssWidth={271} cssHeight={372} align="center" full srcSet="/assets/wp-content/uploads/2023/10/201010Karolonafaras4.png 320w, /assets/wp-content/uploads/2023/10/201010Karolonafaras4-218x300.png 218w, /assets/wp-content/uploads/2023/10/201010Karolonafaras4-300x413.png 300w" sizes="auto, (max-width: 320px) 100vw, 320px" caption={<>Ryc.
        4 Wpływ ustawnienia wyprostnego na pozycję żuchwy [1]</>}/>
        <p>Kiedy zrozumiemy już te zależności, zbliżymy się bardzo do tego, w jaki sposób chustonoszenie może mieć wpływ na ciało naszego dziecka.</p>
        <p>Prawidłowe zawiązanie malucha w chustę, wymusza na miednicy jej tyłopochylenie, a więc i kręgosłup, głowa i
        żuchwa znajdują się w optymalnej dla siebie pozycji. Jest to także odpowiednia pozycja dla rozwoju aparatu
        mowy.&nbsp;Co jest na tym etapie ważne, sposób w jaki wiążemy nasze dzieci dostosowujemy do tego na jakim
        etapie rozwoju ono aktualnie jest. Inne wiązanie odpowiednie będzie dla noworodka, inne zaproponujemy dziecku,
        które już siedzi. Dzięki temu, możemy być pewni, że wspieramy jego rozwój, nic na nim nie wymuszając. Co
        więcej, dzięki chuście, łatwiej jest nam osiągnąć symetrię pozycji, w której nosimy nasze dziecko. Często jest
        tak, że trzymamy naszą pociechę głównie na jednej stronie, bo jest nam tak wygodniej lub drugą ręka, zazwyczaj
        przewodnią, musimy robić różne inne rzeczy związane z prowadzeniem domu lub opieką nad drugim dzieckiem i
        zazwyczaj ciężko jest tych sytuacji uniknąć. Niestety, takie noszenie, może powodować asymetryczne napięcia w
        ciele naszego malucha, co będzie też wpływało na ustawienie języka w jego buzi. Jeśli zbyt często będzie to
        miało miejsce, na późniejszym etapie może mieć to przełożenie na funkcje języka podczas żucia, czy mowy.</p>
        <PostImage src="/assets/wp-content/uploads/2023/10/201010Karolonafaras5.png" alt="Dziecko noszone w chuście — profilaktyka logopedyczna" width={310} height={520} align="center" full srcSet="/assets/wp-content/uploads/2023/10/201010Karolonafaras5.png 310w, /assets/wp-content/uploads/2023/10/201010Karolonafaras5-179x300.png 179w, /assets/wp-content/uploads/2023/10/201010Karolonafaras5-300x503.png 300w" sizes="auto, (max-width: 310px) 100vw, 310px" caption={<>Ryc.
        5 Zdjęcie własne</>}/>
        <p>Oczywiście nie można powiedzieć, że chustonoszenie jest cudownym środkiem na uniknięcie problemów
        logopedycznych. Mają one rożne inne przyczyny i nie na wszystkie my rodzice mamy wpływ. Nie mniej jednak, nie
        podlega wątpliwości, że wspieranie prawidłowego rozwoju narządu ruchu ma bardzo duży przekład na rozkład
        napięcia w ciele, również w obrębie aparatu mowy. Dzięki temu chustonoszenie może być bardzo dobrą
        profilaktyką w tym zakresie.&nbsp;</p>
        <p>Bibliografia:</p>
        <ol><li>M. Czajkowska, Pozycjonowanie w terapii logopedycznej, wyd. GooGoo, Zabrze 2021r.</li>
        <li>P. Richter, E. Hebgen, Punkty spustowe i łańcuchy mięśniowo- powięziowe w osteopatii i terapii manualnej,
        wyd. II, red. K. Gieremek, wyd. Galaktyka, Łódź 2010r.</li></ol>
        <p><strong>Autorka Karolina Faraś jest fizjoterapeutą i mamą dwóch córeczek, które były inspiracją do zostania
        także doradcą chustonoszenia. Działa w okolicach Legionowa, Nowego Dworu Mazowieckiego, Wieliszewa, Jabłonny
        Znajdziecie ją na</strong>:{" "}<a href="https://www.facebook.com/MotajZFizjo">https://www.facebook.com/MotajZFizjo</a></p>
      </BlogPostLayout>
    </PageShell>
  );
}
