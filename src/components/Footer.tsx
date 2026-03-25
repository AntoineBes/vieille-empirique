export function Footer() {
  return (
    <footer className="divider mt-20">
      <div className="container-wide py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marque */}
          <div>
            <p className="font-serif font-semibold mb-2">Veille Empirique</p>
            <p className="text-sm text-ink-500 leading-relaxed">
              Agrégateur de métadonnées de publications officielles françaises.
              Sources ouvertes, données publiques.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-3">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="link-subtle">Accueil</a></li>
              <li><a href="/documents" className="link-subtle">Documents</a></li>
              <li><a href="/statistiques" className="link-subtle">Statistiques</a></li>
              <li><a href="/api/documents" className="link-subtle font-mono text-xs">API publique</a></li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-3">Sources officielles</p>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.legifrance.gouv.fr" target="_blank" rel="noopener noreferrer" className="link-subtle">Légifrance</a></li>
              <li><a href="https://www.insee.fr" target="_blank" rel="noopener noreferrer" className="link-subtle">INSEE</a></li>
              <li><a href="https://www.banque-france.fr" target="_blank" rel="noopener noreferrer" className="link-subtle">Banque de France</a></li>
              <li><a href="https://www.data.gouv.fr" target="_blank" rel="noopener noreferrer" className="link-subtle">data.gouv.fr</a></li>
              <li><a href="https://www.oecd.org" target="_blank" rel="noopener noreferrer" className="link-subtle">OCDE</a></li>
            </ul>
          </div>
        </div>

        <div className="divider mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-400">
            Aucun contenu reproduit — métadonnées et liens vers les sources officielles uniquement.
          </p>
          <div className="flex gap-4 text-xs text-ink-400">
            <a href="/mentions-legales" className="link-subtle">Mentions légales</a>
            <a href="/politique-confidentialite" className="link-subtle">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
