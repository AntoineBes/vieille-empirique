/**
 * Page d'accueil — ISR toutes les heures
 * Design éditorial inspiré d'empirisme-citoyen.fr
 */

import { prisma } from "@/lib/prisma";
import { DocumentCard } from "@/components/DocumentCard";
import { StatsBadge } from "@/components/StatsBadge";
import { INSTITUTION_LABELS, formatNumber } from "@/lib/labels";

export const revalidate = 3600;

async function getHomeData() {
  const [recent, countsByCategorie, countsByInstitution, totalDocuments, lastSync] = await Promise.all([
    prisma.document.findMany({
      orderBy: { date_publication: "desc" },
      take: 15,
    }),
    prisma.document.groupBy({
      by: ["categorie"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.document.groupBy({
      by: ["institution"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.document.count(),
    prisma.syncLog.findFirst({
      where: { statut: "OK" },
      orderBy: { termine_le: "desc" },
      select: { termine_le: true, institution: true },
    }),
  ]);

  return { recent, countsByCategorie, countsByInstitution, totalDocuments, lastSync };
}

export default async function HomePage() {
  const { recent, countsByCategorie, countsByInstitution, totalDocuments, lastSync } = await getHomeData();

  return (
    <div>
      {/* Hero éditorial */}
      <section className="bg-white border-b border-ink-200">
        <div className="container-wide py-16 md:py-24">
          <h1 className="font-serif text-display text-ink-900 text-balance max-w-2xl">
            Veille Empirique
          </h1>
          <p className="font-serif text-lg italic text-ink-500 mt-3">
            pour y voir plus clair
          </p>
          <p className="text-ink-600 mt-6 max-w-xl leading-relaxed">
            Agrégateur de métadonnées de publications officielles françaises.
            Lois, décrets, statistiques, rapports — indexés quotidiennement
            depuis les APIs publiques.
          </p>

          {/* Compteur global */}
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="text-3xl font-serif font-bold text-ink-900">{formatNumber(totalDocuments)}</p>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mt-1">documents indexés</p>
            </div>
            {lastSync?.termine_le && (
              <div className="pl-6 border-l border-ink-200">
                <p className="font-mono text-xs text-ink-400">Dernière synchronisation</p>
                <p className="text-sm text-ink-600 mt-0.5">
                  {new Date(lastSync.termine_le).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats par catégorie */}
      <section className="container-wide py-12">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-5">Par catégorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {countsByCategorie.map((c) => (
            <StatsBadge key={c.categorie} label={c.categorie} count={c._count.id} />
          ))}
        </div>
      </section>

      {/* Institutions */}
      <section className="container-wide pb-10">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-4">Par institution</h2>
        <div className="flex flex-wrap gap-2">
          {countsByInstitution.map((i) => (
            <a
              key={i.institution}
              href={`/documents?institution=${i.institution}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-200 rounded-md text-sm text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition"
            >
              {INSTITUTION_LABELS[i.institution] ?? i.institution}
              <span className="font-mono text-xs text-ink-400">({formatNumber(i._count.id)})</span>
            </a>
          ))}
        </div>
      </section>

      {/* Documents récents */}
      <section className="container-wide pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-heading text-ink-900">Publications récentes</h2>
          <a href="/documents" className="text-sm text-accent-economie hover:underline inline-flex items-center gap-1">
            Voir tout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

        <div className="divider">
          {recent.map((doc, index) => (
            <DocumentCard key={doc.id} document={doc} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
