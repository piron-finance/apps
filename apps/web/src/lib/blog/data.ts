import type { BlogCategory, BlogIndexData, BlogPost, BlogPostPageData, BlogSettings } from "@/lib/blog/types";
import { sampleCategories, samplePosts, sampleSettings } from "@/lib/blog/sample-content";
import { sanityFetch } from "@/lib/sanity/client";
import { isSanityConfigured } from "@/lib/sanity/env";
import {
  blogSettingsQuery,
  categoriesQuery,
  filteredPostsCountQuery,
  filteredPostsQuery,
  latestPostsQuery,
  postBySlugQuery,
  recentPostsCountQuery,
  recentPostsQuery,
  relatedPostsQuery,
} from "@/lib/sanity/queries";

const POSTS_PER_PAGE = 6;

function comparePosts(a: BlogPost, b: BlogPost) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function uniquePosts(posts: Array<BlogPost | null | undefined>) {
  const seen = new Set<string>();

  return posts.filter((post): post is BlogPost => {
    if (!post || seen.has(post._id)) {
      return false;
    }

    seen.add(post._id);
    return true;
  });
}

function normalizeSearchQuery(query?: string) {
  return query?.trim().replace(/\s+/g, " ") || "";
}

function toSanitySearchPattern(query: string) {
  if (!query) {
    return "";
  }

  return `*${query.split(" ").filter(Boolean).join("*")}*`;
}

function getDefaultSettings(): BlogSettings {
  return {
    title: sampleSettings.title,
    description: sampleSettings.description,
    heroPost: undefined,
    featuredPosts: [],
    ctaTitle: sampleSettings.ctaTitle,
    ctaDescription: sampleSettings.ctaDescription,
    ctaLabel: sampleSettings.ctaLabel,
    ctaHref: sampleSettings.ctaHref,
  };
}

function withSettingsDefaults(settings?: Partial<BlogSettings> | null): BlogSettings {
  return {
    ...getDefaultSettings(),
    ...settings,
    featuredPosts: settings?.featuredPosts || [],
  };
}

function filterSamplePosts(posts: BlogPost[], category: string, query: string) {
  const lowered = query.toLowerCase();

  return posts.filter((post) => {
    const categoryMatch = !category || post.category?.slug === category;
    const searchMatch =
      !query ||
      post.title.toLowerCase().includes(lowered) ||
      post.excerpt.toLowerCase().includes(lowered);

    return categoryMatch && searchMatch;
  });
}

function paginate<T>(items: T[], page: number, size: number) {
  const start = (page - 1) * size;
  const end = start + size;

  return items.slice(start, end);
}

