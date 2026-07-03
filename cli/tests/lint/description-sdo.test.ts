import { describe, expect, test } from "bun:test";
import { lintDescription } from "../../src/lint/description-sdo.js";

describe("lintDescription", () => {
  test("flags step-count phrasing", () => {
    const result = lintDescription(
      "sf-example",
      "Runs the 5-step review pipeline for you.",
    );
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain("sf-example");
    expect(result.violations[0]).toContain("5-step");
  });

  test('flags the word "checklist"', () => {
    const result = lintDescription(
      "sf-example",
      "Walks a checklist of review concerns.",
    );
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.toLowerCase().includes("checklist"))).toBe(true);
  });

  test("flags plural 'N steps' and 'N phases'", () => {
    expect(lintDescription("s", "Do 3 steps.").ok).toBe(false);
    expect(lintDescription("s", "Runs 2 phases.").ok).toBe(false);
  });

  test("passes a clean trigger-only description", () => {
    const result = lintDescription(
      "sf-review",
      "Review a pull request for bugs. Trigger phrases: 'review this', 'check my code', 'find bugs'.",
    );
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("handles undefined description", () => {
    const result = lintDescription("sf-empty", undefined);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
