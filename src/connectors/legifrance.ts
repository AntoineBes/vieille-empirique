/**
 * Connecteur Légifrance — API PISTE
 * Docs : https://developer.aife.economie.gouv.fr/
 *
 * Auth OAuth2 client_credentials (inscription gratuite PISTE)
 * Scope : openid + APIs Légifrance
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface PisteTokenResponse {
  access_token: string;
  expires_in: number;
}

interface LegifranceItem {
  id: string;
  title?: string;
  nor?: string;
  nature?: string;
  dateSignature?: string;
  dateParution?: string;
  urlLegifrance?: string;
  abstract?: string;
}

interface LegifranceSearchResponse {
  results?: LegifranceItem[];
  totalResultNumber?: number;
}

function natToType(nature?: string): TypeDocument {
  if (!nature) return TypeDocument.AUTRE;
  const n = nature.toUpperCase();
  if (n.includes("LOI")) return TypeDocument.LOI;
  if (n.includes("DECRET") || n.includes("DÉCRET")) return TypeDocument.DECRET;
  if (n.includes("ORDONNANCE")) return TypeDocument.ORDONNANCE;
  if (n.includes("ARRETE") || n.includes("ARRÊTÉ")) return TypeDocument.ARRETE;
  if (n.includes("CIRCULAIRE")) return TypeDocument.CIRCULAIRE;
  if (n.includes("QPC")) return TypeDocument.QPC;
  if (n.includes("DECISION") || n.includes("DÉCISION")) return TypeDocument.DECISION_CC;
  return TypeDocument.AUTRE;
}

function typeToClassification(type: TypeDocument): { categorie: Categorie; sous_categorie?: SousCategorie } {
  switch (type) {
    case TypeDocument.LOI:
    case TypeDocument.ORDONNANCE:
    case TypeDocument.ARRETE:
    case TypeDocument.CIRCULAIRE:
      return { categorie: Categorie.DROIT, sous_categorie: SousCategorie.LEGISLATION };
    case TypeDocument.DECRET:
      return { categorie: Categorie.DROIT, sous_categorie: SousCategorie.REGLEMENTATION };
    case TypeDocument.QPC:
    case TypeDocument.DECISION_CC:
      return { categorie: Categorie.DROIT, sous_categorie: SousCategorie.DROIT_CONSTITUTIONNEL };
    case TypeDocument.DECISION_CE:
    case TypeDocument.DECISION_CASS:
      return { categorie: Categorie.DROIT, sous_categorie: SousCategorie.JURISPRUDENCE };
    default:
      return { categorie: Categorie.DROIT };
  }
}

export class LegifranceConnector extends BaseConnector {
  readonly institution = Institution.LEGIFRANCE;

  private readonly tokenUrl = "https://sandbox-oauth.piste.gouv.fr/api/oauth/token";
  private readonly apiUrl = "https://sandbox-api.piste.gouv.fr/dila/legifrance/lf-engine-app";

  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  private async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const resp = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.PISTE_CLIENT_ID ?? "",
        client_secret: process.env.PISTE_CLIENT_SECRET ?? "",
        scope: "openid",
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) throw new Error(`PISTE token HTTP ${resp.status}`);
    const data: PisteTokenResponse = await resp.json();
    this.cachedToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.cachedToken;
  }

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const since = config.since ?? this.defaultSince();
    const max = config.maxDocuments ?? 100;
    const token = await this.getToken();

    const body = {
      recherche: {
        champs: [{ typeChamp: "ALL", operateur: "ET", criteres: [{ typeRecherche: "DATE", valeur: since.toISOString().split("T")[0], operateur: "SUPERIEUR" }] }],
        pageNumber: 1,
        pageSize: Math.min(max, 100),
        sort: "PUBLICATION_DATE_DESC",
      },
    };

    const resp = await fetch(`${this.apiUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) throw new Error(`Légifrance search HTTP ${resp.status}`);
    const data: LegifranceSearchResponse = await resp.json();

    return (data.results ?? []).map((item) => {
      const type = natToType(item.nature);
      const { categorie, sous_categorie } = typeToClassification(type);
      return {
        source_id: item.id,
        institution: Institution.LEGIFRANCE,
        titre: item.title ?? item.nor ?? item.id,
        type,
        categorie,
        sous_categorie,
        resume: item.abstract?.slice(0, 500),
        url: item.urlLegifrance ?? `https://www.legifrance.gouv.fr/jorf/id/${item.id}`,
        date_publication: new Date(item.dateParution ?? item.dateSignature ?? Date.now()),
        metadata: { nor: item.nor, nature: item.nature },
      };
    });
  }

  private defaultSince(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
}
