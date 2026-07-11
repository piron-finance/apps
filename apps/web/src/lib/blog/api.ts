/**
 * Thin fetch helper for the backend blog API. The public site only reads
 * published content, so no auth is needed here. Responses are cached with ISR
 * (revalidate) so the site stays fast/static and refreshes shortly after a
 * marketing publish — no redeploy required.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3008/api/v1"
    : "https://piron-backend-production.up.railway.app/api/v1");

/** Shape returned by the backend BlogService.toResponse(). */
export type ApiBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  category: { slug: string; title: string } | null;
  author: { name: string; role: string | null } | null;
  coverImage: { url: string; alt: string } | null;
  isHero: boolean;
  isFeatured: boolean;
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  socialImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

async function getJson<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Backend unreachable — degrade to an empty blog rather than crashing the site.
    return null;
  }
}

export function fetchPublishedPosts() {
  return getJson<ApiBlogPost[]>("/blog/posts");
}

export function fetchPostBySlug(slug: string) {
  return getJson<ApiBlogPost>(`/blog/posts/${encodeURIComponent(slug)}`);
}
