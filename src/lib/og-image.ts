import type { Metadata } from "next";

/**
 * The image from `src/app/opengraph-image.tsx` (`/opengraph-image`).
 *
 * Next.js assigns a child segment's `openGraph` over the parent object, so a
 * page that sets `openGraph` without `images` drops the root file image.
 * Blog posts are the exception: they have their own `opengraph-image.tsx`.
 * When `twitter.images` is omitted, Next copies `openGraph.images` and leaves
 * the existing twitter title, description, and card alone.
 */
export const rootOgImages: NonNullable<Metadata["openGraph"]>["images"] = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "PrivacyPage - Privacy Policy Generator for Apps",
    type: "image/png",
  },
];
