import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "test-id" }),
      update: vi.fn(),
    },
    syncLog: {
      create: vi.fn(),
    },
  },
}));

import { InseeConnector } from "@/connectors/insee";

const MOCK_DATAFLOW_XML = `<?xml version="1.0" encoding="UTF-8"?>
<mes:Structure xmlns:mes="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message"
               xmlns:com="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/common"
               xmlns:str="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/structure">
  <mes:Structures>
    <str:Dataflows>
      <str:Dataflow id="CHOMAGE-TRIM-NATIONAL" agencyID="FR1" version="1.0">
        <com:Annotations>
          <com:Annotation>
            <com:AnnotationURL>https://www.insee.fr/fr/statistiques/series/103167923</com:AnnotationURL>
          </com:Annotation>
          <com:Annotation>
            <com:AnnotationText xml:lang="fr">Nombre de séries : 169</com:AnnotationText>
          </com:Annotation>
        </com:Annotations>
        <com:Name xml:lang="fr">Chômage, taux de chômage par sexe et âge (sens BIT)</com:Name>
        <com:Name xml:lang="en">Unemployment, unemployment rate by sex and age (ILO)</com:Name>
        <str:Structure>
          <Ref id="CHOMAGE-TRIM-NATIONAL" version="1.0" agencyID="FR1"/>
        </str:Structure>
      </str:Dataflow>
      <str:Dataflow id="IPC-2015" agencyID="FR1" version="1.0">
        <com:Annotations>
          <com:Annotation>
            <com:AnnotationURL>https://www.insee.fr/fr/statistiques/series/102769074</com:AnnotationURL>
          </com:Annotation>
          <com:Annotation>
            <com:AnnotationText xml:lang="fr">Nombre de séries : 1544</com:AnnotationText>
          </com:Annotation>
        </com:Annotations>
        <com:Name xml:lang="fr">Indice des prix à la consommation</com:Name>
        <com:Name xml:lang="en">Consumer price index</com:Name>
        <str:Structure>
          <Ref id="IPC-2015" version="1.0" agencyID="FR1"/>
        </str:Structure>
      </str:Dataflow>
      <str:Dataflow id="CONSTRUCTION-LOGEMENTS" agencyID="FR1" version="1.0">
        <com:Annotations>
          <com:Annotation>
            <com:AnnotationURL>https://www.insee.fr/fr/statistiques/series/102345678</com:AnnotationURL>
          </com:Annotation>
        </com:Annotations>
        <com:Name xml:lang="fr">Construction de logements</com:Name>
        <str:Structure>
          <Ref id="CONSTRUCTION-LOGEMENTS" version="1.0" agencyID="FR1"/>
        </str:Structure>
      </str:Dataflow>
      <str:Dataflow id="NO-URL-DATAFLOW" agencyID="FR1" version="1.0">
        <com:Name xml:lang="fr">Dataflow sans URL</com:Name>
        <str:Structure>
          <Ref id="NO-URL-DATAFLOW" version="1.0" agencyID="FR1"/>
        </str:Structure>
      </str:Dataflow>
    </str:Dataflows>
  </mes:Structures>
</mes:Structure>`;

describe("InseeConnector", () => {
  let connector: InseeConnector;

  beforeEach(() => {
    connector = new InseeConnector();
    vi.clearAllMocks();
  });

  it("a la bonne institution", () => {
    expect(connector.institution).toBe("INSEE");
  });

  it("parse correctement les dataflows BDM XML", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => MOCK_DATAFLOW_XML,
    });

    const docs = await connector.fetch();

    // 3 dataflows avec URL (le 4e n'a pas d'URL, filtré)
    expect(docs.length).toBe(3);
    expect(docs[0].institution).toBe("INSEE");
    expect(docs[0].source_id).toBe("BDM-CHOMAGE-TRIM-NATIONAL");
    expect(docs[0].titre).toBe("Chômage, taux de chômage par sexe et âge (sens BIT)");
    expect(docs[0].categorie).toBe("ECONOMIE");
    expect(docs[0].sous_categorie).toBe("MARCHE_DU_TRAVAIL");
    expect(docs[0].type).toBe("INDICATEUR");
    expect(docs[0].url).toBe("https://www.insee.fr/fr/statistiques/series/103167923");
  });

  it("classe correctement les indices de prix", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => MOCK_DATAFLOW_XML,
    });

    const docs = await connector.fetch();
    const ipc = docs.find((d) => d.source_id === "BDM-IPC-2015");
    expect(ipc).toBeDefined();
    expect(ipc!.categorie).toBe("ECONOMIE");
    expect(ipc!.sous_categorie).toBe("INFLATION_PRIX");
  });

  it("classe correctement la construction/logement", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => MOCK_DATAFLOW_XML,
    });

    const docs = await connector.fetch();
    const construction = docs.find((d) => d.source_id === "BDM-CONSTRUCTION-LOGEMENTS");
    expect(construction).toBeDefined();
    expect(construction!.categorie).toBe("SOCIETE");
    expect(construction!.sous_categorie).toBe("LOGEMENT");
  });

  it("filtre les dataflows sans URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => MOCK_DATAFLOW_XML,
    });

    const docs = await connector.fetch();
    const noUrl = docs.find((d) => d.source_id === "BDM-NO-URL-DATAFLOW");
    expect(noUrl).toBeUndefined();
  });

  it("gère les erreurs HTTP correctement", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });

    await expect(connector.fetch()).rejects.toThrow("INSEE BDM HTTP 503");
  });

  it("respecte la limite maxDocuments", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => MOCK_DATAFLOW_XML,
    });

    const docs = await connector.fetch({ maxDocuments: 2 });
    expect(docs.length).toBeLessThanOrEqual(2);
  });

  it("inclut le résumé anglais et le nombre de séries", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => MOCK_DATAFLOW_XML,
    });

    const docs = await connector.fetch();
    const chomage = docs[0];
    expect(chomage.resume).toContain("Unemployment");
    expect(chomage.resume).toContain("169");
  });
});
