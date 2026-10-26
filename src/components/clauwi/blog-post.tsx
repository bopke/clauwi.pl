import Link from "next/link";
import { AssetImage } from "./asset-image";
import { BLOG_CATEGORIES, formatPostDate, type BlogPostMeta } from "@/lib/clauwi/blog-meta";
import { cn } from "@/lib/utils";

/** WordPress's drop cap: an 8.4em first letter floated into the paragraph. */
export const DROP_CAP =
  "first-letter:float-left first-letter:mt-[0.05em] first-letter:mr-[0.1em] first-letter:text-[8.4em] first-letter:leading-[0.68] first-letter:font-thin first-letter:not-italic first-letter:uppercase";

/**
 * An image inside a post, laid out as WordPress did: floated left/right with
 * the text wrapping around it, or "center" — which the theme actually
 * rendered at the left edge with the caption centred under the column.
 *
 * Mirrors the original markup closely because the layout depends on it:
 * `width`/`height` are the <img> attributes (they size an image that has no
 * CSS size, and give it its aspect ratio), `cssWidth`/`cssHeight` the sizes
 * WordPress set inline when an image was resized, `full` the "size-full"
 * class (a plugin stylesheet made those figures span the whole column), and
 * srcSet/sizes decide which file loads — the figure, a shrink-to-fit table,
 * takes that file's intrinsic width.
 */
