import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { cn } from "@/lib/utils";

/**
 * Frame for the static pages: header, content, footer. The content area
 * carries the original theme's body typography — 17px/27.2px Cormorant
 * Garamond in #2D3748, long words breaking rather than overflowing — so pages
 * only style what differs from it.
 * `footer={false}` is for the one landing page that had none.
 */
export function PageShell({
  children,
  footer = true,
  overlayHeader = false,
  className,
}: {
  children: React.ReactNode;
  footer?: boolean;
  /** The home page's header, lying over its hero photo on desktop. */
  overlayHeader?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader overlay={overlayHeader} />
      <main id="main" className={cn("page-content flex-1 font-heading text-[17px] leading-[27.2px] text-[#2D3748] [word-break:break-word]", className)}>{children}</main>
      {footer && <SiteFooter />}
    </div>
  );
}
