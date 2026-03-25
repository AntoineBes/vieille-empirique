import { TYPE_LABELS } from "@/lib/labels";

export function TypeFilter({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="filter-type" className="font-mono text-xs uppercase tracking-wider text-ink-400">
        Type
      </label>
      <select
        id="filter-type"
        name="type"
        defaultValue={selected ?? ""}
        className="border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-economie focus:border-accent-economie transition appearance-none cursor-pointer"
      >
        <option value="">Tous</option>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
