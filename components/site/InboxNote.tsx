import { PROFILE } from "@/lib/content";

const INSTAGRAM = PROFILE.links.find((l) => l.label === "Instagram")?.href ?? "https://www.instagram.com/bsal.rbh/";

/** The honest-about-email line shown next to the email address in every edition. */
export function InboxNote({ className }: { className?: string }) {
  return (
    <p className={className}>
      Fair warning: my inbox moves like Kathmandu traffic at rush hour. If I haven&apos;t replied in a couple of
      days, honk at me on{" "}
      <a href={INSTAGRAM} target="_blank" rel="noreferrer">
        Instagram
      </a>
      .
    </p>
  );
}
