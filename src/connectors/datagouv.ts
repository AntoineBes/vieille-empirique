/**
 * Connecteur data.gouv.fr
 * API REST publique, sans authentification
 * Docs : https://doc.data.gouv.fr/api/reference/
 *
 * On filtre par organisations clés : Cour des comptes, DARES, ministères
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface DatagouvDataset {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  last_modified?: string;
  page?: string;
  organization?: { name?: string; slug?: string };
  tags?: string[];
}

interface DatagouvResponse {
  data: DatagouvDataset[];
  total?: number;
  next_page?: string | null;
}

// Organisations à surveiller — l'API data.gouv attend l'ID (pas le slug)
const ORGS: Array<{ id: string; slug: string; institution: Institution; categorie: Categorie; sous_categorie?: SousCategorie }> = [
  { id: "53698dada3a729239d20331d", slug: "cour-des-comptes", institution: Institution.COUR_DES_COMPTES, categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES },
  { id: "617a98a519a26b90337055dd", slug: "dares-statistiques-travail", institution: Institution.DARES, categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
  { id: "534fff96a3a7292c64a77fe7", slug: "ministere-de-l-economie-de-l-industrie-et-du-numerique", institution: Institution.MINISTERE_ECONOMIE, categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.FINANCES_PUBLIQUES },
  { id: "534fff96a3a7292c64a77ff4", slug: "ministere-du-travail-du-plein-emploi-et-de-l-insertion", institution: Institution.MINISTERE_TRAVAIL, categorie: Categorie.ECONOMIE, sous_categorie: SousCategorie.MARCHE_DU_TRAVAIL },
];

export class DatagouvConnector extends BaseConnector {
  readonly institution = Institution.DATA_GOUV;

  private readonly baseUrl = "https://www.data.gouv.fr/api/1";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const since = config.since ?? this.defaultSince();
    const max = config.maxDocuments ?? 200;
    const allDocs: DocumentMetadata[] = [];

    // On interroge chaque organisation séparément (tolérance aux pannes partielle)
    for (const org of ORGS) {
      try {
        const orgDocs = await this.fetchOrg(org, since, Math.floor(max / ORGS.length));
        allDocs.push(...orgDocs);
      } catch (err) {
        console.error(`[DataGouv] Erreur org ${org.slug}:`, err);
        // On continue avec les autres organisations
      }
    }

    return allDocs.slice(0, max);
  }

  private async fetchOrg(
    org: (typeof ORGS)[number],
    since: Date,
    max: number
  ): Promise<DocumentMetadata[]> {
    const url = new URL(`${this.baseUrl}/datasets/`);
    url.searchParams.set("organization", org.id);
    url.searchParams.set("sort", "-created");
    url.searchParams.set("page_size", String(Math.min(max, 100)));

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "X-Fields": "data{id,title,description,created_at,page,tags}" },
      signal: AbortSignal.timeout(20_000),
    });

    if (!resp.ok) throw new Error(`DataGouv org ${org.slug} HTTP ${resp.status}`);
    const data: DatagouvResponse = await resp.json();

    return (data.data ?? [])
      .filter((ds) => ds.created_at && new Date(ds.created_at) >= since)
      .map((ds) => ({
        source_id: ds.id,
        institution: org.institution,
        titre: ds.title,
        type: TypeDocument.JEU_DE_DONNEES,
        categorie: org.categorie,
        sous_categorie: org.sous_categorie,
        resume: ds.description?.replace(/<[^>]+>/g, "").slice(0, 500),
        url: ds.page ?? `https://www.data.gouv.fr/fr/datasets/${ds.id}/`,
        date_publication: new Date(ds.created_at!),
        metadata: { tags: ds.tags, organisation: ds.organization?.name },
      }));
  }

  private defaultSince(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
}
