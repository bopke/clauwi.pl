import Link from "next/link";
import { AssetImage } from "./asset-image";
import { BLOG_CATEGORIES, formatPostDate, type BlogPostMeta } from "@/lib/clauwi/blog-meta";

/** Kadence's "continue reading" arrow. */
function ArrowIcon() {
  return (
    <span className="ml-[0.5em] inline-flex size-[1em]">
      <svg viewBox="0 0 27 28" fill="currentColor" className="relative top-[0.125em] block size-[1em]" aria-hidden>
        <path d="M27 13.953c0 0.141-0.063 0.281-0.156 0.375l-6 5.531c-0.156 0.141-0.359 0.172-0.547 0.094-0.172-0.078-0.297-0.25-0.297-0.453v-3.5h-19.5c-0.281 0-0.5-0.219-0.5-0.5v-3c0-0.281 0.219-0.5 0.5-0.5h19.5v-3.5c0-0.203 0.109-0.375 0.297-0.453s0.391-0.047 0.547 0.078l6 5.469c0.094 0.094 0.156 0.219 0.156 0.359v0z" />
      </svg>
    </span>
  );
}

/**
 * A post in the blog archives: 2:3 thumbnail, category, title, date, excerpt,
 * "continue" link. Spacing follows the theme's own breakpoints (padding at
 * 768px, the gap under the category at 720px).
 */
export function PostCard({ post }: { post: BlogPostMeta }) {
  const href = `/${post.slug}`;
  const category = BLOG_CATEGORIES[post.category];
  return (
    <article className="rounded-[4px] bg-white shadow-[0_15px_15px_-10px_rgba(0,0,0,0.05)]">
      <Link href={href} className="relative block overflow-hidden pb-[66.667%]" aria-hidden tabIndex={-1}>
        <AssetImage src={post.thumbnail.src} alt={post.thumbnail.alt} className="absolute inset-0 size-full object-cover" />
      </Link>
      <div className="p-6 min-[768px]:p-8">
        <header className="mb-[17px]">
          <div className="mb-[11.9px] text-[11.9px] min-[720px]:mb-[5.95px] leading-[19.04px] tracking-[0.595px] uppercase">
            <Link href={category.href} className="font-bold">
              {category.label}
            </Link>
          </div>
          <h2 className="text-[28px] font-bold leading-[42px] text-[#1a202c]">
            <Link href={href} className="text-inherit hover:text-[#2b6cb0]">
              {post.title}
            </Link>
          </h2>
          <div className="my-[13.6px] flex flex-wrap text-[13.6px] leading-[21.76px]">
            <time dateTime={post.publishedAt} className="whitespace-nowrap">
              {formatPostDate(post.publishedAt)}
            </time>
          </div>
        </header>
        <p className="my-[17px]">{post.excerpt}</p>
        <p className="mt-[17px]">
          <Link
            href={href}
            className="text-[13.6px] font-bold leading-[21.76px] tracking-[0.68px] text-[#2d3748] uppercase hover:text-[#3182ce]"
          >
            Ciąg dalszy<span className="sr-only"> {post.title}</span>
            <ArrowIcon />
          </Link>
        </p>
      </div>
    </article>
  );
}

/** The archive grid: one column, two from 576px, three from 1025px, 40px apart. */
export function PostGrid({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <div className="grid gap-10 min-[576px]:grid-cols-2 min-[1025px]:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
