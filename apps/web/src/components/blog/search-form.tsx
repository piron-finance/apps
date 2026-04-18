type SearchFormProps = {
  activeCategory: string;
  searchQuery: string;
  variant?: "light" | "dark";
};

export function SearchForm({ activeCategory, searchQuery, variant = "light" }: SearchFormProps) {
  const isDark = variant === "dark";

  return (
    <form
      action="/blog"
      className={`flex items-center gap-3 rounded-full px-5 py-3 ${
        isDark
          ? "border border-white/[0.08] bg-white/[0.04]"
          : "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={searchQuery}
        placeholder="Search articles"
        className={`w-full bg-transparent text-sm outline-none ${
          isDark
            ? "text-white placeholder:text-white/30"
            : "text-content-primary placeholder:text-content-tertiary"
        }`}
      />
      <button
        type="submit"
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          isDark
            ? "bg-white/[0.08] text-white/60 hover:text-white"
            : "bg-surface-warm text-content-secondary hover:text-content-primary"
        }`}
      >
        Search
      </button>
    </form>
  );
}
