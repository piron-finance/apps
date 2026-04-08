type SearchFormProps = {
  activeCategory: string;
  searchQuery: string;
};

export function SearchForm({ activeCategory, searchQuery }: SearchFormProps) {
  return (
    <form action="/blog" className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
      {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={searchQuery}
        placeholder="Search articles"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
      >
        Search
      </button>
    </form>
  );
}
