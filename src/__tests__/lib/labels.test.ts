import { describe, it, expect } from "vitest";
import {
  CATEGORIE_LABELS,
  INSTITUTION_LABELS,
  TYPE_LABELS,
  SOUS_CATEGORIE_LABELS,
  SOUS_CATEGORIES_PAR_CATEGORIE,
  formatDate,
  formatNumber,
} from "@/lib/labels";

describe("Labels", () => {
  it("couvre toutes les catégories", () => {
    const expected = ["DROIT", "ECONOMIE", "POLITIQUE", "EUROPE", "SOCIETE"];
    for (const cat of expected) {
      expect(CATEGORIE_LABELS[cat]).toBeDefined();
    }
  });

  it("couvre toutes les institutions", () => {
    const expected = ["LEGIFRANCE", "INSEE", "BANQUE_DE_FRANCE", "DATA_GOUV", "OCDE"];
    for (const inst of expected) {
      expect(INSTITUTION_LABELS[inst]).toBeDefined();
    }
  });

  it("toutes les sous-catégories sont dans un groupe parent", () => {
    const allSubs = Object.values(SOUS_CATEGORIES_PAR_CATEGORIE).flat();
    for (const sub of Object.keys(SOUS_CATEGORIE_LABELS)) {
      expect(allSubs).toContain(sub);
    }
  });
});

describe("formatDate", () => {
  it("formate une date en mode court", () => {
    const result = formatDate(new Date("2024-03-15"), "short");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("formate une date en mode long", () => {
    const result = formatDate(new Date("2024-03-15"), "long");
    expect(result).toContain("2024");
    expect(result.toLowerCase()).toContain("mars");
  });

  it("accepte une chaîne ISO", () => {
    const result = formatDate("2024-01-01T00:00:00Z", "short");
    expect(result).toBeTruthy();
  });
});

describe("formatNumber", () => {
  it("formate les grands nombres avec séparateur", () => {
    // French locale uses non-breaking space as thousands separator
    const result = formatNumber(1234567);
    expect(result).toMatch(/1.*234.*567/);
  });

  it("formate zéro", () => {
    expect(formatNumber(0)).toBe("0");
  });
});
