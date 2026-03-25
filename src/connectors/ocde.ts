/**
 * Connecteur OCDE — API SDMX REST publique
 * Base : https://sdmx.oecd.org/public/rest
 *
 * Accès libre, pas de clé requise.
 * Récupère le catalogue des dataflows disponibles et filtre ceux liés à la France.
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface SdmxDataflow {
  id: string;
  name: string;
  agencyId?: string;
  version?: string;
}

// Mots-clés pour filtrer les dataflows pertinents France / économie
const FRANCE_KEYWORDS = ["FRANCE", "FRA", "ECONOMIC", "OUTLOOK", "EMPLOYMENT", "GDP", "CPI", "TRADE", "FISCAL", "LABOUR", "WAGE", "OECD"];

function classifyOcde(name: string): { categorie: Categorie; sous_categorie?: SousCategorie } {
  const n = name.toUpperCase();
  if (n.includes("EMPLOY") || n.includes("LABOUR") || n.includes("WAGE") || n.includes("JOB")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL };
  if (n.includes("FISCAL") || n.includes("BUDGET") || n.includes("DEBT") || n.includes("TAX") || n.includes("REVENUE")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES };
  if (n.includes("GDP") || n.includes("GROWTH") || n.includes("OUTLOOK") || n.includes("LEADING") || n.includes("KEI")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE };
  if (n.includes("CPI") || n.includes("PRICE") || n.includes("INFLATION")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX };
  if (n.includes("TRADE") || n.includes("EXPORT") || n.includes("IMPORT") || n.includes("BALANCE")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR };
  if (n.includes("EDUCATION") || n.includes("PISA") || n.includes("SCHOOL")) return { categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.EDUCATION };
  if (n.includes("HEALTH") || n.includes("SANTE")) return { categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.SANTE };
  if (n.includes("DEMOGRAPH") || n.includes("POPULATION") || n.includes("MIGRATION")) return { categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.DEMOGRAPHIE };
  if (n.includes("ENVIRON")) return { categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.ENVIRONNEMENT };
  return { categorie: Categorie.ECONOMIE };
}

// Parse le XML SDMX pour extraire les dataflows
// Supporte les deux conventions de namespace : str:/com: et structure:/common:
function parseDataflowsXml(xml: string): SdmxDataflow[] {
  const dataflows: SdmxDataflow[] = [];
  // Match Dataflow blocks — tolère str: ou structure: comme préfixe
  const dfRegex = /<(?:str|structure):Dataflow\s+[^>]*id="([^"]+)"[^>]*agencyID="([^"]*)"[^>]*version="([^"]*)"[^>]*>([\s\S]*?)<\/(?:str|structure):Dataflow>/g;
  let match: RegExpExecArray | null;

  while ((match = dfRegex.exec(xml)) !== null) {
    const id = match[1];
    const agencyId = match[2];
    const version = match[3];
    const block = match[4];

    // Nom anglais (préféré) puis français — tolère com: ou common:
    const nameEnMatch = block.match(/<(?:com|common):Name\s+xml:lang="en">([^<]+)<\/(?:com|common):Name>/);
    const nameFrMatch = block.match(/<(?:com|common):Name\s+xml:lang="fr">([^<]+)<\/(?:com|common):Name>/);
    const name = nameEnMatch?.[1] ?? nameFrMatch?.[1] ?? id;

    dataflows.push({ id, name, agencyId, version });
  }

  return dataflows;
}

export class OcdeConnector extends BaseConnector {
  readonly institution = Institution.OCDE;

  private readonly dataflowUrl = "https://sdmx.oecd.org/public/rest/dataflow";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const max = config.maxDocuments ?? 50;

    const resp = await fetch(this.dataflowUrl, {
      headers: {
        Accept: "application/xml",
        "User-Agent": "VeilleEmpirique/1.0",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) throw new Error(`OCDE SDMX HTTP ${resp.status}`);

    const xml = await resp.text();
    const allDataflows = parseDataflowsXml(xml);

    // Filtrer les dataflows pertinents (économie, France, indicateurs clés)
    const relevant = allDataflows.filter((df) => {
      const upper = (df.id + " " + df.name).toUpperCase();
      return FRANCE_KEYWORDS.some((kw) => upper.includes(kw));
    });

    const docs: DocumentMetadata[] = relevant.map((df) => {
      const { categorie, sous_categorie } = classifyOcde(df.name);
      const fullId = `${df.agencyId ?? "OECD"},${df.id},${df.version ?? "1.0"}`;

      return {
        source_id: `OCDE-${df.id}`,
        institution: Institution.OCDE,
        titre: df.name,
        type: TypeDocument.COMPARAISON_INTERNATIONALE,
        categorie,
        sous_categorie,
        url: `https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=${df.id}&df[ag]=OECD`,
        date_publication: new Date(),
        metadata: { dataflowId: df.id, agencyId: df.agencyId, version: df.version, sdmxId: fullId, date_type: "sync" },
      };
    });

    console.log(`[OCDE] ${docs.length} dataflows pertinents sur ${allDataflows.length} total`);
    return docs.slice(0, max);
  }
}
