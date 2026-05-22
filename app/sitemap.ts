import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/posts";

const SITE_URL = "https://bishalrajbahak.com.np";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta();
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blogs/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
