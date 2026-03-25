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

import { LegifranceConnector } from "@/connectors/legifrance";

describe("LegifranceConnector", () => {
  let connector: LegifranceConnector;

  beforeEach(() => {
    connector = new LegifranceConnector();
    vi.clearAllMocks();
    process.env.PISTE_CLIENT_ID = "test-client-id";
    process.env.PISTE_CLIENT_SECRET = "test-client-secret";
  });

  it("a la bonne institution", () => {
    expect(connector.institution).toBe("LEGIFRANCE");
  });

  it("classe correctement les lois", async () => {
    // Mock token
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "test-token", expires_in: 3600 }),
    });

    // Mock search — nouveau format avec results[].titles[]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            titles: [
              {
                cid: "LOI-2024-001",
                title: "LOI n° 2024-001 relative aux finances",
                nature: "LOI",
                dateSignature: new Date().toISOString(),
              },
              {
                cid: "DEC-2024-001",
                title: "Décret n° 2024-001",
                nature: "DECRET",
                dateSignature: new Date().toISOString(),
              },
            ],
          },
        ],
      }),
    });

    const docs = await connector.fetch();

    expect(docs.length).toBe(2);
    expect(docs[0].type).toBe("LOI");
    expect(docs[0].categorie).toBe("DROIT");
    expect(docs[0].sous_categorie).toBe("LEGISLATION");
    expect(docs[1].type).toBe("DECRET");
    expect(docs[1].sous_categorie).toBe("REGLEMENTATION");
  });

  it("gère les erreurs d'authentification", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(connector.fetch()).rejects.toThrow("PISTE token HTTP 401");
  });
});
