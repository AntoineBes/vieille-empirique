/**
 * Tests de performance pour la validation API
 * Vérifie que la validation Zod reste rapide sous charge
 */

import { describe, it, expect } from "vitest";

// Import direct du schéma (pas besoin de mock)
// Note: zod doit être installé pour ces tests
describe("Performance — Validation API", () => {
  it("valide 1000 requêtes de recherche en moins de 100ms", async () => {
    // Import dynamique car zod peut ne pas être installé
    const { searchParamsSchema } = await import("@/lib/sanitize");

    const testCases = Array.from({ length: 1000 }, (_, i) => ({
      q: `recherche test ${i}`,
      categorie: i % 2 === 0 ? "ECONOMIE" : "DROIT",
      institution: "INSEE",
      page: String(Math.ceil(Math.random() * 10)),
      limit: "25",
    }));

    const start = performance.now();
    for (const params of testCases) {
      searchParamsSchema.safeParse(params);
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    console.log(`[PERF] 1000 validations Zod en ${duration.toFixed(1)}ms`);
  });

  it("rejette rapidement les entrées invalides", async () => {
    const { searchParamsSchema } = await import("@/lib/sanitize");

    const invalidCases = Array.from({ length: 500 }, () => ({
      q: "<script>alert('xss')</script>".repeat(10),
      categorie: "INVALID_CATEGORY",
      page: "-5",
      limit: "99999",
    }));

    const start = performance.now();
    let rejected = 0;
    for (const params of invalidCases) {
      const result = searchParamsSchema.safeParse(params);
      if (!result.success) rejected++;
    }
    const duration = performance.now() - start;

    expect(rejected).toBe(500);
    expect(duration).toBeLessThan(100);
    console.log(`[PERF] 500 rejets de validation en ${duration.toFixed(1)}ms`);
  });
});

describe("Performance — Rate Limiter", () => {
  it("gère 10000 vérifications en moins de 50ms", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");

    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      checkRateLimit(`perf-ip-${i % 100}`);
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
    console.log(`[PERF] 10000 checks rate limit en ${duration.toFixed(1)}ms`);
  });
});