function getFallbackBlogIndexData({
  category,
  page,
  query,
}: {
  category: string;
  page: number;
  query: string;
}): BlogIndexData {
  const sorted = [...samplePosts].sort(comparePosts);

  if (category || query) {
    const filtered = filterSamplePosts(sorted, category, query);
    const recentPosts = paginate(filtered, page, POSTS_PER_PAGE);

    return {
      configured: false,
      settings: sampleSettings,
      categories: sampleCategories,
      heroPost: undefined,
      featuredPosts: [],
      recentPosts,
      totalRecentPosts: filtered.length,
      page,
      hasMore: page * POSTS_PER_PAGE < filtered.length,
      searchQuery: query,
      activeCategory: category,
    };
  }

  const heroPost = sampleSettings.heroPost || sorted[0];
  const featuredPosts = uniquePosts([
    ...(sampleSettings.featuredPosts || []),
    ...sorted.filter((post) => post._id !== heroPost?._id),
  ]).slice(0, 3);
  const excludedIds = new Set([heroPost?._id, ...featuredPosts.map((post) => post._id)]);
  const recent = sorted.filter((post) => !excludedIds.has(post._id));
  const recentPosts = paginate(recent, page, POSTS_PER_PAGE);

  return {
    configured: false,
    settings: sampleSettings,
    categories: sampleCategories,
    heroPost,
    featuredPosts,
    recentPosts,
    totalRecentPosts: recent.length,
    page,
    hasMore: page * POSTS_PER_PAGE < recent.length,
    searchQuery: query,
    activeCategory: category,
  };
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

  if (!isSanityConfigured()) {
    return getFallbackBlogIndexData({
      category: activeCategory,
      page,
      query: searchQuery,
    });
  }

  const categories =
    (await sanityFetch<BlogCategory[]>({
      query: categoriesQuery,
      tags: ["sanity:category"],
    })) || [];

  if (activeCategory || searchQuery) {
    const search = toSanitySearchPattern(searchQuery);
    const [recentPosts, totalRecentPosts, settings] = await Promise.all([
      sanityFetch<BlogPost[]>({
        query: filteredPostsQuery,
        params: {
          category: activeCategory,
          search,
          start: (page - 1) * POSTS_PER_PAGE,
          end: page * POSTS_PER_PAGE,
        },
        tags: ["sanity:post"],
      }),
      sanityFetch<number>({
        query: filteredPostsCountQuery,
        params: {
          category: activeCategory,
          search,
        },
        tags: ["sanity:post"],
      }),
      sanityFetch<Partial<BlogSettings>>({
        query: blogSettingsQuery,
        tags: ["sanity:blogSettings", "sanity:post"],
      }),
    ]);

    return {
      configured: true,
      settings: withSettingsDefaults(settings),
      categories,
      heroPost: undefined,
      featuredPosts: [],
      recentPosts: recentPosts || [],
      totalRecentPosts: totalRecentPosts || 0,
      page,
      hasMore: page * POSTS_PER_PAGE < (totalRecentPosts || 0),
      searchQuery,
      activeCategory,
    };
  }

  const [settings, latestPosts] = await Promise.all([
    sanityFetch<Partial<BlogSettings>>({
      query: blogSettingsQuery,
      tags: ["sanity:blogSettings", "sanity:post"],
    }),
    sanityFetch<BlogPost[]>({
      query: latestPostsQuery,
      params: { limit: 6 },
      tags: ["sanity:post"],
    }),
  ]);

  const mergedSettings = withSettingsDefaults(settings);
  const heroPost =
    mergedSettings.heroPost || uniquePosts(latestPosts || [])[0] || null;

  const featuredPosts = uniquePosts([
    ...(mergedSettings.featuredPosts || []),
    ...((latestPosts || []).filter((post) => post._id !== heroPost?._id)),
  ])
    .filter((post) => post._id !== heroPost?._id)
    .slice(0, 3);

  const excludeIds = [heroPost?._id, ...featuredPosts.map((post) => post._id)].filter(
    Boolean,
  ) as string[];

  const [recentPosts, totalRecentPosts] = await Promise.all([
    sanityFetch<BlogPost[]>({
      query: recentPostsQuery,
      params: {
        excludeIds,
        start: (page - 1) * POSTS_PER_PAGE,
        end: page * POSTS_PER_PAGE,
      },
      tags: ["sanity:post"],
    }),
    sanityFetch<number>({
      query: recentPostsCountQuery,
      params: {
        excludeIds,
      },
      tags: ["sanity:post"],
    }),
  ]);

  return {
    configured: true,
    settings: mergedSettings,
    categories,
    heroPost,
    featuredPosts,
    recentPosts: recentPosts || [],
    totalRecentPosts: totalRecentPosts || 0,
    page,
    hasMore: page * POSTS_PER_PAGE < (totalRecentPosts || 0),
    searchQuery,
    activeCategory,
  };
}

export async function getBlogPostPageData(slug: string): Promise<BlogPostPageData> {
  if (!isSanityConfigured()) {
    const sorted = [...samplePosts].sort(comparePosts);
    const post = sorted.find((entry) => entry.slug === slug) || null;
    const relatedPosts = sorted
      .filter(
        (entry) =>
          entry.slug !== slug &&
          entry.category?.slug === post?.category?.slug,
      )
      .slice(0, 3);

    return {
      configured: false,
      post,
      settings: sampleSettings,
      relatedPosts,
    };
  }

  const [post, settings] = await Promise.all([
    sanityFetch<BlogPost>({
      query: postBySlugQuery,
      params: { slug },
      tags: ["sanity:post"],
    }),
    sanityFetch<Partial<BlogSettings>>({
      query: blogSettingsQuery,
      tags: ["sanity:blogSettings", "sanity:post"],
    }),
  ]);

  if (!post) {
    return {
      configured: true,
      post: null,
      settings: withSettingsDefaults(settings),
      relatedPosts: [],
    };
  }

  const relatedPosts =
    (await sanityFetch<BlogPost[]>({
      query: relatedPostsQuery,
      params: {
        slug,
        category: post.category?.slug || "",
      },
      tags: ["sanity:post"],
    })) || [];

  return {
    configured: true,
    post,
    settings: withSettingsDefaults(settings),
    relatedPosts,
  };
}
