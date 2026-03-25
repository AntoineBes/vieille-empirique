/**
 * Connecteur Banque de France — API Webstat Explore v2.1
 * Base : https://webstat.banque-france.fr/api/explore/v2.1
 *
 * Accès libre, pas de clé requise.
 * Récupère les records du dataset « tableaux_rapports_preetablis » (274 publications).
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface BdfRecord {
  type?: string;
  thematique_fr?: string;
  thematique_en?: string;
  title_fr?: string;
  title_en?: string;
  date_publication?: string;
  date_mise_a_jour?: string;
  lien?: string | null;
  piece_jointe?: { url?: string; filename?: string } | null;
}

interface BdfResponse {
  total_count?: number;
  results?: BdfRecord[];
}

function themeToClassification(theme?: string): { categorie: Categorie; sous_categorie?: SousCategorie } {
  if (!theme) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.POLITIQUE_MONETAIRE };
  const t = theme.toLowerCase();
  if (t.includes("conjoncture") || t.includes("projection") || t.includes("croissance")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE };
  if (t.includes("monétaire") || t.includes("monetaire") || t.includes("taux")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.POLITIQUE_MONETAIRE };
  if (t.includes("inflation") || t.includes("prix")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX };
  if (t.includes("balance") || t.includes("paiement") || t.includes("extérieur")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.COMMERCE_EXTERIEUR };
  if (t.includes("finance") || t.includes("dette") || t.includes("budget")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES };
  if (t.includes("emploi") || t.includes("travail") || t.includes("salaire")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL };
  if (t.includes("europe")) return { categorie: Categorie.EUROPE };
  return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.POLITIQUE_MONETAIRE };
}

function recordToType(type?: string, theme?: string): TypeDocument {
  const t = (type ?? "").toLowerCase() + " " + (theme ?? "").toLowerCase();
  if (t.includes("projection")) return TypeDocument.PROJECTION;
  if (t.includes("étude") || t.includes("etude") || t.includes("working")) return TypeDocument.ETUDE;
  if (t.includes("rapport")) return TypeDocument.RAPPORT;
  if (t.includes("bulletin") || t.includes("stat")) return TypeDocument.BULLETIN;
  return TypeDocument.BULLETIN;
}

export class BanqueDeFranceConnector extends BaseConnector {
  readonly institution = Institution.BANQUE_DE_FRANCE;

  private readonly recordsUrl =
    "https://webstat.banque-france.fr/api/explore/v2.1/catalog/datasets/tableaux_rapports_preetablis/records";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const max = config.maxDocuments ?? 100;
    const docs: DocumentMetadata[] = [];
    let offset = 0;
    const pageSize = 100;

    while (docs.length < max) {
      const url = `${this.recordsUrl}?limit=${pageSize}&offset=${offset}&order_by=-date_publication`;

      const resp = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "VeilleEmpirique/1.0",
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!resp.ok) throw new Error(`BdF records HTTP ${resp.status}`);

      const data: BdfResponse = await resp.json();
      const records = data.results ?? [];

      if (records.length === 0) break;

      for (const rec of records) {
        if (!rec.title_fr) continue;

        const { categorie, sous_categorie } = themeToClassification(rec.thematique_fr);
        const type = recordToType(rec.type, rec.thematique_fr);

        const docUrl = rec.lien
          ?? rec.piece_jointe?.url
          ?? "https://webstat.banque-france.fr";

        docs.push({
          source_id: `BDF-${rec.title_fr.replace(/\s+/g, "-").slice(0, 80)}-${rec.date_publication ?? "nd"}`,
          institution: Institution.BANQUE_DE_FRANCE,
          titre: rec.title_fr,
          type,
          categorie,
          sous_categorie,
          resume: rec.thematique_fr
            ? `${rec.thematique_fr}${rec.title_en ? ` — ${rec.title_en}` : ""}`
            : rec.title_en,
          url: docUrl,
          date_publication: rec.date_publication ? new Date(rec.date_publication) : new Date(),
          metadata: {
            thematique_fr: rec.thematique_fr,
            thematique_en: rec.thematique_en,
            title_en: rec.title_en,
            filename: rec.piece_jointe?.filename,
          },
        });
      }

      offset += pageSize;
      if (records.length < pageSize) break;
    }

    console.log(`[BdF] ${docs.length} publications Webstat récupérées`);
    return docs.slice(0, max);
  }
}
