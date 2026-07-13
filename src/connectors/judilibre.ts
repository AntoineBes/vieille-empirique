/**
 * Connecteur Judilibre — API Cour de cassation v1
 * Base : https://api.courdecassation.fr/v1
 *
 * Auth : clé API (inscription gratuite sur le portail Judilibre)
 * Récupère les décisions récentes de principe.
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

interface JudilibreDecision {
  id?: string;
  number?: string;
  ecli?: string;
  chamber?: string;
  formation?: string;
  solution?: string;
  text?: string;
  date?: string;
  themes?: string[];
  summary?: string;
  jurisdiction?: string;
}

interface JudilibreResponse {
  results?: JudilibreDecision[];
  total?: number;
  next_batch?: string;
}

export class JudilibreConnector extends BaseConnector {
  readonly institution = Institution.COUR_DE_CASSATION;

  private readonly baseUrl = "https://api.courdecassation.fr/v1";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const apiKey = process.env.JUDILIBRE_API_KEY;
    if (!apiKey) {
      throw new Error("JUDILIBRE_API_KEY requis — inscription gratuite sur https://www.courdecassation.fr/acces-rapide-judilibre");
    }

    const since = config.since ?? this.defaultSince();
    const max = config.maxDocuments ?? 100;
    const docs: DocumentMetadata[] = [];

    const sinceStr = since.toISOString().split("T")[0];

    try {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.set("date_start", sinceStr);
      url.searchParams.set("order", "desc");
      url.searchParams.set("pageSize", String(Math.min(max, 50)));
      url.searchParams.set("type", "cc"); // Cour de cassation uniquement

      const resp = await fetch(url.toString(), {
        headers: {
          "KeyId": apiKey,
          Accept: "application/json",
          "User-Agent": "VeilleEmpirique/1.0",
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Judilibre HTTP ${resp.status}: ${text.slice(0, 200)}`);
      }

      const data: JudilibreResponse = await resp.json();

      for (const dec of data.results ?? []) {
        const id = dec.id ?? dec.ecli ?? dec.number;
        if (!id) continue;

        const { sous_categorie } = this.classifyDecision(dec);

        docs.push({
          source_id: `JUDILIBRE-${id}`,
          institution: Institution.COUR_DE_CASSATION,
          titre: this.buildTitle(dec),
          type: TypeDocument.DECISION_CASS,
          categorie: Categorie.DROIT,
          sous_categorie,
          resume: dec.summary?.slice(0, 500),
          url: `https://www.courdecassation.fr/decision/${dec.id ?? dec.ecli}`,
          date_publication: dec.date ? new Date(dec.date) : new Date(),
          metadata: {
            ecli: dec.ecli,
            chamber: dec.chamber,
            formation: dec.formation,
            solution: dec.solution,
            themes: dec.themes,
          },
        });
      }
    } catch (err) {
      console.error("[Judilibre] Erreur:", err instanceof Error ? err.message : err);
      throw err;
    }

    console.log(`[Judilibre] ${docs.length} décisions récupérées`);
    return docs.slice(0, max);
  }

  private buildTitle(dec: JudilibreDecision): string {
    const parts: string[] = [];
    if (dec.chamber) parts.push(dec.chamber);
    if (dec.date) parts.push(dec.date);
    if (dec.number) parts.push(`n°${dec.number}`);
    return parts.length > 0 ? parts.join(", ") : dec.ecli ?? dec.id ?? "Décision";
  }

  private classifyDecision(dec: JudilibreDecision): { sous_categorie: SousCategorie } {
    const text = ((dec.themes ?? []).join(" ") + " " + (dec.summary ?? "")).toLowerCase();
    if (text.includes("social") || text.includes("travail") || text.includes("licenciement")) return { sous_categorie: SousCategorie.DROIT_SOCIAL };
    if (text.includes("fiscal") || text.includes("impôt") || text.includes("taxe")) return { sous_categorie: SousCategorie.DROIT_FISCAL };
    if (text.includes("constit")) return { sous_categorie: SousCategorie.DROIT_CONSTITUTIONNEL };
    return { sous_categorie: SousCategorie.JURISPRUDENCE };
  }

  private defaultSince(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d;
  }
}
