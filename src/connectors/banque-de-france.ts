/**
 * Connecteur Banque de France — API Webstat
 * Docs : https://webstat.banque-france.fr/
 * Format SDMX-JSON, pas d'auth requise pour les données publiques
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface BdfPublication {
  id: string;
  title: string;
  description?: string;
  publicationDate?: string;
  url?: string;
  type?: string;
  themes?: string[];
}

function bdfTypeToInternal(type?: string): TypeDocument {
  if (!type) return TypeDocument.BULLETIN;
  const t = type.toLowerCase();
  if (t.includes("projection")) return TypeDocument.PROJECTION;
  if (t.includes("bulletin")) return TypeDocument.BULLETIN;
  if (t.includes("etude") || t.includes("étude") || t.includes("working")) return TypeDocument.ETUDE;
  return TypeDocument.BULLETIN;
}

function bdfThemeToClassification(themes: string[] = []): { categorie: Categorie; sous_categorie?: SousCategorie } {
  const flat = themes.join(" ").toLowerCase();
  if (flat.includes("projection") || flat.includes("conjoncture")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE };
  if (flat.includes("monetaire") || flat.includes("monétaire") || flat.includes("taux")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.POLITIQUE_MONETAIRE };
  if (flat.includes("inflation") || flat.includes("prix")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.INFLATION_PRIX };
  return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.POLITIQUE_MONETAIRE };
}

export class BanqueDeFranceConnector extends BaseConnector {
  readonly institution = Institution.BANQUE_DE_FRANCE;

  // Endpoint publications éditoriales (pas les séries SDMX)
  private readonly pubUrl = "https://www.banque-france.fr/fr/recherche?type=Publication&sort=date&output=json";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const since = config.since ?? this.defaultSince();
    const max = config.maxDocuments ?? 50;

    const resp = await fetch(this.pubUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "VeilleEmpirique/1.0",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) throw new Error(`BdF HTTP ${resp.status}`);

    const raw = await resp.json();
    const items: BdfPublication[] = Array.isArray(raw) ? raw : (raw.results ?? []);

    return items
      .filter((item) => {
        if (!item.publicationDate) return false;
        return new Date(item.publicationDate) >= since;
      })
      .slice(0, max)
      .map((item) => {
        const type = bdfTypeToInternal(item.type);
        const { categorie, sous_categorie } = bdfThemeToClassification(item.themes);
        return {
          source_id: item.id,
          institution: Institution.BANQUE_DE_FRANCE,
          titre: item.title,
          type,
          categorie,
          sous_categorie,
          resume: item.description?.slice(0, 500),
          url: item.url ?? "https://www.banque-france.fr",
          date_publication: new Date(item.publicationDate!),
          metadata: { themes: item.themes },
        };
      });
  }

  private defaultSince(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
}
