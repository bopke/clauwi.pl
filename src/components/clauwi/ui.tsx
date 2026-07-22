import Link from "next/link";
import { cn } from "@/lib/utils";

/** Salmon CTA button matching the live site (filled brand, white uppercase). */
export function CtaButton({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const external = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  const classes = cn(
    "inline-flex items-center justify-center rounded-[1px] px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
    variant === "solid"
      ? "bg-brand text-white hover:bg-[#b87565]"
      : "border border-brand text-brand hover:bg-brand hover:text-white",
    className,
  );
  return external ? (
    <a href={href} className={classes}>{children}</a>
  ) : (
    <Link href={href} className={classes}>{children}</Link>
  );
}

/** Centered serif section heading, matching the live "O NAS / KURSY / blog" style. */
export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-center font-heading text-4xl font-medium uppercase tracking-wide text-brand md:text-5xl", className)}>
      {children}
    </h2>
  );
}
