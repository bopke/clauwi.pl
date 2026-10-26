import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A full-width band of the original theme's "row layout": optional
 * background across the whole viewport, content in the theme's standard
 * container (max 1290px including 24px side padding, i.e. a 1242px column).
 */
export function Row({
  children,
  id,
  className,
  innerClassName,
  style,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  innerClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div id={id} className={className} style={style}>
      <div className={cn("mx-auto max-w-[1290px] px-6", innerClassName)}>{children}</div>
    </div>
  );
}

// The theme's display face — Palatino Linotype with its long serif fallback
// chain (macOS renders it as Palatino).
export const PALATINO =
  '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", "Book Antiqua", Baskerville, "Bookman Old Style", "Bitstream Charter", "Nimbus Roman No9 L", Garamond, "Apple Garamond", "ITC Garamond Narrow", "New Century Schoolbook", "Century Schoolbook", "Century Schoolbook L", Georgia, serif';

/**
 * The large uppercase page heading used across the static pages: Palatino,
 * weight 200, #692D2C, left-aligned; 50/75px up to 1025px and 57/85.5px from
 * 1026px (the heading plugin switches one pixel later than the theme), with
 * 35px above and below.
 */
export function PageHeading({
  children,
  as: Tag = "h2",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "my-[35px] text-[50px] font-extralight uppercase leading-[75px] text-[#692D2C] min-[1026px]:text-[57px] min-[1026px]:leading-[85.5px]",
        className,
      )}
      style={{ fontFamily: PALATINO }}
    >
      {children}
    </Tag>
  );
}

/**
 * The theme's boxed content template (archives, the testimonials page, blog
 * posts): vertical margin of 32px / 48px from 768px / 80px from 1025px, with
 * the content in the standard container. Full-width bands inside it break
 * out with `Bleed`.
 */
export function ContentArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("my-8 min-[768px]:my-12 min-[1025px]:my-20", className)}>
      <div className="mx-auto max-w-[1290px] px-6">{children}</div>
    </div>
  );
}

/** Breaks a band out of the content container to the full viewport width. */
export function Bleed({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative left-1/2 w-screen -translate-x-1/2", className)}>{children}</div>;
}

/** "CLAUWI® > Page" trail, as the theme printed it above the content. */
export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <div>
      <Link href="/">CLAUWI®</Link>
      {trail.map((c, i) => (
        <span key={i}>
          {" > "}
          {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
        </span>
      ))}
    </div>
  );
}
