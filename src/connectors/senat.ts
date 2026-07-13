/**
 * Connecteur Sénat — RSS officiel (rapports)
 * URL : https://www.senat.fr/rss/rapports.xml
 *
 * Le RSS est un canal de diffusion volontaire du Sénat.
 * Les datasets open data sont récupérés séparément via le connecteur data.gouv.fr.
 */

import { BaseConnector } from "./base";
import type { ConnectorConfig, DocumentMetadata } from "./types";
import { Categorie, Institution, SousCategorie, TypeDocument } from "@prisma/client";

export class SenatConnector extends BaseConnector {
  readonly institution = Institution.SENAT;

  private readonly rssUrl = "https://www.senat.fr/rss/rapports.xml";

  protected async fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]> {
    const max = config.maxDocuments ?? 100;

    const resp = await fetch(this.rssUrl, {
      headers: { Accept: "application/xml", "User-Agent": "VeilleEmpirique/1.0" },
      signal: AbortSignal.timeout(20_000),
    });

    if (!resp.ok) throw new Error(`Sénat RSS HTTP ${resp.status}`);

    const xml = await resp.text();
    const docs = this.parseRss(xml);

    console.log(`[Sénat] ${docs.length} rapports RSS récupérés`);
    return docs.slice(0, max);
  }

  private parseRss(xml: string): DocumentMetadata[] {
    const docs: DocumentMetadata[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
      const link = block.match(/<link>(.*?)<\/link>/)?.[1]?.trim();
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
      const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim();

      if (!title || !link) continue;

      const id = link.replace(/[^a-zA-Z0-9]/g, "-").slice(-80);

      docs.push({
        source_id: `SENAT-RSS-${id}`,
        institution: Institution.SENAT,
        titre: title,
        type: TypeDocument.RAPPORT,
        categorie: Categorie.POLITIQUE,
        sous_categorie: SousCategorie.INSTITUTIONS,
        resume: description?.replace(/<[^>]+>/g, "").slice(0, 500),
        url: link,
        date_publication: pubDate ? new Date(pubDate) : new Date(),
        metadata: { source: "rss" },
      });
    }

    return docs;
  }
}
