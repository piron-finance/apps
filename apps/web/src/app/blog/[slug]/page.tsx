import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/footer";
import { BlogCTA } from "@/components/blog/blog-cta";
import { PostCard } from "@/components/blog/post-card";
import { PostImage } from "@/components/blog/post-image";
import { RichText } from "@/components/blog/rich-text";
import { ShareButtons } from "@/components/blog/share-buttons";
import { getBlogPostPageData } from "@/lib/blog/data";
import { absoluteUrl } from "@/lib/site";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { post } = await getBlogPostPageData(params.slug);

  if (!post) {
    return {
      title: "Article not found | Piron Finance",
    };
  }

  const title = post.socialTitle || post.seoTitle || post.title;
  const description =
    post.socialDescription || post.seoDescription || post.excerpt;
  const image =
    post.socialImage?.asset?.url || post.image?.asset?.url || undefined;
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    title: `${title} | Piron Finance`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: image ? [{ url: image, alt: post.socialImage?.alt || post.image?.alt || title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { post, relatedPosts, settings } = await getBlogPostPageData(params.slug);

  if (!post) {
    notFound();
  }

  const articleUrl = absoluteUrl(`/blog/${post.slug}`);

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
        <section className="relative overflow-hidden pt-28 pb-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 30% 0%, rgba(0,196,140,0.14) 0%, transparent 60%)",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6">
            <Link
              href="/blog"
              className="text-sm text-white/45 transition-colors hover:text-white"
            >
              ← Back to blog
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/45">
              {post.category?.title ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/70">
                  {post.category.title}
                </span>
              ) : null}
              <span>{formatDate(post.publishedAt)}</span>
              {post.author?.name ? <span>By {post.author.name}</span> : null}
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/55 md:text-lg">
              {post.excerpt}
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <PostImage
              image={post.image}
              title={post.title}
              category={post.category?.title}
              priority
              intrinsic
            />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
              <article className="space-y-8">
                <RichText value={post.body} />
              </article>

              <aside className="lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-white/10 lg:pl-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Share
                </p>
                <div className="mt-4">
                  <ShareButtons
                    title={post.title}
                    url={articleUrl}
                    xCopy={post.xCopy || post.socialDescription || post.excerpt}
                  />
                </div>
              </aside>
            </div>

            {relatedPosts.length > 0 ? (
              <section>
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                    Continue reading
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    Related posts
                  </h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <PostCard key={relatedPost._id} post={relatedPost} />
                  ))}
                </div>
              </section>
            ) : null}

            <BlogCTA settings={settings} />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
