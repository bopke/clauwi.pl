import Script from "next/script";

// Parallel-route layout for the course calendar segment. `modal` renders the
// intercepted course-detail route (@modal/(.)[id]) as an overlay on top of
// `children` (the course list) when navigated to client-side; it renders
// nothing (@modal/default.tsx) on a direct/fresh load of any URL under this
// segment, including /kalendarz-wydarzen/[id] itself — that URL still works
// as a full page (see [id]/page.tsx) for direct links, SEO, and no-JS.
//
// The Turnstile script is loaded here (rather than per-page) since the
// booking form's widget can render either on the full [id] page or inside
// the @modal overlay — both need it, and it's a harmless no-op on the list.
export default function KalendarzWydarzenLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" async defer />
    </>
  );
}
