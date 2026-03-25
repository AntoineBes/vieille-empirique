/**
 * Connecteur OCDE — API REST publique
 * Docs : https://data.oecd.org/api/
 *
 * On récupère les dernières publications économiques concernant la France
 * via l'API iLibrary / OECD.Stat
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface OcdeItem {
  doi?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  date?: string;
  url?: string;
  type?: string;
  subjects?: string[];
}

export class OcdeConnector extends BaseConnector {
  readonly institution = Institution.OCDE;

  // API publique de recherche OCDE (pas de clé requise pour les métadonnées)
  private readonly searchUrl = "https://www.oecd-ilibrary.org/api/search";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const since = config.since ?? this.defaultSince();
    const max = config.maxDocuments ?? 50;

    const url = new URL(this.searchUrl);
    url.searchParams.set("q", "France");
    url.searchParams.set("sort", "date");
    url.searchParams.set("type", "working-paper,report,data");
    url.searchParams.set("lang", "fr,en");
    url.searchParams.set("rows", String(Math.min(max, 50)));

    const resp = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "VeilleEmpirique/1.0",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) throw new Error(`OCDE HTTP ${resp.status}`);

    const raw = await resp.json();
    const items: OcdeItem[] = Array.isArray(raw) ? raw : (raw.results ?? raw.items ?? []);

    return items
      .filter((item) => {
        if (!item.date) return false;
        return new Date(item.date) >= since;
      })
      .slice(0, max)
      .map((item) => {
        const { categorie, sous_categorie } = this.classify(item.subjects ?? []);
        return {
          source_id: item.doi ?? item.url ?? item.title ?? String(Math.random()),
          institution: Institution.OCDE,
          titre: [item.title, item.subtitle].filter(Boolean).join(" — "),
          type: TypeDocument.COMPARAISON_INTERNATIONALE,
          categorie,
          sous_categorie,
          resume: item.description?.slice(0, 500),
          url: item.url ?? "https://www.oecd.org",
          date_publication: new Date(item.date!),
          metadata: { doi: item.doi, subjects: item.subjects },
        };
      });
  }

  private classify(subjects: string[]): { categorie: Categorie; sous_categorie?: SousCategorie } {
    const flat = subjects.join(" ").toLowerCase();
    if (flat.includes("emploi") || flat.includes("travail") || flat.includes("labour")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL };
    if (flat.includes("fiscal") || flat.includes("budget") || flat.includes("dette")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES };
    if (flat.includes("croissance") || flat.includes("gdp") || flat.includes("pib")) return { categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.CONJONCTURE };
    if (flat.includes("europe") || flat.includes("eu")) return { categorie: Categorie.EUROPE };
    return { categorie: Categorie.ECONOMIE };
  }

  private defaultSince(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
}
