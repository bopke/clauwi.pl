import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { BlogPostLayout, PostImage } from "@/components/clauwi/blog-post";
import { staticPageMetadata } from "@/lib/clauwi/pages";
import { adjacentPosts, getBlogPost } from "@/lib/clauwi/blog-meta";

const KEY = "jak-dlugo-mozna-nosic-dziecko-w-chuscie";

export const metadata: Metadata = staticPageMetadata(KEY);

// Post text exactly as published.
export default function JakDlugoMoznaNosicDzieckoWChusciePage() {
  const post = getBlogPost(KEY);
  const { previous, next } = adjacentPosts(KEY);
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <BlogPostLayout post={post} previous={previous} next={next}>
        <p><em>Autorka: Joanna Tworzydło</em></p>
        <p><strong>Nosisz swoje dziecko w chuście, ale zastanawiasz się jak długo możesz to robić? Czy chustonoszenie
        jest zdrowe tylko dla noworodków, czy można bezpiecznie nosić i starsze niemowlęta? Ile godzin w ciągu dnia
        maluch może przebywać w chuście? To jedne z najczęstszych pytań, które słyszą doradcy noszenia podczas
        konsultacji chustowych.</strong></p>
        <p>W chustę tkaną zawiązany może być nawet noworodek. W trakcie 9 miesięcy ciąży nasze maluszki przyzwyczaiły
        się do noszenia i bujania, nie powinno więc dziwić, że tego samego oczekują i po porodzie. Szczególnie w
        przypadku wymagających maluszków, chusta często wręcz ratuje życie (a dokładniej kręgosłupy) rodziców.</p>
        <p>Im szybciej uczymy się chustonoszenia, tym powinno być to też łatwiejsze. Kilkutygodniowy noworodek bardzo
        potrzebuje bliskości rodzica. Chusta nie tylko zapewnia mu ukojenie i poczucie bezpieczeństwa, ale również dba
        o noszącego rodzica. To cudowne, że myśląc o swoim niemowlaku dbamy i o swój dobrostan.</p>
        <p>Wielu rodziców po kilku tygodniach, często intensywnego noszenia dziecka w chuście, zaczyna mieć pytania i
        wątpliwości dotyczące chustonoszenia. Do kiedy mogę nosić w chuście? Czy mój niemowlak nie przebywa w chuście
        zbyt długo? Ile godzin dziennie mogę nosić? W końcu – czy chustonoszenie nie przeszkadza niemowlętom w
        rozwoju?</p>
        <p>Jak długo można nosić niemowlaka w chuście – wytyczne</p>
        <p>Rodzice, z którymi na konsultacjach chustowych spotykają się doradcy noszenia, często poszukują konkretnych
        wytycznych, dotyczących tego jak długo mogą nosić w chuście noworodka. Niestety, nie możemy podać im
        jednoznacznej odpowiedzi. Zawsze jednak staramy się holistycznie pokazać o co chodzi z noszeniem. Zrozumienie
        tego, do czego służy chusta sprawia, że noszenie jest bardziej świadome.</p>
        <p>Ile godzin w ciągu dnia można nosić w chuście</p>
        <PostImage src="/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-1024x684.jpg" alt="Joanna Tworzydło nosząca dziecko w chuście" width={229} height={152} align="left" srcSet="/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-1024x684.jpg 1024w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-300x200.jpg 300w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-768x513.jpg 768w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-1536x1025.jpg 1536w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-2048x1367.jpg 2048w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo1-600x401.jpg 600w" sizes="(max-width: 229px) 100vw, 229px" />
        <p>To ile czasu w ciągu dnia dziecko spędza w chuście zależy od wielu czynników. Są dni, gdy noworodek ma się
        bardzo dobrze – spokojnie je, bez problemu można go odłożyć na matę czy do łóżeczka, a wózkowy spacer kończy
        się długą drzemką. Wtedy nawet nie myślimy o chustonoszeniu. Są jednak i takie dni, w trakcie których chusta
        jest w użyciu non stop. Dziecko może mieć gorączkę czy skok rozwojowy, ząbkuje albo od rana do wieczora
        jesteście poza domem, załatwiając sprawy w urzędach. Sytuacje oczywiście są przerysowane, ale dobrze oddają
        to, że chusta ma ułatwiać rodzicom życie. Jeśli jest taka konieczność, każdy rodzic będzie dziecko nosił, jak
        nie w chuście to na rękach. Jako doradcy noszenia zawsze w takich sytuacjach polecamy jednak chustę. Dlaczego?
        W trakcie długotrwałego noszenia zarówno pozycja niemowlęcia, jak i noszącego go rodzica jest zdecydowanie
        korzystniejsza i zdrowsza w dobrze zawiązanej chuście niż na rękach.</p>
        <p>I tu znowu dochodzimy do pytania o to jak długo można w chuście nosić. Nigdy nie podamy wam prostego
        wskaźnika – czy dziecko może w chuście przebywać godzinę, dwie, trzy godziny, a może tylko 30 minut? Nie ma
        jednej dobrej odpowiedzi, bo… to zależy. Zawsze jednak staramy się rodzicom uzmysłowić jak ważna w życiu
        niemowlęcia jest różnorodność.</p>
        <p>Różnorodność – słowo klucz</p>
        <p>Do prawidłowego rozwoju niemowlę potrzebuje bliskości i poczucia bezpieczeństwa. Można mu to zapewnić po
        prostu będąc tuż obok – kangurując, współśpiąć, masując czy właśnie nosząc w chuście. Jednak równie ważny jest
        rozwój fizyczny maluszka, a do niego z kolei niezbędne jest swobodne przebywanie na, najlepiej twardym,
        podłożu.</p>
        <p>Tak, nosić trzeba, ale koniecznie należy zapewnić dziecku również swobodę i autonomiczność. I tu znów jak
        bumerang wraca pytanie – ile czasu maluszek ma spędzać na rękach, w chuście, a ile swobodnie. Nasza odpowiedź?
        Nie wiemy jak będzie w przypadku Twojego Dziecka! To Ty znasz je najlepiej. Ważne więc, by podążać za
        dzieckiem. Nosić, gdy jest taka potrzeba, przytulać, gdy maluszek tego potrzebuje i dać przestrzeń do rozwoju
        zawsze, gdy to tylko możliwe.</p>
        <p>Chusta służy dziecku, ale też rodzicowi</p>
        <PostImage src="/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-684x1024.jpg" alt="Dziecko noszone w chuście wiązanej" width={145} height={217} align="right" srcSet="/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-684x1024.jpg 684w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-200x300.jpg 200w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-768x1150.jpg 768w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-1026x1536.jpg 1026w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-1367x2048.jpg 1367w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-300x449.jpg 300w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-600x899.jpg 600w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo2-scaled.jpg 1709w" sizes="(max-width: 145px) 100vw, 145px" />
        <p>Jako doradcy noszenia zawsze podkreślamy, że chusta pozwala maluszkowi zaadaptować się w nowej
        rzeczywistości. Zapewnia mu bliskość rodzica, spokojny sen, ukojenie podczas miłego i znanego mu bujania.<br />Chustonoszenie
        ułatwia też życie rodzicowi. Uwalnia ręce, umożliwia opiekę nad starszym rodzeństwem, przygotowanie posiłku
        czy spokojny spacer bez płaczu. Dzięki chuście opiekunowie nie tylko są z maluszkami, ale też mogą zrobić
        sprawunki, załatwić sprawę w urzędzie czy… zorganizować górską wycieczkę. I znowu – czas, który niemowlak
        spędza w chuście zależy od planu zajęć rodzica. Czasem cały dzień jesteście w domu i chusta leży w kącie, bo
        maluszek pozwala się odłożyć i spokojnie czuwa/bawi się/śpi w łóżeczku czy na macie. Zdarzają się też całe
        dnie poza domem, w trakcie których niemowlę jest noszone prawie non stop.</p>
        <p>Ważne, by chusta była narzędziem ułatwiającym wszystkim życie. Raz jest w ciągłym użytku, innym razem nie
        sięgacie po nią w ogóle. Ważne, by racjonalnie z niej korzystać i nosić wtedy kiedy jest potrzeba. W takim
        modelu dobrze zawiązana chusta jest nie tylko jednym z rodzicielskich ułatwiających życie gadżetów, ale też
        elementem prawidłowej pielęgnacji niemowlęcia.</p>
        <p>Do kiedy można nosić dziecko w chuście?</p>
        <p>Nawet rodzice noworodków podczas konsultacji chustowych pytają do kiedy mogą nosić w chuście. Czy
        chustonoszenie jest przydatne tylko w pierwszych miesiącach życia dziecka, czy może nosić można dłużej? Kiedy
        dziecko jest już za duże czy za ciężkie na chustę? Czy jest jakieś wiązanie chusty, w które można włożyć nawet
        2- 3-latka? Nasza odpowiedź? W chuście możesz nosić tak długo… jak masz ochotę i jak długo dziecko na to ci
        pozwoli. Jak jest w praktyce?</p>
        <p>Najczęściej rodzice zaczynają nosić kilku- czy kilkunasto tygodniowe niemowlaki. To czas, w którym dzieci
        potrzebują ogromnej dawki bliskości i w przeważającej większości uwielbiają przebywać w chuście. Później jest
        różnie – część starszych dzieci nadal chustę akceptuje, szczególnie jeśli rodzice z czasem zmieniają sposób
        wiązania chusty (np. kangurka czy kieszonkę) na inne (np. plecak prosty lub chustę kółkową). Zdarza się też,
        że część kilkumiesięczniaków niekoniecznie chce być nadal mocno dociągnięta materiałem chustowym do rodzica.
        Faktem jest, że i kilkulatka można nosić w chuście. W praktyce większość rodziców prędzej czy później wymienia
        chustę na nosidełko ergonomiczne. Jednak ci którzy chcą być chuście wierni spokojnie mogą nosić naprawdę
        długo, nawet kilka lat (najlepiej oczywiście w pozycji na plecach, tak jest zdecydowanie wygodniej).</p>
        <p>Jak nosić niemowlaka w chuście?</p>
        <p>Skoro wiemy już jak długo można nosić dziecko w chustach, warto pochylić się i nad kwestią tego w jaki
        sposób dzieci powinny być noszone. Ważne, by chustę wiązać prawidłowo. Tego jak powinno się to robić można
        nauczyć się z koleżanką, z internetowego filmiku czy podczas spotkania z profesjonalnym doradcą noszenia. My
        oczywiście polecamy konsultacje chustowe. Podczas takiego spotkania nie tylko pokazujemy rodzicom jak
        prawidłowo zamotać maluszka, ale też odpowiadamy na wszystkie ich pytania i rozwiewamy wątpliwości dotyczące
        noszenia. To coś, czego nie uzyska się na You Tube.</p>
        <p>Jak nosić w chuście starsze dziecko?</p>
        <PostImage src="/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-682x1024.jpg" alt="Dziecko noszone w chuście wiązanej" align="left" srcSet="/assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-682x1024.jpg 682w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-200x300.jpg 200w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-768x1153.jpg 768w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-1023x1536.jpg 1023w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-1364x2048.jpg 1364w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-300x450.jpg 300w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-600x901.jpg 600w, /assets/wp-content/uploads/2023/03/20230308JoannaTworzydlo3-scaled.jpg 1705w" sizes="(max-width: 682px) 100vw, 682px" />
        <p>Starsze i cięższe dzieci również można nosić w chuście. Ważne, by wraz z rozwojem dziecka (i zmianą jego
        wagi!) modyfikować sposób noszenia. Wiązania chusty dostosowujemy do wieku i potrzeb dziecka podobnie jak
        sposób noszenia niemowlęcia na rękach. Starsze dzieci świetnie się czują na plecach rodzica, w wiązaniach
        plecak prosty czy plecak z koszulką. Dla już chodzących dzieci świetnym rozwiązaniem jest chusta kółkowa,
        która nie tylko szybko się wiąże, ale jeszcze zajmuje relatywnie mało miejsca.</p>
        <p>Gdy dziecko jest już cięższe i bardziej ruchliwe warto pochylić się też nad samą chustą do noszenia.
        Grubsza chusta o zwartym splocie lub z jakimiś domieszkami (np. len czy wełna) “nosi” kilkulatka zdecydowanie
        lepiej niż cienkie chusty, które są świetne na początku chustowej drogi. W trakcie konsultacji doradcy
        noszenia zazwyczaj pomagają również dobrać chustę najlepszą na danym etapie noszenia.</p>
        <p><em>Autorką artykułu i właścicielką zdjęć jest{" "}<strong>Joanna Tworzydło</strong>, doświadczona
        doradczyni noszenia, założycielka{" "}<a href="http://carrylove.pl">CarryLove.pl</a>, babywearingowego sklepu w
        Warszawie oraz on line, w którym można kupić chusty, nosidełka ergonomiczne i akcesoria dla noszących rodziców
        oraz nauczyć się nosić. Prywatnie mama 2 dzieci, wynoszonych w chustach i nosidełkach.</em></p>
      </BlogPostLayout>
    </PageShell>
  );
}
