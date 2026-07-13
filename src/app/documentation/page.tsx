/**
 * Page Documentation — présentation du projet, des sources et de la méthodologie
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Fonctionnement, sources et méthodologie de Veille Empirique",
};

const SOURCES_ECONOMIE = [
  {
    nom: "INSEE — Banque de Données Macro-économiques",
    description:
      "Catalogue des séries statistiques (dataflows SDMX) : emploi, prix, conjoncture, démographie, construction.",
    url: "https://www.insee.fr",
    frequence: "Quotidienne",
    acces: "API publique SDMX, accès libre",
  },
  {
    nom: "Banque de France — Webstat",
    description:
      "Publications, bulletins, projections macro-économiques et études sur la politique monétaire.",
    url: "https://www.banque-france.fr",
    frequence: "Quotidienne",
    acces: "API Webstat v2.1, accès libre",
  },
  {
    nom: "Eurostat",
    description:
      "Statistiques européennes : dette publique, chômage harmonisé, PIB en volume, HICP, emploi, balance des paiements, démographie, protection sociale.",
    url: "https://ec.europa.eu/eurostat",
    frequence: "Hebdomadaire",
    acces: "API JSON-stat, accès libre",
  },
  {
    nom: "OCDE",
    description:
      "Comparaisons internationales et indicateurs économiques (emploi, PIB, inflation, commerce, éducation, santé).",
    url: "https://www.oecd.org",
    frequence: "Quotidienne",
    acces: "API publique SDMX, accès libre",
  },
];

const SOURCES_DATAGOUV = [
  {
    nom: "Cour des comptes",
    description: "Rapports publics, notes d'exécution budgétaire, données d'activité.",
    datasets: "~237 jeux de données",
  },
  {
    nom: "DARES (Min. Travail)",
    description: "Statistiques de l'emploi, chômage BIT, emploi salarié.",
    datasets: "~17 jeux de données",
  },
  {
    nom: "DGFiP / Min. Économie & Finances",
    description: "Exécution budgétaire, recettes fiscales, données financières publiques.",
    datasets: "~740 jeux de données",
  },
  {
    nom: "DREES (Min. Santé)",
    description: "Protection sociale, dépenses de santé, minima sociaux (RSA, AAH).",
    datasets: "~385 jeux de données",
  },
  {
    nom: "Min. Économie",
    description: "Données économiques sectorielles et conjoncturelles.",
    datasets: "~14 jeux de données",
  },
  {
    nom: "Min. Travail",
    description: "Emploi, insertion professionnelle, dialogue social.",
    datasets: "variable",
  },
  {
    nom: "Assemblée nationale",
    description: "Scrutins, dossiers législatifs, amendements, données parlementaires.",
    datasets: "~11 jeux de données",
  },
  {
    nom: "Sénat",
    description: "Données parlementaires, rapports, travaux en commission.",
    datasets: "~8 jeux de données",
  },
];

const SOURCES_JURIDIQUES = [
  {
    nom: "Légifrance — JORF",
    description:
      "Journal Officiel : lois, décrets, ordonnances, arrêtés, circulaires. Couverture 1 an glissant.",
    url: "https://www.legifrance.gouv.fr",
    frequence: "Quotidienne",
    acces: "API PISTE, OAuth2 (clé requise)",
  },
  {
    nom: "Légifrance — Conseil constitutionnel",
    description:
      "Décisions QPC (Question Prioritaire de Constitutionnalité) et DC (contrôle a priori).",
    url: "https://www.conseil-constitutionnel.fr",
    frequence: "Quotidienne",
    acces: "API PISTE, fond CONSTIT",
  },
  {
    nom: "Judilibre — Cour de cassation",
    description:
      "Décisions de principe : arrêts de chambres, droit social, fiscal, jurisprudence. Couverture 6 mois glissants.",
    url: "https://www.courdecassation.fr",
    frequence: "Hebdomadaire",
    acces: "API officielle, clé gratuite",
  },
];

const SOURCES_PARLEMENTAIRES = [
  {
    nom: "Sénat — Rapports (RSS)",
    description:
      "Flux RSS officiel des rapports publiés par le Sénat.",
    url: "https://www.senat.fr",
    frequence: "Quotidienne",
    acces: "RSS public, syndication autorisée",
  },
];

const CATEGORIES = [
  { nom: "Économie", description: "Conjoncture, finances publiques, emploi, inflation, commerce extérieur, politique monétaire." },
  { nom: "Droit", description: "Législation, réglementation, jurisprudence, droit constitutionnel, social et fiscal." },
  { nom: "Politique", description: "Politiques publiques, élections, institutions, réforme de l'État." },
  { nom: "Europe", description: "Statistiques européennes, fonds structurels, traités, Eurostat." },
  { nom: "Société", description: "Démographie, éducation, santé, logement, pauvreté, environnement." },
];

export default function DocumentationPage() {
  return (
    <div className="container-wide px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-3xl">
        <h1 className="font-serif text-display text-ink-900 mb-3">Documentation</h1>
        <p className="text-ink-600 leading-relaxed mb-12">
          Veille Empirique est un agrégateur de métadonnées de publications officielles françaises et européennes.
          Il indexe quotidiennement les nouvelles publications depuis des APIs publiques et des flux officiels,
          et les rend consultables par catégorie, institution et type de document.
        </p>

        {/* Fonctionnement */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-4">Fonctionnement</h2>
          <div className="space-y-4 text-sm text-ink-700 leading-relaxed">
            <p>
              Des connecteurs automatisés interrogent chaque source selon un calendrier défini (quotidien ou hebdomadaire).
              Pour chaque publication trouvée, le système indexe les métadonnées (titre, date, institution,
              catégorie) et enregistre un lien vers la source officielle.
            </p>
            <p>
              <strong>Aucun contenu n'est reproduit.</strong> Seules les métadonnées et les liens vers les
              publications d'origine sont stockés. L'intégralité des documents reste hébergée sur les
              sites officiels.
            </p>
            <p>
              <strong>100% API publiques et flux officiels.</strong> Aucun scraping de site web.
              Toutes les données proviennent d'APIs documentées, de portails open data sous Licence Ouverte
              ou de flux RSS volontairement mis à disposition.
            </p>
          </div>
        </section>

        {/* Sources — APIs économiques */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-6">Sources — APIs économiques et statistiques</h2>
          <div className="space-y-6">
            {SOURCES_ECONOMIE.map((source) => (
              <div key={source.nom} className="border-l-2 border-ink-200 pl-5">
                <h3 className="font-semibold text-ink-900 mb-1">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-economie transition">
                    {source.nom}
                  </a>
                </h3>
                <p className="text-sm text-ink-600 mb-2">{source.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-ink-400">
                  <span className="font-mono">Fréquence : {source.frequence}</span>
                  <span className="font-mono">{source.acces}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sources — data.gouv.fr */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-4">Sources — data.gouv.fr (Licence Ouverte)</h2>
          <p className="text-sm text-ink-600 mb-6">
            8 organisations publiques indexées via l'API REST de{" "}
            <a href="https://www.data.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-accent-economie hover:underline">
              data.gouv.fr
            </a>
            , la plateforme nationale d'open data. Fréquence de synchronisation : quotidienne.
          </p>
          <div className="space-y-3">
            {SOURCES_DATAGOUV.map((source) => (
              <div key={source.nom} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-ink-100 last:border-b-0">
                <span className="font-semibold text-sm text-ink-900 sm:w-56 shrink-0">{source.nom}</span>
                <span className="text-sm text-ink-600 flex-1">{source.description}</span>
                <span className="font-mono text-xs text-ink-400 shrink-0">{source.datasets}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Sources — Juridiques */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-6">Sources — Juridiques</h2>
          <div className="space-y-6">
            {SOURCES_JURIDIQUES.map((source) => (
              <div key={source.nom} className="border-l-2 border-ink-200 pl-5">
                <h3 className="font-semibold text-ink-900 mb-1">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-economie transition">
                    {source.nom}
                  </a>
                </h3>
                <p className="text-sm text-ink-600 mb-2">{source.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-ink-400">
                  <span className="font-mono">Fréquence : {source.frequence}</span>
                  <span className="font-mono">{source.acces}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sources — Parlementaires */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-6">Sources — Parlementaires</h2>
          <div className="space-y-6">
            {SOURCES_PARLEMENTAIRES.map((source) => (
              <div key={source.nom} className="border-l-2 border-ink-200 pl-5">
                <h3 className="font-semibold text-ink-900 mb-1">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-economie transition">
                    {source.nom}
                  </a>
                </h3>
                <p className="text-sm text-ink-600 mb-2">{source.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-ink-400">
                  <span className="font-mono">Fréquence : {source.frequence}</span>
                  <span className="font-mono">{source.acces}</span>
                </div>
              </div>
            ))}
            <p className="text-sm text-ink-500 italic">
              Les données open data de l'Assemblée nationale et du Sénat sont également indexées
              via data.gouv.fr (voir ci-dessus).
            </p>
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
            <div className="text-ink-500">Connecteurs</div>
            <div className="text-ink-800">8 connecteurs, 0 scraping</div>
          </div>
        </section>

        {/* Conformité */}
        <section className="mb-12">
          <h2 className="font-serif text-heading text-ink-900 mb-4">Conformité et accès aux données</h2>
          <div className="space-y-4 text-sm text-ink-700 leading-relaxed">
            <p>
              Toutes les sources utilisées sont des <strong>APIs publiques documentées</strong>, des
              <strong> portails open data sous Licence Ouverte Etalab</strong>, ou des <strong>flux RSS</strong> volontairement
              mis à disposition par les institutions.
            </p>
            <p>
              Aucune donnée personnelle n'est collectée. Les métadonnées indexées sont exclusivement
              des informations publiques (titres, dates, identifiants de publication).
              Le projet est conforme au RGPD et à la directive européenne 2019/790 sur le droit d'auteur
              dans le marché unique numérique.
            </p>
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
