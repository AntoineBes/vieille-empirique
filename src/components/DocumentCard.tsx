import type { Document } from "@prisma/client";
import {
  CATEGORIE_LABELS,
  CATEGORIE_BADGE_CLASS,
  INSTITUTION_LABELS,
  TYPE_LABELS,
  formatDate,
} from "@/lib/labels";

interface DocumentCardProps {
  document: Document;
  index?: number;
}

export function DocumentCard({ document: doc, index }: DocumentCardProps) {
  const badgeClass = CATEGORIE_BADGE_CLASS[doc.categorie] ?? "badge";
  const meta = doc.metadata as Record<string, unknown> | null;
  const isSyncDate = meta?.date_type === "sync";
  const datePrefix = isSyncDate ? "Indexé le " : "";

  return (
    <article className="card rounded-none border-x-0 border-t-0 py-4 sm:py-5 px-0 group">
      <div className="flex items-start gap-3 sm:gap-4 pr-2 sm:pr-4">
        {/* Numéro séquentiel */}
        {typeof index === "number" && (
          <span className="num-badge mt-1 shrink-0 w-6 text-right hidden sm:block">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}

        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            <span className={badgeClass}>
              {CATEGORIE_LABELS[doc.categorie] ?? doc.categorie}
            </span>
            <span className="font-mono text-xs text-ink-400 truncate">
              {INSTITUTION_LABELS[doc.institution] ?? doc.institution}
            </span>
            <span className="text-ink-300 hidden sm:inline">·</span>
            <span className="font-mono text-xs text-ink-400 hidden sm:inline">
              {TYPE_LABELS[doc.type] ?? doc.type}
            </span>
          </div>

          {/* Titre */}
          <a
            href={`/documents/${doc.id}`}
            className="group-hover:text-accent-economie transition-colors duration-200"
          >
            <h3 className="font-serif font-semibold text-sm sm:text-base text-ink-900 leading-snug line-clamp-2">
              {doc.titre}
            </h3>
          </a>

          {/* Résumé — masqué sur mobile */}
          {doc.resume && (
            <p className="text-sm text-ink-500 mt-1.5 leading-relaxed line-clamp-2 hidden sm:block">
              {doc.resume}
            </p>
          )}

          {/* Date + lien source — en ligne sous le titre sur mobile */}
          <div className="flex items-center gap-3 mt-2 sm:hidden">
            <time className="date-label" dateTime={new Date(doc.date_publication).toISOString()}>
              {datePrefix}{formatDate(doc.date_publication)}
            </time>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-droit hover:underline inline-flex items-center gap-1"
              aria-label={`Consulter la source officielle : ${doc.titre}`}
            >
              Source
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>
        </div>

        {/* Date + lien source — à droite sur desktop */}
        <div className="text-right shrink-0 hidden sm:flex flex-col items-end gap-2 ml-4">
          <time className="date-label" dateTime={new Date(doc.date_publication).toISOString()}>
            {formatDate(doc.date_publication)}
          </time>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-droit hover:underline inline-flex items-center gap-1"
            aria-label={`Consulter la source officielle : ${doc.titre}`}
          >
            Source
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
