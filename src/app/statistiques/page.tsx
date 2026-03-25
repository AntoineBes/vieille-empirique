/**
 * Page statistiques — ISR 1 heure
 * Vue d'ensemble de la couverture et de la santé des synchronisations
 */

import { prisma } from "@/lib/prisma";
import {
  CATEGORIE_LABELS,
  CATEGORIE_COLORS,
  INSTITUTION_LABELS,
  TYPE_LABELS,
  SOUS_CATEGORIE_LABELS,
  formatNumber,
  formatDate,
} from "@/lib/labels";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistiques",
  description: "Couverture et santé des synchronisations de la veille empirique",
};

export const revalidate = 3600;
export const maxDuration = 30;

async function getStats() {
  try {
    const [
      totalDocuments,
      byCategorie,
      byInstitution,
      byType,
      bySousCategorie,
      recentSyncs,
      oldestDoc,
      newestDoc,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.groupBy({ by: ["categorie"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.document.groupBy({ by: ["institution"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.document.groupBy({ by: ["type"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.document.groupBy({ by: ["sous_categorie"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, where: { sous_categorie: { not: null } } }),
      prisma.syncLog.findMany({ orderBy: { demarre_le: "desc" }, take: 20 }),
      prisma.document.findFirst({ orderBy: { date_publication: "asc" }, select: { date_publication: true } }),
      prisma.document.findFirst({ orderBy: { date_publication: "desc" }, select: { date_publication: true } }),
    ]);

    return { totalDocuments, byCategorie, byInstitution, byType, bySousCategorie, recentSyncs, oldestDoc, newestDoc };
  } catch (err) {
    console.error("[Statistiques] Erreur DB:", err);
    return { totalDocuments: 0, byCategorie: [], byInstitution: [], byType: [], bySousCategorie: [], recentSyncs: [], oldestDoc: null, newestDoc: null };
  }
}

export default async function StatistiquesPage() {
  const stats = await getStats();

  return (
    <div className="container-wide py-10">
      <h1 className="font-serif text-display text-ink-900 mb-2">Statistiques</h1>
      <p className="text-sm text-ink-500 mb-10">
        Couverture des données et santé des synchronisations.
      </p>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="card rounded-lg p-5">
          <p className="text-3xl font-serif font-bold text-ink-900">{formatNumber(stats.totalDocuments)}</p>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mt-1">Documents</p>
        </div>
        <div className="card rounded-lg p-5">
          <p className="text-3xl font-serif font-bold text-ink-900">{stats.byInstitution.length}</p>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mt-1">Institutions</p>
        </div>
        <div className="card rounded-lg p-5">
          <p className="text-3xl font-serif font-bold text-ink-900">{stats.byCategorie.length}</p>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mt-1">Catégories</p>
        </div>
        <div className="card rounded-lg p-5">
          <p className="text-sm font-mono text-ink-700">
            {stats.oldestDoc ? formatDate(stats.oldestDoc.date_publication, "short") : "—"}
            {" → "}
            {stats.newestDoc ? formatDate(stats.newestDoc.date_publication, "short") : "—"}
          </p>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mt-1">Couverture temporelle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Par catégorie */}
        <section>
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-4">Par catégorie</h2>
          <div className="space-y-2">
            {stats.byCategorie.map((c) => {
              const pct = stats.totalDocuments > 0 ? (c._count.id / stats.totalDocuments) * 100 : 0;
              const color = CATEGORIE_COLORS[c.categorie] ?? "#8d856b";
              return (
                <div key={c.categorie} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-24 text-ink-600">{CATEGORIE_LABELS[c.categorie]}</span>
                  <div className="flex-1 bg-ink-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span className="font-mono text-xs text-ink-500 w-16 text-right">{formatNumber(c._count.id)}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Par institution */}
        <section>
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-4">Par institution</h2>
          <div className="space-y-2">
            {stats.byInstitution.map((i) => {
              const pct = stats.totalDocuments > 0 ? (i._count.id / stats.totalDocuments) * 100 : 0;
              return (
                <div key={i.institution} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-32 text-ink-600 truncate">{INSTITUTION_LABELS[i.institution]}</span>
                  <div className="flex-1 bg-ink-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-ink-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-xs text-ink-500 w-16 text-right">{formatNumber(i._count.id)}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Par type */}
        <section>
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-4">Par type de document</h2>
          <div className="space-y-2">
            {stats.byType.slice(0, 10).map((t) => (
              <div key={t.type} className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-600">{TYPE_LABELS[t.type] ?? t.type}</span>
                <span className="font-mono text-xs text-ink-500">{formatNumber(t._count.id)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Par sous-catégorie */}
        <section>
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-4">Par sous-catégorie</h2>
          <div className="space-y-2">
            {stats.bySousCategorie.slice(0, 10).map((s) => (
              <div key={s.sous_categorie} className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-600">{SOUS_CATEGORIE_LABELS[s.sous_categorie ?? ""] ?? s.sous_categorie}</span>
                <span className="font-mono text-xs text-ink-500">{formatNumber(s._count.id)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Historique des syncs */}
      <section className="mt-12 pt-8 border-t border-ink-200">
        <h2 className="font-serif text-heading text-ink-900 mb-6">Historique des synchronisations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-ink-400 py-3 pr-4">Institution</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-ink-400 py-3 pr-4">Statut</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-ink-400 py-3 pr-4">Trouvés</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-ink-400 py-3 pr-4">Insérés</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-ink-400 py-3 pr-4">MàJ</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-ink-400 py-3 pr-4">Durée</th>
                <th className="text-right font-mono text-xs uppercase tracking-wider text-ink-400 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSyncs.map((sync) => (
                <tr key={sync.id} className="border-b border-ink-100">
                  <td className="py-2.5 pr-4 text-ink-700">{INSTITUTION_LABELS[sync.institution]}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      sync.statut === "OK" ? "bg-green-500" :
                      sync.statut === "PARTIEL" ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <span className="font-mono text-xs">{sync.statut}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{sync.documents_trouves}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{sync.documents_inseres}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{sync.documents_mis_a_jour}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs text-ink-500">{sync.duree_ms ? `${sync.duree_ms}ms` : "—"}</td>
                  <td className="py-2.5 text-right date-label">
                    {sync.demarre_le ? formatDate(sync.demarre_le) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
