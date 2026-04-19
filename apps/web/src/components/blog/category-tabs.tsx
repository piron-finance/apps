import Link from "next/link";
import type { BlogCategory } from "@/lib/blog/types";

type CategoryTabsProps = {
  activeCategory: string;
  categories: BlogCategory[];
  searchQuery: string;
  variant?: "light" | "dark";
};

function makeHref(category: string, searchQuery: string) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export function CategoryTabs({
  activeCategory,
  categories,
  searchQuery,
  variant = "light",
}: CategoryTabsProps) {
  const items = [{ title: "All", slug: "" }, ...categories];
  const isDark = variant === "dark";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((category) => {
        const isActive = activeCategory === category.slug;

        return (
          <Link
            key={category.slug || "all"}
            href={makeHref(category.slug, searchQuery)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              isActive
                ? isDark
                  ? "bg-white/[0.12] font-medium text-white"
                  : "bg-accent/10 font-medium text-accent"
                : isDark
                  ? "border border-white/[0.08] text-white/50 hover:text-white/80"
                  : "bg-white text-content-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:text-content-primary"
            }`}
          >
            {category.title}
          </Link>
        );
      })}
    </div>
  );
}
