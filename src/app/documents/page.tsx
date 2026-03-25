/**
 * Page de recherche et filtrage — ISR 30 minutes
 * Filtres complets : catégorie, sous-catégorie, institution, type, plage de dates, recherche texte
 */

import { prisma } from "@/lib/prisma";
import { DocumentCard } from "@/components/DocumentCard";
import { FilterBar } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/Pagination";
import { formatNumber } from "@/lib/labels";
import type { Categorie, Institution, TypeDocument, SousCategorie } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const revalidate = 1800;
export const maxDuration = 30;

interface SearchParams {
  q?: string;
  categorie?: string;
  institution?: string;
  type?: string;
  sous_categorie?: string;
  depuis?: string;
  page?: string;
}

const PAGE_SIZE = 25;

async function searchDocuments(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.DocumentWhereInput = {};

  if (params.q) {
    where.titre = { contains: params.q, mode: "insensitive" };
  }
  if (params.categorie) {
    where.categorie = params.categorie as Categorie;
  }
  if (params.institution) {
    where.institution = params.institution as Institution;
  }
  if (params.type) {
    where.type = params.type as TypeDocument;
  }
  if (params.sous_categorie) {
    where.sous_categorie = params.sous_categorie as SousCategorie;
  }
  if (params.depuis) {
    const date = new Date(params.depuis);
    if (!isNaN(date.getTime())) {
      where.date_publication = { gte: date };
    }
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { date_publication: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.document.count({ where }),
  ]);

  return { documents, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { documents, total, page, totalPages } = await searchDocuments(searchParams);

  const hasFilters = Object.values(searchParams).some((v) => v && v.trim());

  return (
    <div className="container-wide px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="font-serif text-heading text-ink-900 mb-2">Documents</h1>
      <p className="text-sm text-ink-500 mb-6 sm:mb-8">
        Explorez les publications officielles françaises par catégorie, institution, type ou date.
      </p>

      {/* Barre de filtres complète */}
      <FilterBar searchParams={searchParams as Record<string, string | undefined>} />

      {/* Résultats */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-ink-700">{formatNumber(total)}</span>{" "}
          document{total > 1 ? "s" : ""}{" "}
          {hasFilters ? "trouvé" : "indexé"}{total > 1 ? "s" : ""}
          {page > 1 && (
            <span className="text-ink-400"> — page {page}/{totalPages}</span>
          )}
        </p>
      </div>

      {/* Liste des documents */}
      {documents.length > 0 ? (
        <div className="divider">
          {documents.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              index={(page - 1) * PAGE_SIZE + index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="font-serif text-lg text-ink-500">Aucun document trouvé</p>
          <p className="text-sm text-ink-400 mt-2">
            Essayez d'ajuster vos filtres ou{" "}
            <a href="/documents" className="text-accent-economie hover:underline">
              réinitialisez la recherche
            </a>
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        baseUrl="/documents"
        searchParams={searchParams as Record<string, string | undefined>}
      />
    </div>
  );
}
