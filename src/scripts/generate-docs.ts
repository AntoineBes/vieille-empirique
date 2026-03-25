/**
 * Générateur de documentation technique au format .docx
 * Usage : npm run generate:docs
 * Produit : documentation-technique.docx à la racine du projet
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  PageBreak,
} from "docx";
import { writeFileSync } from "fs";
import { resolve } from "path";

// ─── Utilitaires de création ────────────────────────

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  return new Paragraph({ heading: level, children: [new TextRun({ text, bold: true })] });
}

function h2(text: string): Paragraph {
  return heading(text, HeadingLevel.HEADING_2);
}

function h3(text: string): Paragraph {
  return heading(text, HeadingLevel.HEADING_3);
}

function para(text: string, bold = false): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, bold, size: 22 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function code(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, font: "Consolas", size: 18 })],
  });
}

function emptyLine(): Paragraph {
  return new Paragraph({ children: [] });
}

function simpleTable(headers: string[], rows: string[][]): Table {
  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
        width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA },
      })
  );

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
              width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA },
            })
        ),
      })
  );

  return new Table({
    rows: [new TableRow({ children: headerCells }), ...dataRows],
    width: { size: 9000, type: WidthType.DXA },
  });
}

// ─── Contenu du document ────────────────────────────

function buildDocument(): Document {
  return new Document({
    creator: "Veille Empirique",
    title: "Veille Empirique — Documentation technique",
    description: "Documentation technique complète du projet Veille Empirique",
    sections: [
      {
        children: [
          // ═══ PAGE DE TITRE ═══
          new Paragraph({ spacing: { before: 3000 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "VEILLE EMPIRIQUE", bold: true, size: 56, font: "Georgia" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [new TextRun({ text: "Documentation technique", italics: true, size: 32, color: "666666" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            children: [new TextRun({ text: "Agrégateur de métadonnées de publications officielles françaises", size: 24, color: "888888" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
            children: [new TextRun({ text: `Version 1.0 — ${new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}`, size: 22, color: "999999" })],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ TABLE DES MATIÈRES ═══
          heading("Table des matières"),
          para("1. Vue d'ensemble du projet"),
          para("2. Architecture technique"),
          para("3. Modèle de données (Prisma)"),
          para("4. Connecteurs de données"),
          para("5. API publique"),
          para("6. Interface utilisateur — Pages"),
          para("7. Sécurité"),
          para("8. Performance et optimisation"),
          para("9. Tests"),
          para("10. Déploiement et infrastructure"),
          para("11. GitHub Actions (Cron Jobs)"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 1. VUE D'ENSEMBLE ═══
          heading("1. Vue d'ensemble du projet"),
          emptyLine(),
          para("Veille Empirique est un outil de veille automatisée des données publiques françaises. Il agrège les métadonnées de publications officielles (lois, décrets, statistiques, rapports) depuis des APIs publiques gratuites, sans reproduire le contenu intégral."),
          emptyLine(),
          para("Objectifs :", true),
          bullet("Centraliser l'accès aux publications officielles françaises"),
          bullet("Indexer automatiquement via des connecteurs dédiés (cron jobs)"),
          bullet("Offrir une interface de recherche avec filtres complets"),
          bullet("Fournir une API publique JSON pour l'accès programmatique"),
          bullet("Fonctionner à coût zéro (free tier exclusivement)"),
          emptyLine(),
          para("Stack technique :", true),
          simpleTable(
            ["Composant", "Technologie", "Hébergement"],
            [
              ["Frontend", "Next.js 14 (App Router) + React 18", "Vercel (free tier)"],
              ["Base de données", "PostgreSQL via Prisma ORM", "Neon (free tier)"],
              ["Langage", "TypeScript (strict mode)", "—"],
              ["Styling", "Tailwind CSS 3", "—"],
              ["Cron Jobs", "GitHub Actions", "GitHub (free tier, repo public)"],
              ["Validation", "Zod", "—"],
              ["Tests", "Vitest", "—"],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 2. ARCHITECTURE ═══
          heading("2. Architecture technique"),
          emptyLine(),
          para("Le projet suit une architecture en couches :"),
          emptyLine(),
          h3("Arborescence du projet"),
          code("empirisme-veille/"),
          code("├── .github/workflows/     # Cron jobs GitHub Actions"),
          code("├── prisma/schema.prisma   # Schéma de base de données"),
          code("├── src/"),
          code("│   ├── app/               # Next.js App Router (pages + API)"),
          code("│   │   ├── page.tsx        # Accueil"),
          code("│   │   ├── loading.tsx     # Skeleton loading global"),
          code("│   │   ├── error.tsx       # Page d'erreur"),
          code("│   │   ├── not-found.tsx   # Page 404"),
          code("│   │   ├── documents/      # Liste + détail documents"),
          code("│   │   ├── statistiques/   # Vue statistiques"),
          code("│   │   ├── mentions-legales/"),
          code("│   │   ├── politique-confidentialite/"),
          code("│   │   └── api/documents/  # API REST publique"),
          code("│   ├── components/         # Composants React"),
          code("│   │   ├── NavBar.tsx      # Navigation responsive"),
          code("│   │   ├── Footer.tsx      # Pied de page"),
          code("│   │   ├── DocumentCard.tsx # Carte de document"),
          code("│   │   ├── StatsBadge.tsx  # Badge statistique"),
          code("│   │   ├── Pagination.tsx  # Pagination universelle"),
          code("│   │   └── filters/        # Composants de filtrage"),
          code("│   ├── connectors/         # Connecteurs de données"),
          code("│   │   ├── base.ts         # Classe abstraite commune"),
          code("│   │   ├── types.ts        # Interfaces"),
          code("│   │   ├── insee.ts        # Connecteur INSEE"),
          code("│   │   ├── legifrance.ts   # Connecteur Légifrance"),
          code("│   │   ├── banque-de-france.ts"),
          code("│   │   ├── datagouv.ts     # Connecteur data.gouv.fr"),
          code("│   │   └── ocde.ts         # Connecteur OCDE"),
          code("│   ├── lib/                # Utilitaires"),
          code("│   │   ├── prisma.ts       # Client Prisma singleton"),
          code("│   │   ├── env.ts          # Validation env vars"),
          code("│   │   ├── sanitize.ts     # Validation Zod + XSS"),
          code("│   │   ├── rate-limit.ts   # Rate limiter mémoire"),
          code("│   │   └── labels.ts       # Labels et formatage"),
          code("│   ├── scripts/"),
          code("│   │   ├── run-connector.ts    # CLI pour les cron jobs"),
          code("│   │   └── generate-docs.ts    # Générateur de documentation"),
          code("│   └── __tests__/          # Tests unitaires et perf"),
          code("├── next.config.js          # Config Next.js + headers sécurité"),
          code("├── tailwind.config.ts      # Design system"),
          code("├── vitest.config.ts        # Config tests"),
          code("└── vitest.perf.config.ts   # Config tests de performance"),
          emptyLine(),
          para("Flux de données :", true),
          para("1. Les GitHub Actions déclenchent les connecteurs selon un planning défini"),
          para("2. Chaque connecteur interroge son API source et retourne des DocumentMetadata"),
          para("3. La classe BaseConnector déduplique par (source_id, institution) et insère/met à jour en DB"),
          para("4. Un SyncLog est créé pour chaque exécution (statut, compteurs, durée)"),
          para("5. L'interface Next.js lit les données via Prisma avec ISR (cache revalidé périodiquement)"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 3. MODÈLE DE DONNÉES ═══
          heading("3. Modèle de données (Prisma)"),
          emptyLine(),
          h3("Table Document"),
          para("Table principale stockant les métadonnées de chaque publication indexée."),
          simpleTable(
            ["Champ", "Type", "Description"],
            [
              ["id", "String (CUID)", "Identifiant unique interne"],
              ["titre", "String", "Titre de la publication"],
              ["institution", "Institution (enum)", "Source institutionnelle (LEGIFRANCE, INSEE, etc.)"],
              ["type", "TypeDocument (enum)", "Nature du document (LOI, DECRET, RAPPORT, etc.)"],
              ["categorie", "Categorie (enum)", "Catégorie principale (DROIT, ECONOMIE, etc.)"],
              ["sous_categorie", "SousCategorie? (enum)", "Sous-catégorie optionnelle"],
              ["resume", "String? (Text)", "Résumé court (max 500 caractères)"],
              ["url", "String", "URL vers la source officielle"],
              ["source_id", "String", "Identifiant dans l'API d'origine"],
              ["date_publication", "DateTime", "Date de publication officielle"],
              ["metadata", "Json?", "Métadonnées flexibles (tags, thèmes, etc.)"],
              ["cree_le", "DateTime", "Date d'indexation (auto)"],
              ["mis_a_jour_le", "DateTime", "Date de dernière mise à jour (auto)"],
            ]
          ),
          emptyLine(),
          para("Contrainte de déduplication : @@unique([source_id, institution])"),
          para("Index : categorie, institution, type, date_publication (DESC), cree_le (DESC)"),
          emptyLine(),

          h3("Table SyncLog"),
          para("Journal de chaque exécution de synchronisation."),
          simpleTable(
            ["Champ", "Type", "Description"],
            [
              ["id", "String (CUID)", "Identifiant unique"],
              ["institution", "Institution", "Connecteur exécuté"],
              ["statut", "StatutSync", "OK, ERREUR, ou PARTIEL"],
              ["documents_trouves", "Int", "Nombre de documents retournés par l'API"],
              ["documents_inseres", "Int", "Nouveaux documents créés en DB"],
              ["documents_mis_a_jour", "Int", "Documents existants mis à jour"],
              ["erreur", "String?", "Message d'erreur si applicable"],
              ["duree_ms", "Int?", "Durée d'exécution en millisecondes"],
              ["demarre_le", "DateTime", "Horodatage de début"],
              ["termine_le", "DateTime?", "Horodatage de fin"],
            ]
          ),
          emptyLine(),

          h3("Énumérations"),
          para("Categorie : DROIT, ECONOMIE, POLITIQUE, EUROPE, SOCIETE"),
          para("SousCategorie : 26 valeurs couvrant jurisprudence, finances publiques, marché du travail, démographie, etc."),
          para("TypeDocument : 20 types (LOI, DECRET, ORDONNANCE, PUBLICATION_STATISTIQUE, RAPPORT, JEU_DE_DONNEES, etc.)"),
          para("Institution : 13 institutions (LEGIFRANCE, INSEE, BANQUE_DE_FRANCE, DATA_GOUV, OCDE, etc.)"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 4. CONNECTEURS ═══
          heading("4. Connecteurs de données"),
          emptyLine(),
          para("Chaque connecteur est une classe TypeScript qui hérite de BaseConnector. Il implémente une seule méthode : fetchDocuments(config)."),
          emptyLine(),

          h3("Architecture commune (BaseConnector)"),
          bullet("Méthode run() : orchestre fetch → déduplication → upsert → log"),
          bullet("Traitement par lots (batch de 25) pour optimiser les requêtes réseau vers Neon"),
          bullet("Déduplication automatique via (source_id, institution) — findUnique avant insert"),
          bullet("Mise à jour conditionnelle : seuls les documents dont le titre ou le résumé a changé sont mis à jour"),
          bullet("Tolérance aux pannes : les erreurs d'upsert individuelles n'interrompent pas le batch"),
          bullet("SyncLog automatique en fin d'exécution, même en cas d'erreur partielle"),
          emptyLine(),

          h3("Connecteur INSEE (insee.ts)"),
          para("Source : API catalogue INSEE (https://www.insee.fr)"),
          bullet("Récupère les publications éditoriales (Informations Rapides, Insee Première, etc.)"),
          bullet("Mapping automatique des thèmes INSEE vers la taxonomie interne (emploi→MARCHE_DU_TRAVAIL, prix→INFLATION_PRIX, etc.)"),
          bullet("Classification du type par collection (enquête, rapport, indicateur, publication statistique)"),
          bullet("Authentification : clé API Bearer optionnelle (INSEE_API_KEY)"),
          bullet("Timeout : 30 secondes"),
          emptyLine(),

          h3("Connecteur Légifrance (legifrance.ts)"),
          para("Source : API PISTE (https://developer.aife.economie.gouv.fr)"),
          bullet("Authentification OAuth2 client_credentials avec cache de token"),
          bullet("Recherche par date de publication (POST /search)"),
          bullet("Classification par nature juridique : LOI→LEGISLATION, DECRET→REGLEMENTATION, QPC→DROIT_CONSTITUTIONNEL"),
          bullet("Timeout : 30 secondes (token: 15s)"),
          emptyLine(),

          h3("Connecteur Banque de France (banque-de-france.ts)"),
          para("Source : Publications BdF (https://www.banque-france.fr)"),
          bullet("Pas d'authentification requise pour les données publiques"),
          bullet("Mapping thématique : projection→CONJONCTURE, monétaire→POLITIQUE_MONETAIRE, inflation→INFLATION_PRIX"),
          bullet("Types : BULLETIN, PROJECTION, ETUDE"),
          emptyLine(),

          h3("Connecteur data.gouv.fr (datagouv.ts)"),
          para("Source : API v1 data.gouv.fr (https://www.data.gouv.fr/api/1)"),
          bullet("Interrogation par organisation (Cour des comptes, DARES, ministères)"),
          bullet("Tolérance aux pannes par organisation : si une org échoue, les autres continuent"),
          bullet("Type unique : JEU_DE_DONNEES"),
          bullet("Pas d'authentification requise"),
          emptyLine(),

          h3("Connecteur OCDE (ocde.ts)"),
          para("Source : API iLibrary OCDE (https://www.oecd-ilibrary.org)"),
          bullet("Recherche par mot-clé 'France' avec tri par date"),
          bullet("Classification par sujets : emploi, fiscal, croissance, Europe"),
          bullet("Type unique : COMPARAISON_INTERNATIONALE"),
          emptyLine(),

          simpleTable(
            ["Connecteur", "Auth", "Fréquence cron", "Timeout"],
            [
              ["INSEE", "API Key (optionnel)", "Quotidien 06h UTC", "30s"],
              ["Légifrance", "OAuth2 PISTE", "Lun/Mer/Ven 08h UTC", "30s"],
              ["Banque de France", "Aucune", "Lundi 09h UTC", "30s"],
              ["data.gouv.fr", "Aucune", "Quotidien 07h UTC", "20s"],
              ["OCDE", "Aucune", "Mercredi 10h UTC", "30s"],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 5. API ═══
          heading("5. API publique"),
          emptyLine(),
          para("Endpoint unique : GET /api/documents"),
          para("L'API fournit un accès programmatique aux métadonnées indexées avec filtrage, pagination et cache."),
          emptyLine(),

          h3("Paramètres de requête"),
          simpleTable(
            ["Paramètre", "Type", "Description"],
            [
              ["q", "string (max 200)", "Recherche dans le titre (insensible à la casse)"],
              ["categorie", "enum", "Filtrer par catégorie (DROIT, ECONOMIE, etc.)"],
              ["institution", "enum", "Filtrer par institution (INSEE, LEGIFRANCE, etc.)"],
              ["type", "enum", "Filtrer par type de document"],
              ["sous_categorie", "enum", "Filtrer par sous-catégorie"],
              ["depuis", "YYYY-MM-DD", "Documents publiés depuis cette date"],
              ["limit", "1-100 (défaut 50)", "Nombre de résultats par page"],
              ["page", "1-1000 (défaut 1)", "Numéro de page"],
            ]
          ),
          emptyLine(),

          h3("Sécurité de l'API"),
          bullet("Validation Zod : tous les paramètres sont validés et typés avant requête DB"),
          bullet("Sanitization : les caractères HTML dangereux sont retirés du paramètre q"),
          bullet("Rate limiting : 60 requêtes/minute par IP (en mémoire, reset au cold start)"),
          bullet("Cache Vercel Edge : s-maxage=3600, stale-while-revalidate=600"),
          bullet("Headers de réponse : X-RateLimit-Remaining, Retry-After (si 429)"),
          emptyLine(),

          h3("Format de réponse"),
          code('{ "data": [...], "total": 142, "page": 1, "limit": 50, "totalPages": 3 }'),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 6. INTERFACE UTILISATEUR ═══
          heading("6. Interface utilisateur — Pages"),
          emptyLine(),
          para("Le design est inspiré d'empirisme-citoyen.fr : typographie éditoriale (serif pour les titres, sans-serif pour le corps, monospace pour les métadonnées), palette sobre avec accents par catégorie, badges avec bordure latérale colorée."),
          emptyLine(),

          h3("Page d'accueil (/)"),
          bullet("Section hero avec titre, tagline italique et compteur global"),
          bullet("Badges statistiques par catégorie avec barres de progression colorées"),
          bullet("Chips cliquables par institution (navigation rapide vers les filtres)"),
          bullet("15 derniers documents sous forme de cartes numérotées"),
          bullet("ISR : revalidation toutes les heures"),
          emptyLine(),

          h3("Page Documents (/documents)"),
          bullet("Barre de filtres complète : recherche texte, catégorie, sous-catégorie, institution, type, date"),
          bullet("La sous-catégorie s'adapte dynamiquement à la catégorie sélectionnée"),
          bullet("Pagination avec fenêtre glissante (5 pages visibles)"),
          bullet("Compteur de résultats et indicateur de page courante"),
          bullet("État vide avec message et lien de réinitialisation"),
          bullet("ISR : revalidation toutes les 30 minutes"),
          emptyLine(),

          h3("Page Détail (/documents/[id])"),
          bullet("Fil d'Ariane (Accueil > Documents > Institution)"),
          bullet("Badge catégorie + sous-catégorie"),
          bullet("Titre en typographie display, résumé en texte courant"),
          bullet("Métadonnées : institution, type, date de publication"),
          bullet("Bouton vers la source officielle"),
          bullet("5 documents similaires (même catégorie)"),
          bullet("ISR : revalidation toutes les 24 heures"),
          emptyLine(),

          h3("Page Statistiques (/statistiques)"),
          bullet("Vue d'ensemble : total documents, nombre d'institutions, nombre de catégories, couverture temporelle"),
          bullet("Barres de progression par catégorie avec couleurs dédiées"),
          bullet("Barres par institution"),
          bullet("Listes par type de document et par sous-catégorie"),
          bullet("Tableau des 20 dernières synchronisations (statut, compteurs, durée)"),
          bullet("ISR : revalidation toutes les heures"),
          emptyLine(),

          h3("Pages légales"),
          bullet("Mentions légales (/mentions-legales) : éditeur, hébergement, sources, PI"),
          bullet("Politique de confidentialité (/politique-confidentialite) : pas de cookies, pas de tracking"),
          emptyLine(),

          h3("Pages d'état"),
          bullet("Loading : skeleton animé avec structure fidèle au contenu final"),
          bullet("404 (Not Found) : message et bouton retour accueil"),
          bullet("Erreur : message, bouton réessayer, lien accueil"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 7. SÉCURITÉ ═══
          heading("7. Sécurité"),
          emptyLine(),
          h3("Headers HTTP (next.config.js)"),
          simpleTable(
            ["Header", "Valeur", "Protection"],
            [
              ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload", "Force HTTPS"],
              ["X-Frame-Options", "DENY", "Anti-clickjacking"],
              ["X-Content-Type-Options", "nosniff", "Anti-MIME sniffing"],
              ["Referrer-Policy", "strict-origin-when-cross-origin", "Fuite de referer"],
              ["Content-Security-Policy", "default-src 'self'; ...", "XSS, injection"],
              ["Permissions-Policy", "camera=(), microphone=(), geolocation=()", "Accès matériel"],
              ["X-DNS-Prefetch-Control", "on", "Performance DNS"],
            ]
          ),
          emptyLine(),

          h3("Validation des entrées"),
          bullet("Tous les paramètres API sont validés par un schéma Zod strict"),
          bullet("Les enum sont vérifiées contre des listes blanches exhaustives"),
          bullet("Le paramètre de recherche est limité à 200 caractères et nettoyé (suppression de <>'\"`;)"),
          bullet("Les dates sont validées par regex YYYY-MM-DD et par constructeur Date"),
          bullet("Les limites de pagination sont bornées (limit: 1-100, page: 1-1000)"),
          emptyLine(),

          h3("Autres mesures"),
          bullet("Rate limiting : 60 req/min par IP sur l'API"),
          bullet("poweredByHeader: false (ne pas exposer la stack)"),
          bullet("Variables d'environnement validées au démarrage (lib/env.ts)"),
          bullet("Pas de reproduction de contenu protégé (métadonnées + liens uniquement)"),
          bullet("Cache immutable sur les assets statiques (1 an)"),
          bullet("rel='noopener noreferrer' sur tous les liens externes"),
          bullet("aria-labels et skip-to-content pour l'accessibilité"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 8. PERFORMANCE ═══
          heading("8. Performance et optimisation"),
          emptyLine(),
          h3("Stratégie de cache (ISR)"),
          simpleTable(
            ["Page", "Revalidation", "Stratégie"],
            [
              ["Accueil", "1 heure", "Contenu semi-statique, données agrégées"],
              ["Documents", "30 minutes", "Résultats de recherche, filtres dynamiques"],
              ["Détail", "24 heures", "Contenu stable, rarement modifié"],
              ["Statistiques", "1 heure", "Données agrégées, coût DB modéré"],
              ["API", "1 heure", "Cache Vercel Edge + stale-while-revalidate"],
            ]
          ),
          emptyLine(),

          h3("Optimisations connecteurs"),
          bullet("Traitement par lots (batch de 25) au lieu de requêtes individuelles"),
          bullet("Promise.allSettled pour que les erreurs individuelles n'interrompent pas le lot"),
          bullet("Mise à jour conditionnelle : seuls les documents modifiés déclenchent un UPDATE"),
          bullet("Troncature des résumés à 500 caractères pour limiter le stockage"),
          bullet("Troncature des messages d'erreur à 2000 caractères en DB"),
          bullet("Timeout explicite sur tous les fetch (15-30s) via AbortSignal.timeout"),
          emptyLine(),

          h3("Optimisations base de données"),
          bullet("Index sur categorie, institution, type, date_publication (DESC)"),
          bullet("Contrainte unique composite pour la déduplication sans scan"),
          bullet("Prisma singleton avec log conditionnel (query en dev, error en prod)"),
          bullet("Select explicite sur l'API (pas de select * implicite)"),
          emptyLine(),

          h3("Optimisations frontend"),
          bullet("Next.js Google Fonts (preload, swap) pour Lora, Inter, DM Mono"),
          bullet("Skeleton loading pour la perception de vitesse"),
          bullet("line-clamp CSS pour limiter le rendu des textes longs"),
          bullet("Lazy loading implicite via Server Components"),
          bullet("Compression gzip activée (next.config.js)"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 9. TESTS ═══
          heading("9. Tests"),
          emptyLine(),
          para("Framework : Vitest 2 avec résolution d'alias @/ pour les imports."),
          emptyLine(),

          h3("Tests unitaires"),
          simpleTable(
            ["Fichier", "Couverture"],
            [
              ["__tests__/lib/sanitize.test.ts", "Sanitization XSS, échappement HTML, chaînes vides"],
              ["__tests__/lib/rate-limit.test.ts", "Autorisation, dépassement de limite, reset"],
              ["__tests__/lib/labels.test.ts", "Couverture des enums, formatDate, formatNumber"],
              ["__tests__/connectors/insee.test.ts", "Parsing, classification, erreurs HTTP, filtrage, limites, troncature"],
              ["__tests__/connectors/legifrance.test.ts", "Auth, classification juridique, erreurs token"],
            ]
          ),
          emptyLine(),

          h3("Tests de performance"),
          simpleTable(
            ["Test", "Seuil", "Description"],
            [
              ["500 publications INSEE", "< 200ms", "Parsing + classification de 500 items"],
              ["Linéarité O(n)", "ratio < 20x pour 10x items", "Vérifie que la classification ne dégénère pas"],
              ["1000 validations Zod", "< 100ms", "Débit de validation des requêtes API"],
              ["500 rejets Zod", "< 100ms", "Performance de rejet des entrées invalides"],
              ["10000 checks rate limit", "< 50ms", "Débit du rate limiter en mémoire"],
            ]
          ),
          emptyLine(),
          para("Commandes :", true),
          code("npm run test          # Tests unitaires"),
          code("npm run test:watch    # Mode watch"),
          code("npm run test:coverage # Couverture"),
          code("npm run test:perf     # Tests de performance"),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 10. DÉPLOIEMENT ═══
          heading("10. Déploiement et infrastructure"),
          emptyLine(),
          h3("Prérequis"),
          bullet("Compte Neon (dashboard.neon.tech) avec un projet PostgreSQL"),
          bullet("Compte Vercel connecté au repo GitHub"),
          bullet("Repository GitHub public (pour les 2000 min/mois de GitHub Actions)"),
          emptyLine(),

          h3("Variables d'environnement"),
          simpleTable(
            ["Variable", "Obligatoire", "Description"],
            [
              ["DATABASE_URL", "Oui", "URL PostgreSQL Neon (avec pgbouncer)"],
              ["DIRECT_URL", "Oui", "URL PostgreSQL Neon (connexion directe)"],
              ["INSEE_API_KEY", "Non", "Clé API INSEE (api.insee.fr)"],
              ["PISTE_CLIENT_ID", "Non", "Client ID PISTE (Légifrance)"],
              ["PISTE_CLIENT_SECRET", "Non", "Client Secret PISTE"],
            ]
          ),
          emptyLine(),

          h3("Procédure de déploiement"),
          para("1. Configurer les variables d'environnement dans Vercel"),
          para("2. Configurer les secrets GitHub (Settings > Secrets > Actions)"),
          para("3. Pousser sur main → Vercel build automatiquement"),
          para("4. Exécuter prisma migrate deploy en production"),
          para("5. Les GitHub Actions se déclenchent automatiquement selon le planning"),
          emptyLine(),

          h3("Estimation des coûts"),
          simpleTable(
            ["Service", "Usage estimé", "Limite free tier"],
            [
              ["Vercel", "~1000 pages/jour (ISR)", "100 GB bande passante"],
              ["Neon", "~500 Mo DB", "0.5 Go stockage, 100h compute"],
              ["GitHub Actions", "~200 min/mois (5 workflows)", "2000 min/mois (public)"],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ═══ 11. GITHUB ACTIONS ═══
          heading("11. GitHub Actions (Cron Jobs)"),
          emptyLine(),
          para("Chaque connecteur a son propre workflow pour une isolation maximale (une source qui tombe ne bloque pas les autres)."),
          emptyLine(),
          simpleTable(
            ["Workflow", "Cron", "Timeout", "Variables requises"],
            [
              ["fetch-insee.yml", "0 6 * * * (quotidien 6h)", "10 min", "DATABASE_URL, DIRECT_URL, INSEE_API_KEY"],
              ["fetch-legifrance.yml", "0 8 * * 1,3,5 (L/M/V 8h)", "10 min", "DATABASE_URL, DIRECT_URL, PISTE_CLIENT_ID, PISTE_CLIENT_SECRET"],
              ["fetch-banque-de-france.yml", "0 9 * * 1 (lundi 9h)", "10 min", "DATABASE_URL, DIRECT_URL"],
              ["fetch-datagouv.yml", "0 7 * * * (quotidien 7h)", "15 min", "DATABASE_URL, DIRECT_URL"],
              ["fetch-ocde.yml", "0 10 * * 3 (mercredi 10h)", "10 min", "DATABASE_URL, DIRECT_URL"],
            ]
          ),
          emptyLine(),
          para("Chaque workflow :"),
          bullet("Supporte le déclenchement manuel (workflow_dispatch)"),
          bullet("Utilise Node 20 avec cache npm"),
          bullet("Exécute prisma generate avant la synchronisation"),
          bullet("Sort avec exit code 1 en cas d'erreur (visible dans l'onglet Actions)"),
          emptyLine(),
          para("Budget estimé : ~5 workflows × ~3 min/run × fréquence = environ 200 min/mois, soit 10% du free tier."),
        ],
      },
    ],
  });
}

// ─── Génération ─────────────────────────────────────

async function main() {
  console.log("Génération de la documentation technique...");
  const doc = buildDocument();
  const buffer = await Packer.toBuffer(doc);
  const outputPath = resolve(__dirname, "../../documentation-technique.docx");
  writeFileSync(outputPath, buffer);
  console.log(`Documentation générée : ${outputPath}`);
}

main().catch((err) => {
  console.error("Erreur lors de la génération :", err);
  process.exit(1);
});
