import { NewsletterBanner } from "@/components/clauwi/newsletter-banner";

// Frame for the public site; each page brings its own header and footer
// (PageShell), so all this adds is the newsletter bar along the bottom.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      {children}
      <NewsletterBanner />
    </div>
  );
}
