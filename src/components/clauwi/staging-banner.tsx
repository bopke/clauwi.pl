// Orange "this is the test environment" bar, fixed to the top of the viewport.
//
// NEXT_PUBLIC_APP_ENV is set at BUILD time by `npm run deploy` (see
// package.json) — most public pages are prerendered to static HTML, so a
// runtime Worker variable would never reach them. `npm run deploy:prod`
// builds without it, so production renders nothing here.

const BAR_HEIGHT = 28;

export function StagingBanner() {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "staging") return null;

  return (
    <>
      <div
        role="status"
        className="fixed inset-x-0 top-0 z-[100001] flex items-center justify-center bg-orange-500 px-4 text-center text-xs font-semibold uppercase tracking-wide text-white shadow"
        style={{ height: BAR_HEIGHT }}
      >
        Środowisko testowe (staging) — to nie jest strona produkcyjna
      </div>
      {/* Pushes the page down so the bar doesn't cover the header. */}
      <div aria-hidden style={{ height: BAR_HEIGHT, flexShrink: 0 }} />
    </>
  );
}