export function PostImage({
  src,
  alt,
  width,
  height,
  cssWidth,
  cssHeight,
  align,
  full = false,
  srcSet,
  sizes,
  caption,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  cssWidth?: number;
  cssHeight?: number;
  align: "left" | "right" | "center";
  full?: boolean;
  srcSet?: string;
  sizes?: string;
  caption?: React.ReactNode;
}) {
  return (
    <figure
      className={cn(
        "flow-block table",
        align === "left" && "float-left mt-[8.5px] mr-[17px] mb-8",
        align === "right" && "float-right mt-[8.5px] mb-8 ml-[17px]",
        align === "center" && "mb-8 text-center",
        full && "w-full",
      )}
    >
      <AssetImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        className="block h-auto max-w-full align-bottom"
        style={{ width: cssWidth && `${cssWidth}px`, height: cssHeight && `${cssHeight}px` }}
      />
      {caption && (
        <figcaption className="table-caption mt-[6.8px] mb-[13.6px] text-[13.6px] leading-[21.76px] text-[#4a5568] [caption-side:bottom]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function NavArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <span className={cn("inline-flex", direction === "left" ? "pr-[0.5em]" : "pl-[0.5em]")}>
      <svg viewBox={direction === "left" ? "0 0 29 28" : "0 0 27 28"} fill="currentColor" className="relative top-[0.125em] block size-[1em]" aria-hidden>
        {direction === "left" ? (
          <path d="M28 12.5v3c0 0.281-0.219 0.5-0.5 0.5h-19.5v3.5c0 0.203-0.109 0.375-0.297 0.453s-0.391 0.047-0.547-0.078l-6-5.469c-0.094-0.094-0.156-0.219-0.156-0.359v0c0-0.141 0.063-0.281 0.156-0.375l6-5.531c0.156-0.141 0.359-0.172 0.547-0.094 0.172 0.078 0.297 0.25 0.297 0.453v3.5h19.5c0.281 0 0.5 0.219 0.5 0.5z" />
        ) : (
          <path d="M27 13.953c0 0.141-0.063 0.281-0.156 0.375l-6 5.531c-0.156 0.141-0.359 0.172-0.547 0.094-0.172-0.078-0.297-0.25-0.297-0.453v-3.5h-19.5c-0.281 0-0.5-0.219-0.5-0.5v-3c0-0.281 0.219-0.5 0.5-0.5h19.5v-3.5c0-0.203 0.109-0.375 0.297-0.453s0.391-0.047 0.547 0.078l6 5.469c0.094 0.094 0.156 0.219 0.156 0.359v0z" />
        )}
      </svg>
    </span>
  );
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[8.5px]">
      <small className="inline-block text-[13.6px] font-bold leading-[21.76px] tracking-[0.68px] uppercase">{children}</small>
    </div>
  );
}

/**
 * The single-post template: the featured image behind the top of the white
 * article card (wider than the text column), category, title, date, the
 * content, then links to the previous and next post. `after` takes anything
 * below the navigation (the published comments).
 */
export function BlogPostLayout({
  post,
  previous,
  next,
  children,
  after,
}: {
  post: BlogPostMeta;
  previous?: BlogPostMeta;
  next?: BlogPostMeta;
  children: React.ReactNode;
  after?: React.ReactNode;
}) {
  const category = BLOG_CATEGORIES[post.category];
  return (
    <div className="my-8 min-[768px]:my-12 min-[1025px]:my-20">
      <div className="mx-auto flow-root max-w-[842px] px-6">
        {/* Height is 2/3 of the text column's width; the sides reach the viewport edge
            on smaller screens, and 80px / 130px past the column on desktop. */}
        <div className="relative z-0 mx-[calc(50%-50vw)] -mb-[73.1px] overflow-hidden pb-[66.667%] min-[1025px]:mx-[-80px] min-[1102px]:mx-[-130px]">
          <AssetImage src={post.featured.src} alt={post.featured.alt} priority className="absolute inset-0 size-full object-cover" />
        </div>
        <article className="relative z-[1] -mx-4 rounded-[4px] bg-white shadow-[0_15px_15px_-10px_rgba(0,0,0,0.05)] min-[768px]:mx-0">
          <div className="p-6 min-[768px]:p-8">
            <header className="mb-[17px]">
              <div className="mb-[5.95px] text-[11.9px] leading-[19.04px] tracking-[0.595px] uppercase">
                <Link href={category.href} className="font-bold">
                  {category.label}
                </Link>
              </div>
              <h1 className="text-[32px] font-normal leading-[48px] text-[#1a202c]">{post.title}</h1>
              <div className="my-[13.6px] flex flex-wrap text-[13.6px] leading-[21.76px]">
                <time dateTime={post.publishedAt} className="whitespace-nowrap">
                  {formatPostDate(post.publishedAt)}
                </time>
              </div>
            </header>
            <div className="flow mt-8 after:clear-both after:table after:content-['']">{children}</div>
          </div>
        </article>
        <nav aria-label="Wpisy" className="my-[42.5px]">
          <h2 className="sr-only">Nawigacja wpisu</h2>
          <div className="grid grid-cols-2">
            <div>
              {previous && (
                <Link href={`/${previous.slug}`} rel="prev" className="block pr-[17px] text-[#2d3748] hover:text-[#3182ce]">
                  <NavLabel>
                    <NavArrow direction="left" />
                    Previous
                  </NavLabel>
                  {previous.title}
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link href={`/${next.slug}`} rel="next" className="block pl-[17px] text-[#2d3748] hover:text-[#3182ce]">
                  <NavLabel>
                    Next
                    <NavArrow direction="right" />
                  </NavLabel>
                  {next.title}
                </Link>
              )}
            </div>
          </div>
        </nav>
        {after}
      </div>
    </div>
  );
}

export type PublishedComment = {
  id: number;
  author: string;
  authorUrl?: string;
  avatar: string;
  /** ISO date-time and the label the theme printed for it. */
  date: string;
  dateLabel: string;
  content: React.ReactNode;
};

/**
 * Comments that were published on a post, shown as the theme showed them.
 * Commenting itself is gone (the WordPress comment form posted to the old
 * site), so there is no form and no reply button.
 */
export function PostComments({ postSlug, title, comments }: { postSlug: string; title: string; comments: PublishedComment[] }) {
  return (
    <div id="comments" className="mt-[59.5px] px-2 min-[768px]:px-0">
      <h2 className="mb-[28px] text-[28px] font-bold leading-[42px] text-[#1a202c]">{title}</h2>
      <ol>
        {comments.map((c) => (
          <li key={c.id} id={`comment-${c.id}`}>
            <article className="relative mb-[51px] border-b border-[#a0aec0]">
              <footer className="relative ml-[70px] text-[13.6px] leading-[21.76px]">
                <div className="text-[19.04px] leading-[24.752px]">
                  <AssetImage src={c.avatar} alt="" width={60} height={60} className="absolute top-0 left-[-70px] block size-[50px] rounded-full" />
                  <b className="font-bold">
                    {c.authorUrl ? (
                      <a href={c.authorUrl} rel="ugc external nofollow">
                        {c.author}
                      </a>
                    ) : (
                      c.author
                    )}
                  </b>{" "}
                  <span className="text-[15.232px] leading-[19.8016px]">pisze:</span>
                </div>
                <div className="pb-[6.8px]">
                  <Link href={`/${postSlug}#comment-${c.id}`}>
                    <time dateTime={c.date}>{c.dateLabel}</time>
                  </Link>
                </div>
              </footer>
              <div className="mb-8 pt-[5.1px]">{c.content}</div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
