type SearchFormProps = {
  activeCategory: string;
  searchQuery: string;
};

export function SearchForm({ activeCategory, searchQuery }: SearchFormProps) {
  return (
    <form action="/blog" className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
        className="rounded-full bg-surface-warm px-3 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:text-content-primary"
      >
        Search
      </button>
    </form>
  );
}
