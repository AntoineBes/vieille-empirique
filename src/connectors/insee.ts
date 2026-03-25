/**
 * Connecteur INSEE — API BDM (Banque de Données Macro-économiques)
 * Endpoint : https://api.insee.fr/series/BDM/V1/dataflow
 *
 * Accès libre, pas de clé API requise.
 * Récupère le catalogue des séries statistiques (dataflows SDMX)
 * et les dernières publications via la page de dernières parutions.
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

// ─────────────────────────────────────────
// Mapping des dataflow IDs → taxonomie interne
// ─────────────────────────────────────────

// Tableau ordonné : les clés les plus spécifiques d'abord (évite les faux positifs)
const DATAFLOW_RULES: Array<{ keyword: string; categorie: Categorie; sous_categorie?: SousCategorie }> = [
  // Prix/Inflation — avant CONSO et PRODUCTION qui sont plus génériques
  { keyword: "IPC", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX },
  { keyword: "PRIX", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX },
  { keyword: "INFLATION", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX },
  // Emploi/Chômage
  { keyword: "CHOMAGE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
  { keyword: "EMPLOI", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
  { keyword: "SALAIRE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
  // Commerce extérieur
  { keyword: "BALANCE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR },
  { keyword: "ECHANGE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR },
  { keyword: "IMPORT", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR },
  { keyword: "EXPORT", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR },
  // Finances publiques
  { keyword: "FINANCE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES },
  { keyword: "DETTE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES },
  { keyword: "DEFICIT", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES },
  // Logement
  { keyword: "CONSTRUCTION", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.LOGEMENT },
  { keyword: "LOGEMENT", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.LOGEMENT },
  // Démographie
  { keyword: "POPULATION", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.DEMOGRAPHIE },
  { keyword: "DEMO", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.DEMOGRAPHIE },
  { keyword: "NAISSANCE", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.DEMOGRAPHIE },
  { keyword: "DECES", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.DEMOGRAPHIE },
  // Éducation
  { keyword: "EDUCATION", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.EDUCATION },
  // Conjoncture (génériques, en dernier)
  { keyword: "PIB", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { keyword: "CNA", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { keyword: "CONSO", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { keyword: "CLIMAT", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { keyword: "CONJONCTURE", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { keyword: "PRODUCTION", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { keyword: "TOURISME", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
];

const DEFAULT_CLASSIFICATION = { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE };

function classifyDataflow(id: string, name: string): { categorie: Categorie; sous_categorie?: SousCategorie } {
  // D'abord chercher dans l'ID seul (plus fiable), puis dans id+name
  const upperId = id.toUpperCase();
  for (const rule of DATAFLOW_RULES) {
    if (upperId.includes(rule.keyword)) return { categorie: rule.categorie, sous_categorie: rule.sous_categorie };
  }
  const upperFull = (id + " " + name).toUpperCase();
  for (const rule of DATAFLOW_RULES) {
    if (upperFull.includes(rule.keyword)) return { categorie: rule.categorie, sous_categorie: rule.sous_categorie };
  }
  return DEFAULT_CLASSIFICATION;
}

// ─────────────────────────────────────────
// Parsing XML simplifié (pas de dépendance externe)
// ─────────────────────────────────────────

interface ParsedDataflow {
  id: string;
  nameFr: string;
  nameEn?: string;
  url?: string;
  seriesCount?: string;
}

function parseDataflowsXml(xml: string): ParsedDataflow[] {
  const dataflows: ParsedDataflow[] = [];

  // Regex pour extraire chaque bloc Dataflow
  const dfRegex = /<str:Dataflow\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/str:Dataflow>/g;
  let match: RegExpExecArray | null;

  while ((match = dfRegex.exec(xml)) !== null) {
    const id = match[1];
    const block = match[2];

    // Nom français
    const nameFrMatch = block.match(/<com:Name\s+xml:lang="fr">([^<]+)<\/com:Name>/);
    const nameFr = nameFrMatch?.[1] ?? id;

    // Nom anglais
    const nameEnMatch = block.match(/<com:Name\s+xml:lang="en">([^<]+)<\/com:Name>/);
    const nameEn = nameEnMatch?.[1];

    // URL de la page INSEE
    const urlMatch = block.match(/<com:AnnotationURL>([^<]+)<\/com:AnnotationURL>/);
    const url = urlMatch?.[1];

    // Nombre de séries
    const seriesMatch = block.match(/<com:AnnotationText[^>]*>([^<]*séries[^<]*)<\/com:AnnotationText>/i);
    const seriesCount = seriesMatch?.[1];

    dataflows.push({ id, nameFr, nameEn, url, seriesCount });
  }

  return dataflows;
}

// ─────────────────────────────────────────
// Connecteur
// ─────────────────────────────────────────

export class InseeConnector extends BaseConnector {
  readonly institution = Institution.INSEE;

  // API BDM SDMX — accès libre, pas de clé requise
  private readonly dataflowUrl = "https://api.insee.fr/series/BDM/V1/dataflow";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const max = config.maxDocuments ?? 200;
    const docs: DocumentMetadata[] = [];

    try {
      const response = await fetch(this.dataflowUrl, {
        headers: {
          Accept: "application/xml",
          "User-Agent": "VeilleEmpirique/1.0",
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`INSEE BDM HTTP ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();
      const dataflows = parseDataflowsXml(xml);

      for (const df of dataflows) {
        if (!df.url) continue;

        const { categorie, sous_categorie } = classifyDataflow(df.id, df.nameFr);
        const seriesInfo = df.seriesCount ? ` (${df.seriesCount})` : "";

        docs.push({
          source_id: `BDM-${df.id}`,
          institution: Institution.INSEE,
          titre: df.nameFr,
          type: TypeDocument.INDICATEUR,
          categorie,
          sous_categorie,
          resume: df.nameEn ? `${df.nameEn}${seriesInfo}` : seriesInfo.trim() || undefined,
          url: df.url,
          date_publication: new Date(),
          metadata: {
            dataflowId: df.id,
            nameEn: df.nameEn,
            seriesCount: df.seriesCount,
            date_type: "sync", // Pas de date de publication disponible via le catalogue BDM
          },
        });
      }

      console.log(`[INSEE] ${docs.length} dataflows BDM récupérés`);
    } catch (err) {
      console.error("[INSEE] Erreur lors du fetch :", err);
      throw err;
    }

    return docs.slice(0, max);
  }
}
