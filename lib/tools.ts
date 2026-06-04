export type Tool = {
  slug: string;
  name: string;
  blurb: string;
  href: string;
  tag: string;
};

export const TOOLS: Tool[] = [
  {
    slug: "image-converter",
    name: "Image Converter",
    blurb:
      "Convert images between JPEG, PNG and WebP — tune quality, batch convert. Runs entirely in your browser; nothing is uploaded.",
    href: "/tools/image-converter",
    tag: "browser-only",
  },
];
