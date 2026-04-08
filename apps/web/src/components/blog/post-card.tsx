import Link from "next/link";
import type { BlogPost } from "@/lib/blog/types";
import { PostImage } from "@/components/blog/post-image";

type PostCardProps = {
  post: BlogPost;
  variant?: "feature" | "grid";
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function PostCard({ post, variant = "grid" }: PostCardProps) {
  if (variant === "feature") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/45">
            {post.category?.title ? (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/70">
                {post.category.title}
              </span>
            ) : null}
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white transition-colors group-hover:text-[#8CF6D3] md:text-4xl">
            {post.title}
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/55">
            {post.excerpt}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors group-hover:text-white">
            Read article
            <span aria-hidden="true">→</span>
          </div>
        </div>

        <div className="relative min-h-[280px] lg:min-h-[360px]">
          <PostImage
            image={post.image}
            title={post.title}
            category={post.category?.title}
            priority
            className="h-full w-full"
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block"
    >
      <div className="relative aspect-[16/10]">
        <PostImage
          image={post.image}
          title={post.title}
          category={post.category?.title}
          className="h-full w-full"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/45">
        {post.category?.title ? (
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/70">
            {post.category.title}
          </span>
        ) : null}
        <span>{formatDate(post.publishedAt)}</span>
      </div>

      <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-[#8CF6D3]">
        {post.title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-white/55">
        {post.excerpt}
      </p>
    </Link>
  );
}
