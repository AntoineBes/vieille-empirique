/**
 * Connecteur Eurostat — API JSON-stat
 * Base : https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/
 *
 * Accès libre, pas de clé requise.
 * Récupère les métadonnées des datasets prioritaires pour la France.
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface EurostatDataset {
  code: string;
  label: string;
  categorie: Categorie;
  sous_categorie: SousCategorie;
}

const DATASETS: EurostatDataset[] = [
  { code: "gov_10dd_edpt1", label: "Dette publique en % du PIB", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES },
  { code: "une_rt_m", label: "Taux de chômage harmonisé (mensuel)", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
  { code: "namq_10_gdp", label: "PIB en volume (trimestriel)", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE },
  { code: "prc_hicp_midx", label: "Indice des prix à la consommation harmonisé", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX },
  { code: "lfsi_emp_a", label: "Emploi par activité économique", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
  { code: "bop_c6_q", label: "Balance des paiements (trimestriel)", categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR },
  { code: "demo_pjan", label: "Population au 1er janvier", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.DEMOGRAPHIE },
  { code: "spr_exp_sum", label: "Dépenses de protection sociale", categorie: Categorie.SOCIETE, sous_categorie: SousCategorie.SANTE },
];

interface JsonStatResponse {
  version?: string;
  label?: string;
  updated?: string;
  source?: string;
  id?: string[];
  size?: number[];
}

export class EurostatConnector extends BaseConnector {
  readonly institution = Institution.EUROSTAT;

  private readonly baseUrl = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const max = config.maxDocuments ?? 50;
    const docs: DocumentMetadata[] = [];

    for (const ds of DATASETS) {
      if (docs.length >= max) break;

      try {
        const url = `${this.baseUrl}/${ds.code}?geo=FR&sinceTimePeriod=2020&lang=fr`;
        const resp = await fetch(url, {
          headers: { Accept: "application/json", "User-Agent": "VeilleEmpirique/1.0" },
          signal: AbortSignal.timeout(20_000),
        });

        if (!resp.ok) {
          console.warn(`[Eurostat] ${ds.code} HTTP ${resp.status}, skip`);
          continue;
        }

        const data: JsonStatResponse = await resp.json();

        docs.push({
          source_id: `EUROSTAT-${ds.code}`,
          institution: Institution.EUROSTAT,
          titre: data.label ?? ds.label,
          type: TypeDocument.INDICATEUR,
          categorie: ds.categorie,
          sous_categorie: ds.sous_categorie,
          url: `https://ec.europa.eu/eurostat/databrowser/view/${ds.code}/default/table?lang=fr`,
          date_publication: data.updated ? new Date(data.updated) : new Date(),
          metadata: {
            datasetCode: ds.code,
            source: data.source,
            lastUpdated: data.updated,
          },
        });
      } catch (err) {
        console.warn(`[Eurostat] Erreur ${ds.code}:`, err instanceof Error ? err.message : err);
      }
    }

    console.log(`[Eurostat] ${docs.length} datasets récupérés`);
    return docs.slice(0, max);
  }
}
