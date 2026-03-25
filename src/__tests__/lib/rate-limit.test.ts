import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("autorise la première requête", () => {
    const result = checkRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("autorise plusieurs requêtes sous la limite", () => {
    const ip = "test-ip-burst-" + Date.now();
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    }
  });

  it("bloque au-delà de la limite", () => {
    const ip = "test-ip-exceed-" + Date.now();
    // Envoyer 61 requêtes (limite = 60)
    for (let i = 0; i < 60; i++) {
      checkRateLimit(ip);
    }
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("retourne un resetAt dans le futur", () => {
    const result = checkRateLimit("test-ip-reset-" + Date.now());
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
