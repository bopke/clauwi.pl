import type { MetadataRoute } from "next";
import { registry } from "@/legacy/registry";
import { WOJ_META } from "@/lib/clauwi/advisors";
import { listUpcomingCourses } from "@/lib/clauwi/courses-repo";
import { getBlogPostMeta } from "@/lib/clauwi/blog-meta";

const BASE = "https://clauwi.pl";

// Course listings change via the admin panel — never freeze this at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
  ];

  // Mirrored static pages (blog posts frozen — low priority/rarely changes;
  // core informational pages get a moderate priority).
  for (const key of Object.keys(registry)) {
    const isPost = !key.startsWith("strona-glowna") && !key.startsWith("category") && key !== "blog"
      && !["o-nas", "kontakt", "opinie", "wsparcie-na-starcie", "konferencja-clauwi2025", "polityka-prywatnosci", "regulam-i-zasady-naboru"].includes(key);
    const post = getBlogPostMeta(key);
    entries.push({
      url: `${BASE}/${key}`,
      changeFrequency: isPost ? "yearly" : "monthly",
      priority: isPost ? 0.4 : 0.6,
      ...(post ? { lastModified: post.dateModified } : {}),
    });
  }

  // Advisor directory — region index + each voivodeship page.
  entries.push({ url: `${BASE}/o-nas/lista-doradcow`, changeFrequency: "weekly", priority: 0.7 });
  for (const woj of WOJ_META) {
    entries.push({ url: `${BASE}/o-nas/lista-doradcow/${woj.slug}`, changeFrequency: "weekly", priority: 0.6 });
  }

  // Course calendar — index + each currently-upcoming course (past/inactive
  // courses aren't worth indexing).
  entries.push({ url: `${BASE}/kalendarz-wydarzen`, changeFrequency: "daily", priority: 0.8 });
  try {
    const courses = await listUpcomingCourses();
    for (const course of courses) {
      entries.push({ url: `${BASE}/kalendarz-wydarzen/${course.id}`, changeFrequency: "daily", priority: 0.7 });
    }
  } catch {
    // D1 not reachable at build/prerender time — sitemap still works without course rows.
  }

  return entries;
}
