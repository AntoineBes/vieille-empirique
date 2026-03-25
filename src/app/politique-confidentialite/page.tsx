import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PolitiqueConfidentialite() {
  return (
    <div className="container-content py-10">
      <h1 className="font-serif text-display text-ink-900 mb-8">Politique de confidentialité</h1>

      <div className="prose prose-ink max-w-none space-y-6 text-sm leading-relaxed text-ink-700">
        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Données collectées</h2>
          <p>
            Veille Empirique ne collecte aucune donnée personnelle.
            Aucun cookie de suivi, aucun formulaire, aucune inscription.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Cookies</h2>
          <p>
            Ce site n'utilise aucun cookie. Aucun outil d'analyse comportementale
            (Google Analytics, etc.) n'est déployé.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink-900 mb-2">Hébergement et logs</h2>
          <p>
            L'hébergeur (Vercel) peut collecter des logs techniques (adresse IP, user-agent)
            conformément à ses conditions d'utilisation. Ces données ne sont pas exploitées
            par l'éditeur du site.
          </p>
        </section>
      </div>
    </div>
  );
}
