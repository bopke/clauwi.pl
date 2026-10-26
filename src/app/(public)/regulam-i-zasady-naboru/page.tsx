import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { PageHeading, Row } from "@/components/clauwi/layout";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "regulam-i-zasady-naboru";

export const metadata: Metadata = staticPageMetadata(KEY);

// Course enrolment rules — reproduced verbatim (they are terms the client
// publishes), on the original grey band.
export default function ZasadyNaboruPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <Row className="bg-[#f4f4f4]" innerClassName="flow-root pt-[25px]">
        <PageHeading>Zasady naboru na kursy</PageHeading>
        <ol className="mb-8 list-decimal pl-[34px]">
            <li>Kurs odbędzie się po potwierdzeniu uczestnictwa przez minimum 4 osoby.</li>
            <li>Potwierdzeniem uczestnictwa ze strony uczestnika jest wpłata zaliczki w wymaganym terminie do 5 dni od zgłoszenia.&nbsp;</li>
            <li>Pełna opłata za kurs powinna zostać wniesiona najpóźniej na 2 tygodnie przed kursem.</li>
            <li>Zaliczka i pełna opłata za kurs nie podlegają zwrotowi, jeśli odwołanie uczestnictwa nastąpiło na mniej
            niż 1 miesiąc przed planowaną datą kursu.<br />Zaliczka i pełna opłata za kurs podlegają zwrotowi, jeśli
            odwołanie uczestnictwa nastąpiło na mniej niż 1 miesiąc przed planowaną datą kursu, ale uczestnik znalazł na
            swoje miejsce osobę, która przejęła jego zobowiązanie.</li>
            <li>W przypadku&nbsp;<strong>Kursu zaawansowanego</strong>&nbsp;wpłacona zaliczka nie podlega zwrotowi
            na&nbsp;<strong>żadnym&nbsp;</strong>etapie odwołania uczestnictwa, chyba że uczestnik znajdzie osobę na swoje
            miejsce, która uiści opłatę za kurs.</li>
            <li>W przypadku odwołania uczestnictwa w kursie przez uczestnika w ostatniej chwili (w teminie krótszym niż
            dwa tygodnie przed kursem) z powodu zachorowania na COVID-19, lub skierowania na kwarantannę, zaliczka nie
            podlega zwrotowi, ale wpłacona pozostała kwota należności przechodzi na poczet opłaty za uczestnictwo w jednym
            w przyszłych kursów wskazanych przez uczestnika kursu w dowolnym terminie i lokalizacji.</li>
            <li>W przypadku niezebrania się minimalnej grupy zaliczka podlega niezwłocznemu zwrotowi, lub może zostać
            decyzją uczestnika przeniesiona na poczet kursu w innym terminie lub innej lokalizacji, W przypadku trudności
            z zebraniem grupy minimalnej, decyzja o uruchomieniu lub odwołaniu kursu zostanie podjęta przez organizatora
            nie później niż na dwa tygodnie przed kursem.</li>
            <li>W przypadku odwołania kursu z winy organizatora lub z powodu zaistnienia czynników zewnętrznych takich jak
            lockdown, lub tym podobne nieprzekraczalne ograniczenia, wszystkie wpłaty dokonane przez uczestnika zostaną
            zwrócone, lub, jeśli taka będzie decyzja uczestnika, przeniesione na poczet opłaty za kurs w innym terminie
            lub lokalizacji.</li>
            <li>Ostateczną decyzję o przyjęciu na kurs podejmuje przedstawiciel na Polske po zapoznaniu się z ankietą
            przesłaną przez uczestnika po zgłoszeniu.</li>
        </ol>
        <p className="mb-8 text-center text-[23px] font-bold leading-[36.8px]">
          sprawdź <Link href="/kalendarz-wydarzen">terminy kursów</Link>
        </p>
      </Row>
    </PageShell>
  );
}
