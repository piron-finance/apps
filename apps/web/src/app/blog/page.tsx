import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/footer";
import { CategoryTabs } from "@/components/blog/category-tabs";
import { SearchForm } from "@/components/blog/search-form";
import { PostCard } from "@/components/blog/post-card";
import { BlogCTA } from "@/components/blog/blog-cta";
import { getBlogIndexData } from "@/lib/blog/data";

export const metadata: Metadata = {
  title: "Blog | Piron Finance",
  description:
    "Announcements, product notes, and perspectives from Piron Finance.",
};

type BlogPageProps = {
  searchParams?: {
    category?: string;
    page?: string;
    q?: string;
  };
};

function buildLoadMoreHref({
  category,
  page,
  query,
}: {
  category: string;
  page: number;
  query: string;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (query) {
    params.set("q", query);
  }

  params.set("page", String(page + 1));
  return `/blog?${params.toString()}`;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const activeCategory = searchParams?.category || "";
  const searchQuery = searchParams?.q || "";
  const page = Number.parseInt(searchParams?.page || "1", 10) || 1;
  const data = await getBlogIndexData({
    category: activeCategory,
    page,
    query: searchQuery,
  });

  const showEditorialSections = !data.activeCategory && !data.searchQuery;
  const resultsTitle = data.activeCategory || data.searchQuery ? "Results" : "Most recent";

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 90, 90, 0.35) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0, 90, 90, 0.35) 0%, transparent 50%),
          black
        `,
      }}
    >
      <Header />

      <div className="relative overflow-x-hidden">
        <section className="relative overflow-hidden pt-28 pb-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 30% 0%, rgba(0,196,140,0.14) 0%, transparent 60%)",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00C48C]" />
                  {data.settings.title}
                </p>
                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                  Blog
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
                  {data.settings.description}
                </p>
                {!data.configured ? (
                  <p className="mt-4 text-sm text-white/40">
                    Showing seeded content until Sanity is connected.
                  </p>
                ) : null}
              </div>

              <SearchForm activeCategory={data.activeCategory} searchQuery={data.searchQuery} />
            </div>

            <div className="mt-10">
              <CategoryTabs
                activeCategory={data.activeCategory}
                categories={data.categories}
                searchQuery={data.searchQuery}
              />
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6">
            {showEditorialSections && data.heroPost ? (
              <div>
                <PostCard post={data.heroPost} variant="feature" />
              </div>
            ) : null}

            {showEditorialSections && data.featuredPosts.length > 0 ? (
              <section>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                      Editorial picks
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      Featured
                    </h2>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  {data.featuredPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                    Archive
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    {resultsTitle}
                  </h2>
                </div>

                {(data.activeCategory || data.searchQuery) && data.totalRecentPosts > 0 ? (
                  <p className="text-sm text-white/45">
                    {data.totalRecentPosts} article{data.totalRecentPosts === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>

              {data.recentPosts.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-3">
                  {data.recentPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-white/55">
                  No articles matched this filter yet.
                </div>
              )}
            </section>

            {data.hasMore ? (
              <div className="flex justify-center">
                <Link
                  href={buildLoadMoreHref({
                    category: data.activeCategory,
                    page: data.page,
                    query: data.searchQuery,
                  })}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                >
                  Load more articles
                </Link>
              </div>
            ) : null}

            <BlogCTA settings={data.settings} />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
