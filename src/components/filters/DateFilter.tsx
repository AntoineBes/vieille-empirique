export function DateFilter({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="filter-depuis" className="font-mono text-xs uppercase tracking-wider text-ink-400">
        Depuis
      </label>
      <input
        id="filter-depuis"
        type="date"
        name="depuis"
        defaultValue={defaultValue}
        className="border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-economie focus:border-accent-economie transition"
      />
    </div>
  );
}
