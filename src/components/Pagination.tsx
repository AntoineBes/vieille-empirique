interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({ page, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(targetPage: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }

  // Calcul des pages à afficher (fenêtre glissante)
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      {/* Précédent */}
      {page > 1 ? (
        <a
          href={buildUrl(page - 1)}
          className="px-3 py-2 text-sm text-ink-600 hover:text-ink-900 border border-ink-200 rounded-md hover:bg-ink-50 transition"
          aria-label="Page précédente"
        >
          Précédent
        </a>
      ) : (
        <span className="px-3 py-2 text-sm text-ink-300 border border-ink-100 rounded-md cursor-not-allowed">
          Précédent
        </span>
      )}

      {/* Numéros de page */}
      {start > 1 && (
        <>
          <a href={buildUrl(1)} className="px-3 py-2 text-sm text-ink-600 hover:text-ink-900 rounded-md hover:bg-ink-50 transition">1</a>
          {start > 2 && <span className="px-2 text-ink-400">...</span>}
        </>
      )}

      {pages.map((p) => (
        <a
          key={p}
          href={buildUrl(p)}
          className={`px-3 py-2 text-sm rounded-md transition ${
            p === page
              ? "bg-ink-900 text-white font-medium"
              : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
          }`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </a>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-ink-400">...</span>}
          <a href={buildUrl(totalPages)} className="px-3 py-2 text-sm text-ink-600 hover:text-ink-900 rounded-md hover:bg-ink-50 transition">{totalPages}</a>
        </>
      )}

      {/* Suivant */}
      {page < totalPages ? (
        <a
          href={buildUrl(page + 1)}
          className="px-3 py-2 text-sm text-ink-600 hover:text-ink-900 border border-ink-200 rounded-md hover:bg-ink-50 transition"
          aria-label="Page suivante"
        >
          Suivant
        </a>
      ) : (
        <span className="px-3 py-2 text-sm text-ink-300 border border-ink-100 rounded-md cursor-not-allowed">
          Suivant
        </span>
      )}
    </nav>
  );
}
