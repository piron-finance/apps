import type { BlogCategory, BlogSettings } from "@/lib/blog/types";

/**
 * Presentation-side blog config: the category list used for the filter tabs and
 * the static index/CTA copy. Post content itself comes from the backend blog API
 * (`/api/v1/blog`). The category list mirrors the backend `blog.constants`.
 */

export const categories: BlogCategory[] = [
  {
    title: "Announcements",
    slug: "announcements",
    description: "Product launches, company updates, and major platform news.",
  },
  {
    title: "Product & Tech",
    slug: "product-tech",
    description: "How Piron thinks about infrastructure, product design, and delivery.",
  },
  {
    title: "Perspectives",
    slug: "perspectives",
    description: "Research notes and opinion pieces on fixed income and on-chain markets.",
  },
  {
    title: "Ecosystem",
    slug: "ecosystem",
    description: "Partnerships, distribution, and the broader market around Piron.",
  },
];

/** Blog index copy + the bottom CTA. hero/featured posts come from the API. */
export const blogSettings: Omit<BlogSettings, "heroPost" | "featuredPosts"> = {
  title: "Piron Journal",
  description:
    "Product updates, market notes, and practical writing on fixed income, distribution, and on-chain capital markets.",
  ctaTitle: "Ready to start earning with Piron?",
  ctaDescription:
    "Explore the app, review live pools, and move from research into action with clearer access to fixed-income opportunities.",
  ctaLabel: "Launch app",
  ctaHref: "/",
};
