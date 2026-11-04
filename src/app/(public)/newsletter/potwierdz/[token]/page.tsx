import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/clauwi/page-shell";
import { Row } from "@/components/clauwi/layout";
import { findPendingSignup } from "@/lib/clauwi/newsletter-repo";
import { confirmSignupAction } from "./actions";

export const metadata: Metadata = {
  title: "Potwierdź zapis na newsletter — ClauWi®",
  robots: { index: false, follow: false },
};

// Reads D1 per request; the token decides what's shown.
export const dynamic = "force-dynamic";

const BUTTON =
  "inline-block cursor-pointer bg-[#cb8c7c] px-6 py-3 font-sans text-[15px] tracking-[0.08em] text-white uppercase shadow-[3px_4px_5px_0_rgba(0,0,0,0.2)] hover:bg-[#b87565]";

// Landing page of the link in the "confirm your sign-up" e-mail. Like the
// unsubscribe page, opening it changes nothing — mail scanners follow links,
// and must not sign anyone up — the button does.
export default async function ConfirmSignupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pending = await findPendingSignup(token);

  return (
    <PageShell>
      <Row className="bg-[#f4f4f4]" innerClassName="flow-root py-[60px] text-center">
        <h1 className="mb-6 font-heading text-[40px] leading-tight text-[#692d2c]">Newsletter ClauWi®</h1>
        {!pending ? (
          <p className="mx-auto max-w-[560px]">Ten link jest nieprawidłowy. Zapisz się ponownie przez formularz na stronie.</p>
        ) : pending.confirmed ? (
          <>
            <p className="mx-auto mb-4 max-w-[560px] text-[20px]">Dziękujemy — zapis potwierdzony!</p>
            <p className="mx-auto max-w-[560px]">
              Kilka razy w roku napiszemy o nowych terminach kursów i ofertach. W każdej wiadomości znajdziesz link, by się wypisać.
            </p>
          </>
        ) : pending.expired ? (
          <p className="mx-auto max-w-[560px]">Ten link wygasł. Zapisz się ponownie przez formularz na stronie — wyślemy nowy.</p>
        ) : (
          <>
            <p className="mx-auto mb-8 max-w-[560px] text-[20px]">Kliknij, aby potwierdzić zapis na newsletter z informacjami o kursach i ofertach ClauWi®.</p>
            <form action={confirmSignupAction.bind(null, token)}>
              <button type="submit" className={BUTTON}>Potwierdzam zapis</button>
            </form>
          </>
        )}
        <p className="mt-10">
          <Link href="/kalendarz-wydarzen">Zobacz kalendarz kursów</Link> · <Link href="/">Strona główna</Link>
        </p>
      </Row>
    </PageShell>
  );
}
