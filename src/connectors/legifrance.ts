/**
 * Connecteur Légifrance — API PISTE (production)
 * Docs : https://developer.aife.economie.gouv.fr/
 *
 * Auth OAuth2 client_credentials
 * Endpoint : /consult/lastNJo pour les derniers JO
 *            /search avec fond=JORF pour la recherche
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface PisteTokenResponse {
  access_token: string;
  expires_in: number;
}

interface JorfTextItem {
  id?: string;
  cid?: string;
  title?: string;
  titre?: string;
  nor?: string;
  nature?: string;
  dateSignature?: string;
  dateParution?: string;
  datePubli?: string;
}

interface JorfSearchResult {
  results?: Array<{
    titles?: Array<{ id?: string; cid?: string; title?: string; nor?: string; nature?: string; dateSignature?: string; datePubli?: string }>;
  }>;
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

  // Production PISTE URLs
  private readonly tokenUrl = "https://oauth.piste.gouv.fr/api/oauth/token";
  private readonly apiUrl = "https://api.piste.gouv.fr/dila/legifrance/lf-engine-app";

  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  private async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const clientId = process.env.PISTE_CLIENT_ID;
    const clientSecret = process.env.PISTE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("PISTE_CLIENT_ID et PISTE_CLIENT_SECRET requis pour Légifrance");
    }

    const resp = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "openid",
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`PISTE token HTTP ${resp.status}: ${text.slice(0, 200)}`);
    }

    const data: PisteTokenResponse = await resp.json();
    this.cachedToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.cachedToken;
  }

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const since = config.since ?? this.defaultSince();
    const max = config.maxDocuments ?? 100;
    const token = await this.getToken();

    const sinceStr = since.toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

    // Recherche JORF avec filtre date
    const body = {
      fond: "JORF",
      recherche: {
        champs: [
          {
            typeChamp: "ALL",
            criteres: [
              {
                typeRecherche: "UN_DES_MOTS",
                valeur: "*",
                operateur: "ET",
              },
            ],
            operateur: "ET",
          },
        ],
        filtres: [
          {
            facette: "DATE_SIGNATURE",
            dates: {
              start: sinceStr,
              end: todayStr,
            },
          },
        ],
        operateur: "ET",
        pageNumber: 1,
        pageSize: Math.min(max, 100),
        sort: "SIGNATURE_DATE_DESC",
        typePagination: "DEFAUT",
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

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Légifrance search HTTP ${resp.status}: ${text.slice(0, 200)}`);
    }

    const data: JorfSearchResult = await resp.json();
    const docs: DocumentMetadata[] = [];

    for (const result of data.results ?? []) {
      for (const item of result.titles ?? []) {
        const id = item.cid ?? item.id;
        if (!id) continue;

        const type = natToType(item.nature);
        const { categorie, sous_categorie } = typeToClassification(type);

        docs.push({
          source_id: id,
          institution: Institution.LEGIFRANCE,
          titre: item.title ?? item.nor ?? id,
          type,
          categorie,
          sous_categorie,
          url: `https://www.legifrance.gouv.fr/jorf/id/${id}`,
          date_publication: new Date(item.dateSignature ?? item.datePubli ?? Date.now()),
          metadata: { nor: item.nor, nature: item.nature },
        });
      }
    }

    console.log(`[Légifrance] ${docs.length} textes JORF récupérés`);
    return docs.slice(0, max);
  }

  private defaultSince(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
}
