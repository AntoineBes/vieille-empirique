/**
 * Page Documentation — présentation du projet, des sources et de la méthodologie
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Fonctionnement, sources et méthodologie de Veille Empirique",
};

const SOURCES = [
  {
    nom: "INSEE — Banque de Données Macro-économiques",
    description:
      "Catalogue des séries statistiques (dataflows SDMX) : emploi, prix, conjoncture, démographie, construction.",
    url: "https://www.insee.fr",
    frequence: "Quotidienne",
    acces: "API publique, accès libre",
  },
  {
    nom: "data.gouv.fr",
    description:
      "Jeux de données ouverts publiés par la Cour des comptes, la DARES, le ministère de l'Économie et le ministère du Travail.",
    url: "https://www.data.gouv.fr",
    frequence: "Quotidienne",
    acces: "API publique, licence ouverte Etalab",
  },
  {
    nom: "Légifrance — API PISTE",
    description:
      "Journal Officiel de la République Française : lois, décrets, ordonnances, arrêtés, circulaires.",
    url: "https://www.legifrance.gouv.fr",
    frequence: "Lundi, mercredi, vendredi",
    acces: "API PISTE (clé requise)",
  },
  {
    nom: "Banque de France",
    description:
      "Publications, bulletins, projections macro-économiques et études sur la politique monétaire.",
    url: "https://www.banque-france.fr",
    frequence: "Hebdomadaire",
    acces: "API publique, accès libre",
  },
  {
    nom: "OCDE",
    description:
      "Comparaisons internationales, indicateurs économiques et études par pays.",
    url: "https://www.oecd.org",
    frequence: "Hebdomadaire",
    acces: "API publique, accès libre",
  },
];

const CATEGORIES = [
  { nom: "Droit", description: "Législation, réglementation, jurisprudence, droit constitutionnel, social et fiscal." },
  { nom: "Économie", description: "Conjoncture, finances publiques, emploi, inflation, commerce extérieur, politique monétaire." },
  { nom: "Politique", description: "Politiques publiques, élections, institutions, réforme de l'État." },
  { nom: "Europe", description: "Législation européenne, fonds structurels, traités, Eurostat." },
  { nom: "Société", description: "Démographie, éducation, santé, logement, pauvreté, environnement." },
];

export default function DocumentationPage() {
  return (
    <div className="container-wide py-10">
      <div className="max-w-3xl">
        <h1 className="font-serif text-display text-ink-900 mb-3">Documentation</h1>
        <p className="text-ink-600 leading-relaxed mb-12">
          Veille Empirique est un agrégateur de métadonnées de publications officielles françaises.
          Il indexe quotidiennement les nouvelles publications depuis les APIs publiques et les rend
          consultables par catégorie, institution et type de document.
        </p>

        {/* Fonctionnement */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-4">Fonctionnement</h2>
          <div className="space-y-4 text-sm text-ink-700 leading-relaxed">
            <p>
              Des connecteurs automatisés interrogent chaque source selon un calendrier défini.
              Pour chaque publication trouvée, le système indexe les métadonnées (titre, date, institution,
              catégorie) et enregistre un lien vers la source officielle.
            </p>
            <p>
              <strong>Aucun contenu n'est reproduit.</strong> Seules les métadonnées et les liens vers les
              publications d'origine sont stockés. L'intégralité des documents reste hébergée sur les
              sites officiels.
            </p>
            <p>
              Les données sont classées automatiquement par catégorie et sous-catégorie à partir de
              mots-clés extraits des identifiants et titres des publications.
            </p>
          </div>
        </section>

        {/* Sources */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-6">Sources</h2>
          <div className="space-y-6">
            {SOURCES.map((source) => (
              <div key={source.nom} className="border-l-2 border-ink-200 pl-5">
                <h3 className="font-semibold text-ink-900 mb-1">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-economie transition">
                    {source.nom}
                  </a>
                </h3>
                <p className="text-sm text-ink-600 mb-2">{source.description}</p>
                <div className="flex gap-4 text-xs text-ink-400">
                  <span className="font-mono">Fréquence : {source.frequence}</span>
                  <span className="font-mono">{source.acces}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Catégories */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-6">Catégories</h2>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.nom} className="flex gap-4">
                <span className="font-semibold text-sm text-ink-900 w-24 shrink-0">{cat.nom}</span>
                <span className="text-sm text-ink-600">{cat.description}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stack technique */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-4">Stack technique</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-ink-500">Framework</div>
            <div className="text-ink-800">Next.js 14 (App Router)</div>
            <div className="text-ink-500">Base de données</div>
            <div className="text-ink-800">PostgreSQL (Neon)</div>
            <div className="text-ink-500">ORM</div>
            <div className="text-ink-800">Prisma</div>
            <div className="text-ink-500">Hébergement</div>
            <div className="text-ink-800">Vercel</div>
            <div className="text-ink-500">Synchronisation</div>
            <div className="text-ink-800">GitHub Actions (cron)</div>
            <div className="text-ink-500">Style</div>
            <div className="text-ink-800">Tailwind CSS</div>
          </div>
        </section>

        {/* Projet associé */}
        <section className="border-t border-ink-200 pt-8">
          <h2 className="font-serif text-heading text-ink-900 mb-4">Projet associé</h2>
          <p className="text-sm text-ink-700 leading-relaxed">
            Les données agrégées par Veille Empirique alimentent{" "}
            <a
              href="https://empirisme-citoyen.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent-economie hover:underline"
            >
              empirisme-citoyen.fr
            </a>
            , une plateforme d'analyse et de vulgarisation des publications officielles françaises.
          </p>
        </section>
      </div>
    </div>
  );
}
