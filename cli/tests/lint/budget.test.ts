import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { lintBudgets } from "../../src/lint/budget.js";

const PLUGIN_ROOT = resolve(import.meta.dir, "../../..");

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "sfce-budget-lint-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function skill(name: string, description: string, body = "") {
  mkdirSync(join(dir, "skills", name), { recursive: true });
  writeFileSync(join(dir, "skills", name, "SKILL.md"), `---\nname: ${name}\ndescription: "${description}"\n---\n${body}`);
}

describe("lintBudgets", () => {
  test("the real plugin is within budget", () => {
    expect(lintBudgets(PLUGIN_ROOT).violations).toEqual([]);
  });

  test("flags a long description", () => {
    skill("sf-x", "a".repeat(251));
    expect(lintBudgets(dir).violations.some((v) => v.includes("description is 251"))).toBe(true);
  });

  test("flags an oversized SKILL.md", () => {
    skill("sf-x", "short", "b".repeat(8001));
    expect(lintBudgets(dir).violations.some((v) => v.includes("SKILL.md is"))).toBe(true);
  });

  test("flags an oversized lens", () => {
    skill("sf-review", "short");
    mkdirSync(join(dir, "skills", "sf-review", "references", "lenses"), { recursive: true });
    writeFileSync(join(dir, "skills", "sf-review", "references", "lenses", "apex.md"), "c".repeat(3501));
    expect(lintBudgets(dir).violations).toEqual(["lens apex.md is 3501 bytes (budget 3500)"]);
  });
});
