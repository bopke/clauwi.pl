// Frame for the public site; each page brings its own header and footer
// (PageShell), so all this renders is children.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}
