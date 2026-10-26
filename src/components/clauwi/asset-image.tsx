/**
 * An image from the WordPress uploads, served from R2 through /assets
 * (see src/app/assets/[...path]/route.ts) exactly as before — there is no
 * Next.js image optimizer configured for Cloudflare, so this stays a plain
 * <img>. Lazy-loaded unless `priority` is set.
 */
export function AssetImage({
  src,
  alt,
  priority = false,
  ...rest
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading"> & { src: string; alt: string; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- see above
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" {...rest} />;
}
