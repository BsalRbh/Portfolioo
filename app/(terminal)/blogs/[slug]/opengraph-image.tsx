import { ImageResponse } from "next/og";
import { getAllSlugs, getPost } from "@/lib/posts";

// Social preview for each blog post: the post title on the site's dark card.
export const alt = "Blog post by Bishal Rajbahak";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function PostImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "Writing";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0b0b0d",
          color: "#f3efe6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#c8ff00", letterSpacing: 2 }}>
          {post ? `${post.dateDisplay} · ${post.reading} · ESSAY` : "ESSAY"}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 48 ? 64 : 80, fontWeight: 800, lineHeight: 1.08 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#b8b3a6" }}>
          <span>Bishal Rajbahak — full-stack developer, Kathmandu</span>
          <span style={{ color: "#c8ff00" }}>bishalrajbahak.com.np</span>
        </div>
      </div>
    ),
    size,
  );
}
