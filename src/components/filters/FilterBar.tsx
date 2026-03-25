"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { InstitutionFilter } from "./InstitutionFilter";
import { TypeFilter } from "./TypeFilter";
import { SousCategorieFilter } from "./SousCategorieFilter";
import { DateFilter } from "./DateFilter";

interface FilterBarProps {
  searchParams: Record<string, string | undefined>;
}

export function FilterBar({ searchParams }: FilterBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value.trim());
      }
    }

    router.push(`/documents?${params.toString()}`);
  }

  function handleReset() {
    router.push("/documents");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink-200 rounded-lg p-5 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SearchBar defaultValue={searchParams.q} />
        <CategoryFilter selected={searchParams.categorie} />
        <SousCategorieFilter
          selected={searchParams.sous_categorie}
          categorieParente={searchParams.categorie}
        />
        <InstitutionFilter selected={searchParams.institution} />
        <TypeFilter selected={searchParams.type} />
        <DateFilter defaultValue={searchParams.depuis} />
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ink-100">
        <button
          type="submit"
          className="bg-ink-900 text-white px-5 py-2 text-sm font-medium rounded-md hover:bg-ink-800 transition"
        >
          Rechercher
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-ink-500 hover:text-ink-700 transition"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </form>
  );
}
