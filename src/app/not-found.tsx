export default function NotFound() {
  return (
    <div className="container-content py-20 text-center">
      <p className="font-mono text-6xl text-ink-300 mb-4">404</p>
      <h1 className="font-serif text-heading text-ink-900 mb-2">Page introuvable</h1>
      <p className="text-sm text-ink-500 mb-8">
        Le document ou la page que vous cherchez n'existe pas ou a été déplacé.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 bg-ink-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-ink-800 transition"
      >
        Retour à l'accueil
      </a>
    </div>
  );
}
