import type { BlogAuthor, BlogCategory, BlogPost, BlogSettings } from "@/lib/blog/types";

function block(text: string, style: "normal" | "h2" | "h3" | "blockquote" = "normal") {
  return {
    _type: "block",
    _key: text.slice(0, 12),
    style,
    children: [{ _type: "span", _key: `${text.slice(0, 8)}-span`, text }],
    markDefs: [],
  };
}

function callout(title: string, body: string, tone: "neutral" | "success" | "warning" = "neutral") {
  return {
    _type: "callout",
    _key: `${title}-callout`,
    title,
    body,
    tone,
  };
}

const categories: BlogCategory[] = [
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

const authors: Record<string, BlogAuthor> = {
  editorial: {
    name: "Piron Editorial",
    role: "Editorial team",
  },
  product: {
    name: "Piron Product",
    role: "Product and strategy",
  },
};

export const samplePosts: BlogPost[] = [
  {
    _id: "sample-1",
    title: "Why fixed income needs better internet-native distribution",
    slug: "why-fixed-income-needs-better-internet-native-distribution",
    excerpt:
      "The opportunity is not just to move assets online. It is to make duration, disclosure, and capital flow easier to inspect before capital moves.",
    publishedAt: "2026-04-02T09:00:00.000Z",
    category: categories[2],
    author: authors.editorial,
    tags: ["fixed income", "tokenization"],
    body: [
      block(
        "Fixed income products have always depended on structure. Maturity, liquidity, credit quality, settlement mechanics, and cash flow timing all shape the product long before any headline yield number appears."
      ),
      block(
        "What changes online is not the underlying risk. What changes is the clarity available to the end user. A better interface can make the structure easier to evaluate, compare, and monitor in real time.",
        "h2",
      ),
      block(
        "That is where Piron’s blog should live. Not as a dumping ground for generic announcements, but as a publication that helps people understand what serious yield products are actually made of."
      ),
      callout(
        "Editorial principle",
        "Every post should make a reader more capable of evaluating a product, not just more aware that it exists.",
        "success",
      ),
      block(
        "In practice, that means writing with the assumption that readers are allocating real capital. They want to know how a pool behaves, what the lockup means, what introduces delay, and what kinds of outcomes would cause returns to look different from the headline."
      ),
    ],
  },
  {
    _id: "sample-2",
    title: "Piron’s approach to launch notes and product announcements",
    slug: "pirons-approach-to-launch-notes-and-product-announcements",
    excerpt:
      "Announcements should explain what changed, who it matters for, and what assumptions still sit underneath the product after the release.",
    publishedAt: "2026-03-29T14:30:00.000Z",
    category: categories[0],
    author: authors.product,
    tags: ["launch", "product"],
    body: [
      block(
        "Good launch communication does more than celebrate a release. It helps users understand what is now possible, what has changed operationally, and what still requires caution."
      ),
      block(
        "For Piron, an announcement should answer three things: what shipped, who it is for, and what remains true about risk, access, and limitations after the launch.",
        "h2",
      ),
      block(
        "That makes the blog useful to users, helpful to partners, and usable by marketing without needing engineering to rewrite every post by hand."
      ),
    ],
  },
  {
    _id: "sample-3",
    title: "Designing a fixed-income product page that deserves trust",
    slug: "designing-a-fixed-income-product-page-that-deserves-trust",
    excerpt:
      "Trust is not a color palette problem. It comes from showing enough of the product structure for a user to understand the underlying trade.",
    publishedAt: "2026-03-24T11:15:00.000Z",
    category: categories[1],
    author: authors.product,
    tags: ["ux", "disclosure"],
    body: [
      block(
        "The strongest financial interfaces do not confuse simplicity with omission. A page can be clean and still communicate the details that matter."
      ),
      block(
        "For yield products, the essentials are straightforward: source of return, expected duration, redemption logic, counterparties, and downside conditions.",
        "h2",
      ),
      block(
        "When those ideas are visible in the interface, trust comes from comprehension rather than branding alone."
      ),
    ],
  },
  {
    _id: "sample-4",
    title: "Distribution is becoming a product in its own right",
    slug: "distribution-is-becoming-a-product-in-its-own-right",
    excerpt:
      "Access, onboarding, disclosure, and downstream usability are now part of the product story, not just go-to-market wrappers around it.",
    publishedAt: "2026-03-18T08:40:00.000Z",
    category: categories[3],
    author: authors.editorial,
    tags: ["ecosystem", "distribution"],
    body: [
      block(
        "Historically, distribution sat downstream from the product. In on-chain capital markets, the distribution layer is increasingly part of the product itself."
      ),
      block(
        "That is because the interface determines who can actually understand and access the opportunity. If the route to the product is opaque, the product is not truly accessible, no matter how strong the underlying economics appear.",
        "h2",
      ),
      block(
        "The blog should reinforce this idea by helping readers understand where access, infrastructure, and product quality meet."
      ),
    ],
  },
  {
    _id: "sample-5",
    title: "What marketing should be able to publish without engineering",
    slug: "what-marketing-should-be-able-to-publish-without-engineering",
    excerpt:
      "A strong CMS setup gives marketing the tools to publish confidently while preserving brand consistency, metadata quality, and editorial guardrails.",
    publishedAt: "2026-03-12T13:00:00.000Z",
    category: categories[1],
    author: authors.product,
    tags: ["cms", "ops"],
    body: [
      block(
        "A content workflow is only useful if the people closest to the message can actually use it. That means titles, excerpts, categories, images, SEO fields, and social copy should be editable without code changes."
      ),
      callout(
        "Operational goal",
        "Marketing should be able to draft, review, publish, and share an article without waiting on engineering for routine changes.",
      ),
      block(
        "Engineering should own the system and design language. Marketing should own publishing inside that system."
      ),
    ],
  },
  {
    _id: "sample-6",
    title: "How we think about categories for the Piron Journal",
    slug: "how-we-think-about-categories-for-the-piron-journal",
    excerpt:
      "Categories should help readers navigate intent quickly: what shipped, what we learned, what we believe, and how the market is moving.",
    publishedAt: "2026-03-05T16:20:00.000Z",
    category: categories[2],
    author: authors.editorial,
    tags: ["editorial", "blog"],
    body: [
      block(
        "A category system should make the publication easier to scan, not harder to maintain. Too many categories create noise. Too few flatten the content into something vague."
      ),
      block(
        "For Piron, a small editorial system works well: announcements for launches, product and tech for implementation detail, perspectives for market thinking, and ecosystem for broader distribution or partner context.",
        "h2",
      ),
      block(
        "That keeps the blog legible for readers and manageable for teams publishing under real deadlines."
      ),
    ],
  },
];

export const sampleSettings: BlogSettings = {
  title: "Piron Journal",
  description:
    "Product updates, market notes, and practical writing on fixed income, distribution, and on-chain capital markets.",
  heroPost: samplePosts[0],
  featuredPosts: samplePosts.slice(1, 4),
  ctaTitle: "Ready to start earning with Piron?",
  ctaDescription:
    "Explore the app, review live pools, and move from research into action with clearer access to fixed-income opportunities.",
  ctaLabel: "Launch app",
  ctaHref: "/",
};

export const sampleCategories = categories;
