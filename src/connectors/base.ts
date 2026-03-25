import { prisma } from "@/lib/prisma";
import type { Institution } from "@prisma/client";
import type { Connector, ConnectorConfig, DocumentMetadata, SyncResult } from "./types";

// ─────────────────────────────────────────
// Classe de base : orchestre le fetch + upsert + log
// Chaque connecteur hérite de cette classe et implémente fetchDocuments()
// ─────────────────────────────────────────

const BATCH_SIZE = 25;

export abstract class BaseConnector implements Connector {
  abstract readonly institution: Institution;
  protected abstract fetchDocuments(config: ConnectorConfig): Promise<DocumentMetadata[]>;

  async fetch(config: ConnectorConfig = {}): Promise<DocumentMetadata[]> {
    return this.fetchDocuments(config);
  }

  async run(config: ConnectorConfig = {}): Promise<SyncResult> {
    const debut = Date.now();
    let documents_inseres = 0;
    let documents_mis_a_jour = 0;
    let documents_trouves = 0;
    let erreur: string | undefined;

    try {
      const docs = await this.fetchDocuments(config);
      documents_trouves = docs.length;

      // Traitement par lots pour optimiser les performances réseau vers Neon
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((doc) => this.upsertDocument(doc))
        );

        for (const result of results) {
          if (result.status === "fulfilled") {
            if (result.value === "inserted") documents_inseres++;
            else if (result.value === "updated") documents_mis_a_jour++;
          } else {
            console.error(`[${this.institution}] Erreur upsert :`, result.reason);
          }
        }
      }
    } catch (err) {
      erreur = err instanceof Error ? err.message : String(err);
      console.error(`[${this.institution}] Erreur :`, erreur);
    }

    const duree_ms = Date.now() - debut;

    // Log de synchronisation en DB
    try {
      await prisma.syncLog.create({
        data: {
          institution: this.institution,
          statut: erreur ? (documents_inseres > 0 ? "PARTIEL" : "ERREUR") : "OK",
          documents_trouves,
          documents_inseres,
          documents_mis_a_jour,
          erreur: erreur?.slice(0, 2000), // Limiter la taille de l'erreur en DB
          duree_ms,
          termine_le: new Date(),
        },
      });
    } catch (logErr) {
      console.error(`[${this.institution}] Erreur log sync :`, logErr);
    }

    return {
      institution: this.institution,
      documents_trouves,
      documents_inseres,
      documents_mis_a_jour,
      erreur,
      duree_ms,
    };
  }

  /**
   * Upsert un document unique avec déduplication par source_id + institution
   */
  private async upsertDocument(
    doc: DocumentMetadata
  ): Promise<"inserted" | "updated" | "skipped"> {
    const existing = await prisma.document.findUnique({
      where: {
        source_id_institution: {
          source_id: doc.source_id,
          institution: doc.institution,
        },
      },
      select: { id: true, titre: true, resume: true },
    });

    if (!existing) {
      await prisma.document.create({
        data: {
          ...doc,
          metadata: doc.metadata as any ?? undefined,
        },
      });
      return "inserted";
    }

    // Met à jour seulement si le contenu a changé (évite writes inutiles)
    if (existing.titre !== doc.titre || existing.resume !== doc.resume) {
      await prisma.document.update({
        where: { id: existing.id },
        data: {
          titre: doc.titre,
          resume: doc.resume,
          url: doc.url,
          mis_a_jour_le: new Date(),
        },
      });
      return "updated";
    }

    return "skipped";
  }
}
