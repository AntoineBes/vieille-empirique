import { CATEGORIE_LABELS, CATEGORIE_COLORS, formatNumber } from "@/lib/labels";

interface StatsBadgeProps {
  label: string;
  count: number;
}

export function StatsBadge({ label, count }: StatsBadgeProps) {
  const color = CATEGORIE_COLORS[label] ?? "#8d856b";
  const displayLabel = CATEGORIE_LABELS[label] ?? label;

  return (
    <a
      href={`/documents?categorie=${label}`}
      className="card rounded-lg p-4 text-center group"
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
    >
      <p className="text-2xl font-serif font-bold text-ink-900 group-hover:text-accent-economie transition-colors">
        {formatNumber(count)}
      </p>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-500 mt-1">
        {displayLabel}
      </p>
    </a>
  );
}
