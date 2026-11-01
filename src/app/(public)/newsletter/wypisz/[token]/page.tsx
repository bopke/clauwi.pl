import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/clauwi/page-shell";
import { Row } from "@/components/clauwi/layout";
import { findNewsletterToken } from "@/lib/clauwi/newsletter-repo";
import { resubscribeAction, unsubscribeAction } from "./actions";

export const metadata: Metadata = {
  title: "Wypisz się z newslettera — ClauWi®",
  robots: { index: false, follow: false },
};

// Reads D1 per request; the token decides what's shown.
export const dynamic = "force-dynamic";

/** "anna.kowalska@gmail.com" → "a***a@gmail.com" — enough to recognise, not to harvest. */
function mask(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return (user.length <= 2 ? user[0] + "***" : `${user[0]}***${user[user.length - 1]}`) + "@" + domain;
}

const BUTTON =
  "inline-block cursor-pointer bg-[#cb8c7c] px-6 py-3 font-sans text-[15px] tracking-[0.08em] text-white uppercase shadow-[3px_4px_5px_0_rgba(0,0,0,0.2)] hover:bg-[#b87565]";

// Landing page of the unsubscribe link in newsletter e-mails. Opening it
// changes nothing — mail scanners follow links — the button does.
export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findNewsletterToken(token);

  return (
    <PageShell>
      <Row className="bg-[#f4f4f4]" innerClassName="flow-root py-[60px] text-center">
        <h1 className="mb-6 font-heading text-[40px] leading-tight text-[#692d2c]">Newsletter ClauWi®</h1>
        {!found ? (
          <p className="mx-auto max-w-[560px]">
            Ten link wypisu jest nieprawidłowy lub nieaktualny. Jeśli chcesz wypisać się z newslettera, napisz do nas:{" "}
            <a href="mailto:kontakt@clauwi.pl">kontakt@clauwi.pl</a>.
          </p>
        ) : found.suppressed ? (
          <>
            <p className="mx-auto mb-6 max-w-[560px] text-[20px]">
              Adres <b>{mask(found.email)}</b> został wypisany. Nie będziemy już wysyłać na niego informacji o kursach i ofertach.
            </p>
            <p className="mx-auto mb-4 max-w-[560px]">Wiadomości związane z Twoimi zapisami na kursy nadal będą przychodzić.</p>
            <form action={resubscribeAction.bind(null, token)}>
              <button type="submit" className="cursor-pointer font-sans text-[14px] text-[#692d2c] underline underline-offset-2">
                To pomyłka — zapisz mnie ponownie
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mx-auto mb-8 max-w-[560px] text-[20px]">
              Czy chcesz wypisać adres <b>{mask(found.email)}</b> z newslettera? Nie będziemy już wysyłać na niego informacji o kursach i ofertach.
            </p>
            <form action={unsubscribeAction.bind(null, token)}>
              <button type="submit" className={BUTTON}>Wypisz mnie</button>
            </form>
          </>
        )}
        <p className="mt-10">
          <Link href="/">Wróć na stronę główną</Link>
        </p>
      </Row>
    </PageShell>
  );
}
