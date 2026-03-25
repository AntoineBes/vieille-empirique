import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegales() {
  return (
    <div className="container-content py-10">
      <h1 className="font-serif text-display text-ink-900 mb-8">Mentions légales</h1>

      <div className="prose prose-ink max-w-none space-y-6 text-sm leading-relaxed text-ink-700">
        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Éditeur</h2>
          <p>
            Veille Empirique est un projet open source d'agrégation de métadonnées
            de publications officielles françaises. Ce service indexe exclusivement
            des métadonnées publiques (titre, date, lien) et ne reproduit aucun contenu protégé.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Hébergement</h2>
          <p>Application hébergée sur Vercel Inc., base de données hébergée par Neon Inc.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Sources des données</h2>
          <p>Les métadonnées sont collectées via les APIs publiques officielles :</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Légifrance (API PISTE — DILA)</li>
            <li>INSEE (API Melodi)</li>
            <li>Banque de France (Webstat)</li>
            <li>data.gouv.fr (API v1)</li>
            <li>OCDE (API publique)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Propriété intellectuelle</h2>
          <p>
            Les données indexées proviennent de sources publiques ouvertes (Open Data).
            Les liens renvoient systématiquement vers les sources officielles.
            Aucun contenu n'est reproduit intégralement.
          </p>
        </section>
      </div>
    </div>
  );
}
