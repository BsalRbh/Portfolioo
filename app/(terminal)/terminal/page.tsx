import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { EditionSwitcher } from "@/components/site/EditionSwitcher";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Terminal",
  description:
    "The developer edition of Bishal Rajbahak's portfolio — keyboard-driven, CRT modes, command palette and easter eggs.",
  // Same content as the main portfolio; let "/" own search ranking.
  alternates: { canonical: "/" },
};

export default function TerminalPage() {
  const posts = getAllPostsMeta();
  return (
    <>
      <AppShell posts={posts} />
      <div className="terminal-edition">
        <EditionSwitcher current="terminal" />
      </div>
    </>
  );
}
