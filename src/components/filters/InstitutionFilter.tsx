import { INSTITUTION_LABELS } from "@/lib/labels";

export function InstitutionFilter({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="filter-institution" className="font-mono text-xs uppercase tracking-wider text-ink-400">
        Institution
      </label>
      <select
        id="filter-institution"
        name="institution"
        defaultValue={selected ?? ""}
        className="border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-economie focus:border-accent-economie transition appearance-none cursor-pointer"
      >
        <option value="">Toutes</option>
        {Object.entries(INSTITUTION_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
