import { AppShell } from "@/components/AppShell";
import { getAllPostsMeta } from "@/lib/posts";

export default function Page() {
  const posts = getAllPostsMeta();
  return <AppShell posts={posts} />;
}
