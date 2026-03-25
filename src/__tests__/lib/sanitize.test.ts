import { describe, it, expect } from "vitest";
import { sanitizeText } from "@/lib/sanitize";

describe("sanitizeText", () => {
  it("échappe les caractères HTML dangereux", () => {
    expect(sanitizeText("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
    );
  });

  it("échappe les guillemets doubles", () => {
    expect(sanitizeText('test "value"')).toBe("test &quot;value&quot;");
  });

  it("échappe les esperluettes", () => {
    expect(sanitizeText("A & B")).toBe("A &amp; B");
  });

  it("laisse le texte normal intact", () => {
    expect(sanitizeText("Loi n° 2024-123 du 15 mars 2024")).toBe(
      "Loi n° 2024-123 du 15 mars 2024"
    );
  });

  it("gère les chaînes vides", () => {
    expect(sanitizeText("")).toBe("");
  });
});
