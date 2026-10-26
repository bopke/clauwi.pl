import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "polityka-prywatnosci";

export const metadata: Metadata = staticPageMetadata(KEY);

// The legal text is reproduced verbatim, typos and &nbsp; indents included —
// it is the client's published privacy notice. Like the original page it
// runs edge to edge, with no content container.
export default function PolitykaPrywatnosciPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <div className="flow">
        <p><strong>POLITYKA PRYWATNOŚCI</strong></p>
        <p>1.Administratorem danych osobowych przetwarzanych przez serwis&nbsp;<Link href="/">https://clauwi.pl</Link>jest
        firma Naturalnie Izabela Banach z siedzibą w Warszawie, ul. Obozowa 56/10, 01-423 Warszawa, zarejestrowana w
        Centralnej Ewidencji i Informacji o Działalności Gospodarczej (CEIDG), NIP 7121761523, REGON 141687128,</p>
        <p>2. Dane osobowe są przewtarzane przez administratowa w celu świadczenia usług zamówionych przez
        Klienta.&nbsp;Dane osobowe są przetwarzane przez administratora przez okres niezbędny do realizacji usługi, a
        także rozliczenie płatności i dochodzenie roszczeń.</p>
        <p>3. Klientowi przysługują następujące prawa w związku z przetwarzaniem danych osobowych:&nbsp;</p>
        <p>a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prawo dostępu do danych, w tym uzyskania kopii danych,&nbsp;</p>
        <p>b)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prawo żądania sprostowania, zmiany lub uzupełnienia&nbsp;&nbsp;danych&nbsp;</p>
        <p>c)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prawo do usunięcia danych (w określonych sytuacjach),&nbsp;</p>
        <p>d)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prawo wniesienia skargi do organu nadzorczego
        zajmującego się ochroną danych osobowych,&nbsp;</p>
        <p>e)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prawo do ograniczenia przetwarzania danych.&nbsp;</p>
        <p>f)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prawo do wycofania zgody na przetwarzanie danych</p>
        <p>W celu skorzystania z tych praw należy skontaktować się z administratorem danych pod adres email:&nbsp;<a href="mailto:kontakt@clauwi.pl">kontakt@clauwi.pl</a></p>
        <p>4. Dane osobowe sa przetwarzane w następujący sposób:</p>
        <p>a)&nbsp;Dane takie jak Imię i nzazwisko, telefon, adres email przetwarzane są w związku z zapytaniem
        Klienta wysłanym przez formularz na stronie https://clauwi.pl lub wysłanym na adres email&nbsp;<a href="mailto:kontakt@clauwi.pl">kontakt@clauwi.pl</a>&nbsp;Są
        wykorzystywane w celu udzielenia odpowiedzi na zapytanie.</p>
        <p>b) W przypadku wysłania zgłoszenia na kurs przez klienta zbierane sa dodatkowe dane takie jak zawód,
        miejscowość zamieszkania, wiek dziecka jeśli będzie ono obecne z uczestnikiem podczas kursu. Dane te
        wykorzystywane sa wyłącznie w celu swiadczenia zamówionej usługi</p>
        <p>c) Dane&nbsp;takie jak Imię i nazwisko, adres e-mail, miejscowość, nr telefonu, strona www, podane przez
        Doradcę Noszenia ClauWi na formularzu „Zgoda na przetwarzanie danych osobowych” są umieszczone zgodnie
        wyrażoną zgodą i wolą Doradcy&nbsp;podane przez Doradcę Noszenia ClauWi na formularzu „Zgoda na przetwarzanie
        danych osobowych” są umieszczone na podstronie serwisu&nbsp;<Link href="/o-nas/lista-doradcow">https://clauwi.pl/doradcy</Link></p>
        <p>d) Dane zbierane automatycznie mogą być użyte do analizy zachowań użytkowników na naszej stronie
        internetowej&nbsp;oraz do personalizacji zawartości naszych stron internetowych. Dane te są zbierane
        automatycznie o każdym użytkowniku..</p>
        <p>e) W przypadku kontroli Generalnego Inspektoratu Ochrony Danych Osobowych, dane osobowe Klienta mogą zostać
        udostępnione pracownikom Inspektoratu zgodnie z ustawą o ochronie danych osobowych.</p>
        <p>f) W przypadku naruszenia niniejszego regulaminu, naruszenia prawa&nbsp;lub gdy będą wymagały tego
        nadrzędne przepisy, administrator może udostępnić dane organom wymiaru sprawiedliwości.</p>
      </div>
    </PageShell>
  );
}
