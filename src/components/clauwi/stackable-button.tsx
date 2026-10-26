import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Stackable button block the home page is built from: a wrapper with
 * 35px vertical margin (collapsing between neighbours, as in the original),
 * the button inside with 8.5px below it. `full` stretches it to the column.
 * Hover effects: "fade" (ghost buttons dim to 85%), "scale" (×1.03) and
 * "scale-more" (×1.13).
 */
export function StackableButton({
  href,
  children,
  full = false,
  hover,
  className,
  labelClassName,
  wrapperClassName,
}: {
  href: string;
  children: React.ReactNode;
  full?: boolean;
  hover?: "scale" | "scale-more" | "fade" | "scale-more-fade";
  className?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("my-[35px] flow-root text-center", wrapperClassName)}>
      <div className="-mx-[8.5px] flex flex-wrap items-center justify-center">
        <Link
          href={href}
          className={cn(
            "mx-[8.5px] mb-[8.5px] block rounded-[1px] leading-[25.5px] transition-all duration-200 ease-in-out",
            full && "grow",
            (hover === "scale") && "hover:scale-[1.03]",
            (hover === "scale-more" || hover === "scale-more-fade") && "hover:scale-[1.13]",
            (hover === "fade" || hover === "scale-more-fade") && "hover:opacity-85",
            className,
          )}
        >
          <span className={cn("relative z-[2] block", labelClassName)}>{children}</span>
        </Link>
      </div>
    </div>
  );
}
