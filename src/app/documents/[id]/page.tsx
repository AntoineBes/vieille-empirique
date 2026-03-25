/**
 * Page détail d'un document — SSG avec fallback ISR
 */

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CATEGORIE_LABELS,
  CATEGORIE_BADGE_CLASS,
  INSTITUTION_LABELS,
  TYPE_LABELS,
  SOUS_CATEGORIE_LABELS,
  formatDate,
} from "@/lib/labels";

export const revalidate = 86400; // 24h
export const maxDuration = 30;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return { title: "Document non trouvé" };
  return {
    title: doc.titre,
    description: doc.resume ?? `${INSTITUTION_LABELS[doc.institution]} — ${TYPE_LABELS[doc.type]}`,
  };
}

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) notFound();

  const badgeClass = CATEGORIE_BADGE_CLASS[doc.categorie] ?? "badge";

  // Trouver des documents similaires (même catégorie, hors celui-ci)
  const related = await prisma.document.findMany({
    where: {
      categorie: doc.categorie,
      id: { not: doc.id },
    },
    orderBy: { date_publication: "desc" },
    take: 5,
    select: { id: true, titre: true, institution: true, date_publication: true },
  });

  return (
    <div className="container-wide py-10">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Fil d'Ariane">
          <a href="/" className="link-subtle font-mono text-xs">Accueil</a>
          <span className="text-ink-300">/</span>
          <a href="/documents" className="link-subtle font-mono text-xs">Documents</a>
          <span className="text-ink-300">/</span>
          <span className="font-mono text-xs text-ink-400 truncate max-w-48">
            {INSTITUTION_LABELS[doc.institution]}
          </span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={badgeClass}>
            {CATEGORIE_LABELS[doc.categorie] ?? doc.categorie}
          </span>
          {doc.sous_categorie && (
            <span className="font-mono text-xs text-ink-500">
              {SOUS_CATEGORIE_LABELS[doc.sous_categorie] ?? doc.sous_categorie}
            </span>
          )}
        </div>

        {/* Titre */}
        <h1 className="font-serif text-display text-ink-900 text-balance mb-6">
          {doc.titre}
        </h1>

        {/* Métadonnées */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 pb-6 border-b border-ink-200">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
            {INSTITUTION_LABELS[doc.institution]}
          </span>
          <span>{TYPE_LABELS[doc.type] ?? doc.type}</span>
          <time className="date-label" dateTime={new Date(doc.date_publication).toISOString()}>
            {formatDate(doc.date_publication, "long")}
          </time>
        </div>

        {/* Résumé */}
        {doc.resume && (
          <div className="mt-8 mb-8">
            <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-3">Résumé</h2>
            <p className="text-ink-700 leading-relaxed text-balance">{doc.resume}</p>
          </div>
        )}

        {/* Lien source */}
        <div className="mt-8">
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-md font-medium text-sm hover:bg-ink-800 transition"
          >
            Consulter la source officielle
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>

        {/* Métadonnées techniques */}
        <div className="mt-12 pt-6 border-t border-ink-200">
          <p className="font-mono text-xs text-ink-400">
            Indexé le {formatDate(doc.cree_le, "long")} ·
            Mis à jour le {formatDate(doc.mis_a_jour_le, "long")} ·
            Source : {doc.institution} · ID : {doc.source_id}
          </p>
        </div>

        {/* Documents similaires */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-ink-200">
            <h2 className="font-serif text-heading text-ink-900 mb-4">Documents similaires</h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.id}>
                  <a href={`/documents/${r.id}`} className="group flex items-start justify-between gap-4">
                    <span className="text-sm text-ink-700 group-hover:text-accent-economie transition line-clamp-1">
                      {r.titre}
                    </span>
                    <time className="date-label shrink-0" dateTime={new Date(r.date_publication).toISOString()}>
                      {formatDate(r.date_publication)}
                    </time>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
