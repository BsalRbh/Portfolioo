import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { getAllSlugs, getAllPostsMeta, getPost } from "@/lib/posts";
import { BlogBack } from "@/components/sections/BlogBack";
import { AUTHOR as AUTHOR_NAME, PERSON_ID, SITE_URL, WEBSITE_ID } from "@/lib/site";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  const url = `${SITE_URL}/blogs/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": [{ url: "/feed.xml", title: `${AUTHOR_NAME} — Writing` }] },
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: `${AUTHOR_NAME} — Portfolio`,
      publishedTime: post.date,
      authors: [SITE_URL],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPostsMeta();
  const index = all.findIndex((p) => p.slug === slug);
  const url = `${SITE_URL}/blogs/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", "@id": PERSON_ID, name: AUTHOR_NAME, url: SITE_URL },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };

  return (
    <div className="post-shroud post-shroud--page blog-page">
      <article className="post-reader">
        <header className="post-head">
          <div className="post-meta">
            <time dateTime={post.date}>{post.dateDisplay}</time> · {post.reading} · ESSAY
          </div>
          <BlogBack />
        </header>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-body">
          <MDXRemote source={post.content} />
        </div>
        <footer className="post-foot">
          <span>
            bishal rajbahak ·{" "}
            <time dateTime={post.date}>{post.dateDisplay.toLowerCase()}</time>
          </span>
          <span>
            {index + 1} / {all.length}
          </span>
        </footer>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
