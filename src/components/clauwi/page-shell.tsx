import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { cn } from "@/lib/utils";

/**
 * Frame for the static pages: header, content, footer. The content area
 * carries the original theme's body typography — 17px/27.2px Cormorant
 * Garamond in #2D3748 — so pages only style what differs from it.
 * `footer={false}` is for the one landing page that had none.
 */
export function PageShell({
  children,
  footer = true,
  className,
}: {
  children: React.ReactNode;
  footer?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main" className={cn("page-content flex-1 font-heading text-[17px] leading-[27.2px] text-[#2D3748]", className)}>{children}</main>
      {footer && <SiteFooter />}
    </div>
  );
}
