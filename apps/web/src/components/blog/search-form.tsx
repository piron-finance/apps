type SearchFormProps = {
  activeCategory: string;
  searchQuery: string;
};

export function SearchForm({ activeCategory, searchQuery }: SearchFormProps) {
  return (
    <form action="/blog" className="flex items-center gap-3 rounded-full border border-border bg-surface-card px-5 py-3">
      {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={searchQuery}
        placeholder="Search articles"
        className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-tertiary"
      />
      <button
        type="submit"
        className="rounded-full bg-surface-card px-3 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-white/15 hover:text-content-primary"
      >
        Search
      </button>
    </form>
  );
}
