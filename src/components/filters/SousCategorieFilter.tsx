"use client";

import { SOUS_CATEGORIE_LABELS, SOUS_CATEGORIES_PAR_CATEGORIE } from "@/lib/labels";

interface Props {
  selected?: string;
  categorieParente?: string;
}

export function SousCategorieFilter({ selected, categorieParente }: Props) {
  // Si une catégorie parente est sélectionnée, ne montrer que ses sous-catégories
  const entries = categorieParente && SOUS_CATEGORIES_PAR_CATEGORIE[categorieParente]
    ? SOUS_CATEGORIES_PAR_CATEGORIE[categorieParente].map((key) => [key, SOUS_CATEGORIE_LABELS[key] ?? key] as const)
    : Object.entries(SOUS_CATEGORIE_LABELS);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="filter-sous-categorie" className="font-mono text-xs uppercase tracking-wider text-ink-400">
        Sous-catégorie
      </label>
      <select
        id="filter-sous-categorie"
        name="sous_categorie"
        defaultValue={selected ?? ""}
        className="border border-ink-200 rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-economie focus:border-accent-economie transition appearance-none cursor-pointer"
      >
        <option value="">Toutes</option>
        {entries.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
