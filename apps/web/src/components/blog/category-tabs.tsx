import Link from "next/link";
import type { BlogCategory } from "@/lib/blog/types";

type CategoryTabsProps = {
  activeCategory: string;
  categories: BlogCategory[];
  searchQuery: string;
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
}: CategoryTabsProps) {
  const items = [{ title: "All", slug: "" }, ...categories];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((category) => {
        const isActive = activeCategory === category.slug;

        return (
          <Link
            key={category.slug || "all"}
            href={makeHref(category.slug, searchQuery)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              isActive
                ? "border-accent bg-accent-subtle text-accent"
                : "border-border text-content-secondary hover:border-border-hover hover:text-content-primary"
            }`}
          >
            {category.title}
          </Link>
        );
      })}
    </div>
  );
}
