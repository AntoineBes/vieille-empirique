/**
 * Tests de performance des connecteurs
 * Vérifie que le parsing et la classification restent performants
 */

import { describe, it, expect, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "id" }),
      update: vi.fn(),
    },
    syncLog: { create: vi.fn() },
  },
}));

import { InseeConnector } from "@/connectors/insee";

function generateMockDataflowXml(count: number): string {
  let dataflows = "";
  const themes = ["CHOMAGE", "IPC", "PIB", "EMPLOI", "CONSTRUCTION", "POPULATION", "BALANCE", "CLIMAT"];
  for (let i = 0; i < count; i++) {
    const theme = themes[i % themes.length];
    dataflows += `
      <str:Dataflow id="${theme}-PERF-${i}" agencyID="FR1" version="1.0">
        <com:Annotations>
          <com:Annotation>
            <com:AnnotationURL>https://www.insee.fr/fr/statistiques/series/${100000 + i}</com:AnnotationURL>
          </com:Annotation>
          <com:Annotation>
            <com:AnnotationText xml:lang="fr">Nombre de séries : ${Math.floor(Math.random() * 5000)}</com:AnnotationText>
          </com:Annotation>
        </com:Annotations>
        <com:Name xml:lang="fr">Série de performance ${theme} numéro ${i}</com:Name>
        <com:Name xml:lang="en">Performance series ${theme} number ${i}</com:Name>
        <str:Structure>
          <Ref id="${theme}-PERF-${i}" version="1.0" agencyID="FR1"/>
        </str:Structure>
      </str:Dataflow>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<mes:Structure xmlns:mes="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message"
               xmlns:com="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/common"
               xmlns:str="http://www.sdmx.org/resources/sdmxml/schemas/v2_1/structure">
  <mes:Structures>
    <str:Dataflows>${dataflows}</str:Dataflows>
  </mes:Structures>
</mes:Structure>`;
}

describe("Performance — Connecteurs", () => {
  it("parse 500 dataflows BDM XML en moins de 500ms", async () => {
    const xml = generateMockDataflowXml(500);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => xml,
    });

    const connector = new InseeConnector();
    const start = performance.now();
    const docs = await connector.fetch({ maxDocuments: 500 });
    const duration = performance.now() - start;

    expect(docs.length).toBe(500);
    expect(duration).toBeLessThan(500);
    console.log(`[PERF] 500 dataflows BDM parsés en ${duration.toFixed(1)}ms`);
  });

  it("la classification est O(n) linéaire", async () => {
    const xml100 = generateMockDataflowXml(100);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => xml100,
    });
    const connector1 = new InseeConnector();
    const start1 = performance.now();
    await connector1.fetch({ maxDocuments: 100 });
    const time100 = performance.now() - start1;

    const xml1000 = generateMockDataflowXml(1000);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => xml1000,
    });
    const connector2 = new InseeConnector();
    const start2 = performance.now();
    await connector2.fetch({ maxDocuments: 1000 });
    const time1000 = performance.now() - start2;

    const ratio = time1000 / time100;
    expect(ratio).toBeLessThan(20);
    console.log(`[PERF] Ratio 1000/100 dataflows: ${ratio.toFixed(1)}x (linéaire attendu ~10x)`);
  });
});
