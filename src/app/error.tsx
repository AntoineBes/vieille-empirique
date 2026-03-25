"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-content py-20 text-center">
      <p className="font-mono text-6xl text-ink-300 mb-4">Erreur</p>
      <h1 className="font-serif text-heading text-ink-900 mb-2">Une erreur est survenue</h1>
      <p className="text-sm text-ink-500 mb-8">
        Le service est temporairement indisponible. Réessayez dans quelques instants.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="bg-ink-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-ink-800 transition"
        >
          Réessayer
        </button>
        <a href="/" className="text-sm text-accent-economie hover:underline">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
