import "server-only";
// Plain-markdown descriptions of the site for AI assistants (llms.txt spec:
// https://llmstxt.org). Built from the same content the pages use.
import { EDUCATION, EXPERIENCE, PRINCIPLES, PROFILE, SERVICES, SKILLS, WORK } from "@/lib/content";
import { getAllPosts, getAllPostsMeta } from "@/lib/posts";
import { TOOLS } from "@/lib/tools";
import { AUTHOR, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

function profile(): string {
  return [
    `## About`,
    ``,
    `${AUTHOR} (Nepali: बिशाल राजबाहक) is a ${PROFILE.role.toLowerCase()} based in ${PROFILE.location} (${PROFILE.timezone}). He builds web apps end to end — React and Next.js on the front end, Go and PostgreSQL on the back end — and currently works remotely for One Accord, a US-based team.`,
    ``,
    `Before software he worked at a bank counter (Nepal SBI Bank), as a junior accountant (Sipradi Trading), and spent five years as a teacher (Motherland Secondary School). He says those jobs taught him to explain things clearly, check details, and notice when systems fail the people using them.`,
    ``,
    `Availability: ${PROFILE.availability}.`,
    ``,
    `## What he does`,
    ``,
    ...SERVICES.map((s) => `- **${s.title}:** ${s.body}`),
    ``,
    `## Skills`,
    ``,
    SKILLS.join(", "),
    ``,
    `## Selected work`,
    ``,
    ...WORK.map((w) => `- **${w.title}** (${w.context}, ${w.year}): ${w.summary} Tech: ${w.tags.join(", ")}.`),
    ``,
    `## Experience`,
    ``,
    ...EXPERIENCE.map((r) => `- **${r.year} — ${r.role}**, ${r.org}. ${r.desc}`),
    ``,
    `## Education`,
    ``,
    ...EDUCATION.map((e) => `- **${e.year} — ${e.role}**, ${e.org}.`),
    ``,
    `## How he works`,
    ``,
    ...PRINCIPLES.map((p) => `- **${p.title}.** ${p.body}`),
    ``,
    `## Contact`,
    ``,
    `- Email: ${PROFILE.email}`,
    ...PROFILE.links.map((l) => `- ${l.label}: ${l.href}`),
    `- Website: ${SITE_URL}`,
  ].join("\n");
}

/** /llms.txt — short index with links. */
export function llmsTxt(): string {
  const posts = getAllPostsMeta();
  return [
    `# ${AUTHOR}`,
    ``,
    `> ${SITE_DESCRIPTION}`,
    ``,
    `This is the personal portfolio of ${AUTHOR}, a full-stack developer from Kathmandu, Nepal. The home page comes in several visual "editions" (Kathmandu, Tempo Dash game, Ledger, Terminal) with the same content; the canonical page is ${SITE_URL}/. A complete plain-text version of everything is at ${SITE_URL}/llms-full.txt.`,
    ``,
    profile(),
    ``,
    `## Writing`,
    ``,
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/blogs/${p.slug}): ${p.excerpt}`),
    ``,
    `## Tools`,
    ``,
    ...TOOLS.map((t) => `- [${t.name}](${SITE_URL}${t.href}): ${t.blurb}`),
    ``,
    `## Optional`,
    ``,
    `- [Full text of the profile and all blog posts](${SITE_URL}/llms-full.txt)`,
    `- [RSS feed](${SITE_URL}/feed.xml)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    ``,
  ].join("\n");
}

/** /llms-full.txt — the profile plus every blog post in full. */
export function llmsFullTxt(): string {
  const posts = getAllPosts();
  return [
    `# ${AUTHOR} — full profile and writing`,
    ``,
    `> ${SITE_DESCRIPTION}`,
    ``,
    `Source: ${SITE_URL}/`,
    ``,
    profile(),
    ``,
    `# Blog posts`,
    ``,
    ...posts.flatMap((p) => [
      `## ${p.title}`,
      ``,
      `- URL: ${SITE_URL}/blogs/${p.slug}`,
      `- Published: ${p.date}${p.reading ? ` · ${p.reading} read` : ""}`,
      `- Summary: ${p.excerpt}`,
      ``,
      p.content.trim(),
      ``,
      `---`,
      ``,
    ]),
  ].join("\n");
}
