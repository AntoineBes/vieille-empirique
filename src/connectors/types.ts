import type { Categorie, SousCategorie, TypeDocument, Institution } from "@prisma/client";

// ─────────────────────────────────────────
// Interface commune à tous les connecteurs
// ─────────────────────────────────────────

export interface DocumentMetadata {
  titre: string;
  institution: Institution;
  type: TypeDocument;
  categorie: Categorie;
  sous_categorie?: SousCategorie;
  resume?: string;
  url: string;
  source_id: string;
  date_publication: Date;
  metadata?: Record<string, unknown>;
}

export interface SyncResult {
  institution: Institution;
  documents_trouves: number;
  documents_inseres: number;
  documents_mis_a_jour: number;
  erreur?: string;
  duree_ms: number;
}

export interface ConnectorConfig {
  /** Nombre max de documents à récupérer par run (évite dépassement free tier) */
  maxDocuments?: number;
  /** Récupérer depuis cette date (défaut : 30 derniers jours) */
  since?: Date;
}

export interface Connector {
  readonly institution: Institution;
  fetch(config?: ConnectorConfig): Promise<DocumentMetadata[]>;
}
