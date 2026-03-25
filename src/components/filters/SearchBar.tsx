"use client";

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-52">
      <label htmlFor="search-q" className="font-mono text-xs uppercase tracking-wider text-ink-400">
        Recherche
      </label>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          id="search-q"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Mot-clé dans le titre..."
          maxLength={200}
          className="w-full border border-ink-200 rounded-md pl-9 pr-3 py-2 text-sm bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-accent-economie focus:border-accent-economie transition"
        />
      </div>
    </div>
  );
}
