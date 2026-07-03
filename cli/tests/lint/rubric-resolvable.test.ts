import { describe, expect, test } from "bun:test";
import { resolve, join } from "path";
import { lintRubricReferences } from "../../src/lint/rubric-resolvable.js";
import { lint } from "../../src/lint/index.js";

// Plugin root is three levels up from cli/tests/lint/.
const PLUGIN_ROOT = resolve(import.meta.dir, "../../..");
const SKILLS_DIR = join(PLUGIN_ROOT, "skills");
// A real directory that contains the confidence rubric, used to anchor relative
// path resolution in the unit tests below.
const PERSONA_DIR = join(SKILLS_DIR, "sf-review", "references", "personas");

describe("lintRubricReferences", () => {
  test("flags a reference to a non-existent rubric path", () => {
    const filePath = join(PERSONA_DIR, "synthetic-persona.md");
    const content =
      "Use the anchored confidence rubric in `../nonexistent/subagent-confidence-rubric.md`.";
    const result = lintRubricReferences(filePath, content);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("does not resolve"))).toBe(true);
  });

  test("passes when the referenced rubric path resolves", () => {
    const filePath = join(PERSONA_DIR, "synthetic-persona.md");
    const content =
      "Use the anchored confidence rubric in `../subagent-confidence-rubric.md`.";
    const result = lintRubricReferences(filePath, content);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("flags a rubric mention that promises a location but names no file", () => {
    const filePath = join(PERSONA_DIR, "synthetic-persona.md");
    const content = "Tier findings using the confidence rubric in the review skill.";
    const result = lintRubricReferences(filePath, content);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("names no resolvable file"))).toBe(true);
  });

  test("does not flag a conceptual rubric mention with no location promise", () => {
    const filePath = join(PERSONA_DIR, "synthetic-persona.md");
    const content =
      "Deduplicate across personas (apply `sf-review`'s confidence rubric), then spot-check.";
    const result = lintRubricReferences(filePath, content);
    expect(result.ok).toBe(true);
  });

  // Regression backstop: unit U2 fixed all references to the confidence rubric,
  // so the real skills/ tree must lint clean. If this fails, a rubric/template
  // reference has drifted (the Gap-11 failure mode) and must be fixed.
  test("real skills/ tree has ZERO rubric-resolvable violations", () => {
    const report = lint(PLUGIN_ROOT);
    const rubricViolations = report.rubrics.flatMap((r) => r.violations);
    expect(rubricViolations).toEqual([]);
  });
});
