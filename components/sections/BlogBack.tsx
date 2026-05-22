"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BlogBack() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/#writing");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <Link href="/#writing" className="post-close blog-back" aria-label="Close">
      ✕ ESC
    </Link>
  );
}
