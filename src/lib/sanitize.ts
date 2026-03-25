/**
 * Utilitaires de validation et sanitization des entrées
 */

import { z } from "zod";
import type { Categorie, Institution, TypeDocument, SousCategorie } from "@prisma/client";

// Valeurs autorisées (dérivées des enums Prisma)
const CATEGORIES: Categorie[] = ["DROIT", "ECONOMIE", "POLITIQUE", "EUROPE", "SOCIETE"];
const INSTITUTIONS: Institution[] = [
  "LEGIFRANCE", "INSEE", "BANQUE_DE_FRANCE", "DATA_GOUV", "COUR_DES_COMPTES",
  "DARES", "OCDE", "CONSEIL_CONSTITUTIONNEL", "CONSEIL_ETAT", "COUR_DE_CASSATION",
  "MINISTERE_ECONOMIE", "MINISTERE_TRAVAIL", "AUTRE",
];
const TYPES: TypeDocument[] = [
  "LOI", "DECRET", "ORDONNANCE", "ARRETE", "CIRCULAIRE", "QPC", "DECISION_CC",
  "DECISION_CE", "DECISION_CASS", "PUBLICATION_STATISTIQUE", "INDICATEUR", "ENQUETE",
  "RAPPORT", "JEU_DE_DONNEES", "RESSOURCE", "BULLETIN", "PROJECTION", "ETUDE",
  "COMPARAISON_INTERNATIONALE", "AUTRE",
];
const SOUS_CATEGORIES: SousCategorie[] = [
  "JURISPRUDENCE", "LEGISLATION", "REGLEMENTATION", "DROIT_CONSTITUTIONNEL",
  "DROIT_SOCIAL", "DROIT_FISCAL", "FINANCES_PUBLIQUES", "MARCHE_DU_TRAVAIL",
  "INFLATION_PRIX", "COMMERCE_EXTERIEUR", "POLITIQUE_MONETAIRE", "CONJONCTURE",
  "POLITIQUES_PUBLIQUES", "ELECTIONS", "INSTITUTIONS", "REFORME_ETAT",
  "LEGISLATION_EU", "FONDS_EU", "TRAITES", "EUROSTAT", "DEMOGRAPHIE",
  "EDUCATION", "SANTE", "LOGEMENT", "PAUVRETE_EXCLUSION", "ENVIRONNEMENT",
];

/** Schéma de validation pour les paramètres de recherche de l'API */
export const searchParamsSchema = z.object({
  q: z
    .string()
    .max(200, "Recherche trop longue (max 200 caractères)")
    .transform((s) => s.replace(/[<>'"`;]/g, ""))
    .optional(),
  categorie: z.enum(CATEGORIES as [string, ...string[]]).optional(),
  institution: z.enum(INSTITUTIONS as [string, ...string[]]).optional(),
  type: z.enum(TYPES as [string, ...string[]]).optional(),
  sous_categorie: z.enum(SOUS_CATEGORIES as [string, ...string[]]).optional(),
  depuis: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .refine((d) => !isNaN(new Date(d).getTime()), "Date invalide")
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default("50"),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(1000))
    .optional()
    .default("1"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

/**
 * Sanitize une chaîne pour éviter les injections XSS dans le rendu
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
