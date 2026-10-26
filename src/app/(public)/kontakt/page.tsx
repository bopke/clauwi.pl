import type { Metadata } from "next";
import { PageShell } from "@/components/clauwi/page-shell";
import { PageJsonLd } from "@/components/clauwi/page-json-ld";
import { Row } from "@/components/clauwi/layout";
import { ContactForm } from "@/components/clauwi/contact-form";
import { staticPageMetadata } from "@/lib/clauwi/pages";

const KEY = "kontakt";

export const metadata: Metadata = staticPageMetadata(KEY);

// Two columns from 1025px. The left one is empty: in WordPress it showed the
// row's background photo, which the mirror never carried over — kept as it
// looks today rather than redesigned.
export default function KontaktPage() {
  return (
    <PageShell>
      <PageJsonLd pageKey={KEY} />
      <Row innerClassName="grid grid-cols-1 gap-8 pt-[68px] min-[1025px]:grid-cols-2">
        <div />
        <div>
          <div className="mt-[35px] mb-[35px] min-[768px]:-mt-[52px]">
            <h2 className="mb-[-24px] text-center font-heading text-[50px] font-light uppercase leading-[75px] text-[#692d2c] min-[1026px]:text-[80px] min-[1026px]:leading-[120px]">
              Kontakt
            </h2>
          </div>
          <div className="mb-8">
            <ContactForm />
          </div>
          <div className="flow text-center">
            <p><strong>Naturalnie Izabela Banach</strong></p>
            <p>ul. Obozowa 56<br />01-423 Warszawa</p>
            <p><strong>Numer konta bankowego:<br />mBank<br />03 1140 2004 0000 3502 7462 4427</strong></p>
            <p>Telefon:&nbsp;<strong>+48 666 538 731</strong><br />Email:&nbsp;<a href="mailto:kontakt@clauwi.pl">kontakt@clauwi.pl</a></p>
          </div>
        </div>
      </Row>
    </PageShell>
  );
}
