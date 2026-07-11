import type {
  BlogImage,
  BlogIndexData,
  BlogPost,
  BlogPostPageData,
  BlogSettings,
} from "@/lib/blog/types";
import { blogSettings, categories as allCategories } from "@/lib/blog/config";
import {
  fetchPostBySlug,
  fetchPublishedPosts,
  type ApiBlogPost,
} from "@/lib/blog/api";

const POSTS_PER_PAGE = 6;

type LoadedPost = BlogPost & { hero: boolean; featured: boolean };

function buildImage(url?: string | null, alt?: string | null): BlogImage | undefined {
  if (!url) return undefined;
  const w = 1600;
  const h = 900;
  return {
    alt: alt || "",
    asset: {
      url,
      metadata: { dimensions: { width: w, height: h, aspectRatio: w / h } },
    },
  };
}

/** Map the backend response onto the presentation-layer BlogPost shape. */
function toBlogPost(api: ApiBlogPost): LoadedPost {
  return {
    _id: api.id,
    title: api.title,
    slug: api.slug,
    excerpt: api.excerpt,
    publishedAt: api.publishedAt || api.createdAt,
    category: api.category
      ? { title: api.category.title, slug: api.category.slug }
      : undefined,
    author: api.author
      ? { name: api.author.name, role: api.author.role || undefined }
      : undefined,
    image: buildImage(api.coverImage?.url, api.coverImage?.alt),
    body: api.body || "",
    tags: api.tags,
    seoTitle: api.seoTitle || undefined,
    seoDescription: api.seoDescription || undefined,
    socialTitle: api.socialTitle || undefined,
    socialDescription: api.socialDescription || undefined,
    socialImage: buildImage(api.socialImageUrl),
    hero: api.isHero,
    featured: api.isFeatured,
  };
}

async function loadPosts(): Promise<LoadedPost[]> {
  const posts = (await fetchPublishedPosts()) || [];
  return posts
    .map(toBlogPost)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

function fullSettings(
  heroPost?: BlogPost | null,
  featuredPosts: BlogPost[] = [],
): BlogSettings {
  return { ...blogSettings, heroPost, featuredPosts };
}

function paginate<T>(items: T[], page: number, size: number) {
  const start = (page - 1) * size;
  return items.slice(start, start + size);
}

function normalizeSearchQuery(query?: string) {
  return query?.trim().replace(/\s+/g, " ") || "";
}

export async function getBlogIndexData({
  category = "",
  page = 1,
  query = "",
}: {
  category?: string;
  page?: number;
  query?: string;
}): Promise<BlogIndexData> {
  const activeCategory = category;
  const searchQuery = normalizeSearchQuery(query);
  const posts = await loadPosts();

  // Filtered / search view — a flat, paginated archive with no editorial sections.
  if (activeCategory || searchQuery) {
    const lowered = searchQuery.toLowerCase();
    const filtered = posts.filter((post) => {
      const categoryMatch = !activeCategory || post.category?.slug === activeCategory;
      const searchMatch =
        !searchQuery ||
        post.title.toLowerCase().includes(lowered) ||
        post.excerpt.toLowerCase().includes(lowered);
      return categoryMatch && searchMatch;
    });

    return {
      configured: true,
      settings: fullSettings(),
      categories: allCategories,
      heroPost: undefined,
      featuredPosts: [],
      recentPosts: paginate(filtered, page, POSTS_PER_PAGE),
      totalRecentPosts: filtered.length,
      page,
      hasMore: page * POSTS_PER_PAGE < filtered.length,
      searchQuery,
      activeCategory,
    };
  }

  // Editorial view — hero (a post flagged hero, else latest), then featured, then
  // the paginated remainder.
  const heroPost = posts.find((p) => p.hero) || posts[0] || null;
  const featuredPosts = posts
    .filter((p) => p.featured && p._id !== heroPost?._id)
    .slice(0, 3);

  const excludedIds = new Set(
    [heroPost?._id, ...featuredPosts.map((p) => p._id)].filter(Boolean),
  );
  const recent = posts.filter((p) => !excludedIds.has(p._id));

  return {
    configured: true,
    settings: fullSettings(heroPost, featuredPosts),
    categories: allCategories,
    heroPost,
    featuredPosts,
    recentPosts: paginate(recent, page, POSTS_PER_PAGE),
    totalRecentPosts: recent.length,
    page,
    hasMore: page * POSTS_PER_PAGE < recent.length,
    searchQuery,
    activeCategory,
  };
}

export async function getBlogPostPageData(slug: string): Promise<BlogPostPageData> {
  const [apiPost, all] = await Promise.all([fetchPostBySlug(slug), loadPosts()]);
  const post = apiPost ? toBlogPost(apiPost) : null;

  const relatedPosts = post
    ? all
        .filter((p) => p.slug !== slug && p.category?.slug === post.category?.slug)
        .slice(0, 3)
    : [];

  return {
    configured: true,
    post,
    settings: fullSettings(),
    relatedPosts,
  };
}
