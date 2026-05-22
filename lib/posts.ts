import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import type { PostMeta } from "./posts.types";
export type { PostMeta };

export type Post = PostMeta & {
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const MONTHS_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatDisplay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function readAll(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const date = String(data.date ?? "");
    return {
      slug,
      title: String(data.title ?? slug),
      date,
      dateDisplay: formatDisplay(date),
      reading: String(data.reading ?? ""),
      excerpt: String(data.excerpt ?? ""),
      content,
    };
  });
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllPosts(): Post[] {
  return readAll();
}

export function getAllPostsMeta(): PostMeta[] {
  return readAll().map(({ content: _content, ...meta }) => meta);
}

export function getPost(slug: string): Post | undefined {
  return readAll().find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return readAll().map((p) => p.slug);
}
