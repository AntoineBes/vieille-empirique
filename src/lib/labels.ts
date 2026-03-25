/**
 * Labels et couleurs pour les enums Prisma
 * Centralise la présentation des taxonomies
 */

import type { Categorie, Institution, TypeDocument, SousCategorie } from "@prisma/client";

// ─── Catégories ─────────────────────────

export const CATEGORIE_LABELS: Record<string, string> = {
  DROIT: "Droit",
  ECONOMIE: "Économie",
  POLITIQUE: "Politique",
  EUROPE: "Europe",
  SOCIETE: "Société",
};

export const CATEGORIE_BADGE_CLASS: Record<string, string> = {
  DROIT: "badge-droit",
  ECONOMIE: "badge-economie",
  POLITIQUE: "badge-politique",
  EUROPE: "badge-europe",
  SOCIETE: "badge-societe",
};

export const CATEGORIE_COLORS: Record<string, string> = {
  DROIT: "#4A6FA5",
  ECONOMIE: "#C17B5C",
  POLITIQUE: "#7B5EA7",
  EUROPE: "#D4A843",
  SOCIETE: "#5C8A6B",
};

// ─── Institutions ───────────────────────

export const INSTITUTION_LABELS: Record<string, string> = {
  LEGIFRANCE: "Légifrance",
  INSEE: "INSEE",
  BANQUE_DE_FRANCE: "Banque de France",
  DATA_GOUV: "data.gouv.fr",
  COUR_DES_COMPTES: "Cour des comptes",
  DARES: "DARES",
  OCDE: "OCDE",
  CONSEIL_CONSTITUTIONNEL: "Conseil constitutionnel",
  CONSEIL_ETAT: "Conseil d'État",
  COUR_DE_CASSATION: "Cour de cassation",
  MINISTERE_ECONOMIE: "Min. Économie",
  MINISTERE_TRAVAIL: "Min. Travail",
  AUTRE: "Autre",
};

// ─── Types de document ──────────────────

export const TYPE_LABELS: Record<string, string> = {
  LOI: "Loi",
  DECRET: "Décret",
  ORDONNANCE: "Ordonnance",
  ARRETE: "Arrêté",
  CIRCULAIRE: "Circulaire",
  QPC: "QPC",
  DECISION_CC: "Décision CC",
  DECISION_CE: "Décision CE",
  DECISION_CASS: "Décision Cass.",
  PUBLICATION_STATISTIQUE: "Publication statistique",
  INDICATEUR: "Indicateur",
  ENQUETE: "Enquête",
  RAPPORT: "Rapport",
  JEU_DE_DONNEES: "Jeu de données",
  RESSOURCE: "Ressource",
  BULLETIN: "Bulletin",
  PROJECTION: "Projection",
  ETUDE: "Étude",
  COMPARAISON_INTERNATIONALE: "Comparaison internationale",
  AUTRE: "Autre",
};

// ─── Sous-catégories ────────────────────

export const SOUS_CATEGORIE_LABELS: Record<string, string> = {
  JURISPRUDENCE: "Jurisprudence",
  LEGISLATION: "Législation",
  REGLEMENTATION: "Réglementation",
  DROIT_CONSTITUTIONNEL: "Droit constitutionnel",
  DROIT_SOCIAL: "Droit social",
  DROIT_FISCAL: "Droit fiscal",
  FINANCES_PUBLIQUES: "Finances publiques",
  MARCHE_DU_TRAVAIL: "Marché du travail",
  INFLATION_PRIX: "Inflation / Prix",
  COMMERCE_EXTERIEUR: "Commerce extérieur",
  POLITIQUE_MONETAIRE: "Politique monétaire",
  CONJONCTURE: "Conjoncture",
  POLITIQUES_PUBLIQUES: "Politiques publiques",
  ELECTIONS: "Élections",
  INSTITUTIONS: "Institutions",
  REFORME_ETAT: "Réforme de l'État",
  LEGISLATION_EU: "Législation UE",
  FONDS_EU: "Fonds européens",
  TRAITES: "Traités",
  EUROSTAT: "Eurostat",
  DEMOGRAPHIE: "Démographie",
  EDUCATION: "Éducation",
  SANTE: "Santé",
  LOGEMENT: "Logement",
  PAUVRETE_EXCLUSION: "Pauvreté / Exclusion",
  ENVIRONNEMENT: "Environnement",
};

// Mapping sous-catégories par catégorie parente
export const SOUS_CATEGORIES_PAR_CATEGORIE: Record<string, string[]> = {
  DROIT: ["JURISPRUDENCE", "LEGISLATION", "REGLEMENTATION", "DROIT_CONSTITUTIONNEL", "DROIT_SOCIAL", "DROIT_FISCAL"],
  ECONOMIE: ["FINANCES_PUBLIQUES", "MARCHE_DU_TRAVAIL", "INFLATION_PRIX", "COMMERCE_EXTERIEUR", "POLITIQUE_MONETAIRE", "CONJONCTURE"],
  POLITIQUE: ["POLITIQUES_PUBLIQUES", "ELECTIONS", "INSTITUTIONS", "REFORME_ETAT"],
  EUROPE: ["LEGISLATION_EU", "FONDS_EU", "TRAITES", "EUROSTAT"],
  SOCIETE: ["DEMOGRAPHIE", "EDUCATION", "SANTE", "LOGEMENT", "PAUVRETE_EXCLUSION", "ENVIRONNEMENT"],
};

// ─── Formatage des dates ────────────────

export function formatDate(date: Date | string, style: "short" | "long" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (style === "long") {
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}
