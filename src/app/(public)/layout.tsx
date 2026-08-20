// Frame for the public site. Legacy-mirrored pages carry their own header and
// footer (straight from the original HTML), so all this renders is children.
// NOTE: legacy/base.css (the Kadence theme CSS) is deliberately NOT imported
// here — doing so applied it globally to EVERY public page, and its broad
// element selectors (button, input, table…) then overrode Tailwind classes on
// the new pages (course calendar, advisor directory). The import now lives
// only in the files that actually render mirrored content: the homepage and
// the [...slug] catch-all.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}
