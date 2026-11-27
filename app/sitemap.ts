import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/posts";
import { TOOLS } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

// Only canonical URLs. The editions (/kathmandu, /tempo, /ledger, /terminal)
// all declare "/" as canonical, so they're left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta();
  const latestPost = posts[0]?.date ? new Date(posts[0].date) : new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blogs/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/tools`, lastModified: latestPost, changeFrequency: "monthly", priority: 0.5 },
    ...TOOLS.map((t) => ({
      url: `${SITE_URL}${t.href}`,
      lastModified: latestPost,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
