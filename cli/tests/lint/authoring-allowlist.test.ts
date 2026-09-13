import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { lintAuthoringAllowlist } from "../../src/lint/authoring-allowlist.js";
import { lint } from "../../src/lint/index.js";

const PLUGIN_ROOT = resolve(import.meta.dir, "../../..");

/** Build a throwaway plugin tree: named skills plus the two hook data files. */
function fixture(opts: {
  skills: string[];
  allowlist?: string;
  routing?: string;
}): string {
  const dir = mkdtempSync(join(tmpdir(), "sfce-allowlist-"));
  for (const s of opts.skills) {
    mkdirSync(join(dir, "skills", s), { recursive: true });
    writeFileSync(join(dir, "skills", s, "SKILL.md"), "---\nname: " + s + "\n---\n");
  }
  mkdirSync(join(dir, "hooks"), { recursive: true });
  if (opts.allowlist !== undefined) {
    writeFileSync(join(dir, "hooks", "authoring-skills.txt"), opts.allowlist);
  }
  if (opts.routing !== undefined) {
    writeFileSync(join(dir, "hooks", "metadata-path-routing.txt"), opts.routing);
  }
  return dir;
}

describe("lintAuthoringAllowlist", () => {
  test("the real plugin's allowlist and routing table are internally consistent", () => {
    const result = lintAuthoringAllowlist(PLUGIN_ROOT);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.allowlist.length).toBeGreaterThan(0);
    expect(result.routes.length).toBeGreaterThan(0);
  });

  test("fails on an allowlist name that resolves to no SKILL.md", () => {
    const dir = fixture({ skills: ["sf-work"], allowlist: "sf-work\nsf-not-a-skill\n" });
    try {
      const r = lintAuthoringAllowlist(dir);
      expect(r.ok).toBe(false);
      expect(r.violations.some((v) => v.includes("sf-not-a-skill"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("fails when a routing target is absent from the allowlist", () => {
    // The dead-end case: the skill exists, so a naive existence check passes,
    // but it cannot authorise the edit the gate just denied.
    const dir = fixture({
      skills: ["sf-work", "apex-generate"],
      allowlist: "sf-work\n",
      routing: "force-app/**/*.cls  apex-generate\n",
    });
    try {
      const r = lintAuthoringAllowlist(dir);
      expect(r.ok).toBe(false);
      expect(r.violations.some((v) => v.includes("apex-generate"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("ignores comments and blank lines in both files", () => {
    const dir = fixture({
      skills: ["sf-work"],
      allowlist: "# a comment\n\n   \nsf-work\n",
      routing: "# routes\n\nforce-app/**/*.cls  sf-work\n",
    });
    try {
      expect(lintAuthoringAllowlist(dir).ok).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("flags malformed entries distinctly from unresolvable ones", () => {
    const dir = fixture({
      skills: ["sf-work"],
      allowlist: "sf-work extra-token\n",
      routing: "only-one-field\n",
    });
    try {
      const r = lintAuthoringAllowlist(dir);
      expect(r.ok).toBe(false);
      expect(r.violations.some((v) => v.includes("malformed entry"))).toBe(true);
      expect(r.violations.some((v) => v.includes("malformed route"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("flags a duplicated allowlist entry", () => {
    const dir = fixture({ skills: ["sf-work"], allowlist: "sf-work\nsf-work\n" });
    try {
      const r = lintAuthoringAllowlist(dir);
      expect(r.ok).toBe(false);
      expect(r.violations.some((v) => v.includes("duplicate"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("a plugin shipping neither file is not a violation", () => {
    const dir = fixture({ skills: ["sf-work"] });
    try {
      expect(lintAuthoringAllowlist(dir).ok).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("routing without an allowlist is a violation", () => {
    const dir = fixture({ skills: ["sf-work"], routing: "force-app/**/*.cls  sf-work\n" });
    try {
      const r = lintAuthoringAllowlist(dir);
      expect(r.ok).toBe(false);
      expect(r.violations.some((v) => v.includes("is missing"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("the rule is registered in the lint() aggregator", () => {
  // The plan calls this out specifically: the aggregator hardcodes its checks,
  // so an unregistered module never runs and "lint passes" would be satisfied
  // whether the rule works or is dead code. Assert through the AGGREGATE report,
  // not through the module's own export.
  test("a bad allowlist name surfaces in the aggregate report", () => {
    const dir = fixture({ skills: ["sf-work"], allowlist: "sf-work\nsf-ghost-skill\n" });
    try {
      const report = lint(dir);
      expect(report.ok).toBe(false);
      expect(report.violations.some((v) => v.includes("sf-ghost-skill"))).toBe(true);
      expect(report.authoringAllowlist.ok).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("the real plugin passes through the aggregate report", () => {
    const report = lint(PLUGIN_ROOT);
    expect(report.authoringAllowlist.violations).toEqual([]);
  });
});

describe("the derivation rule, not a fixed pair of names", () => {
  // Two successive drafts of this list each missed different skills, so assert
  // the RULE: a skill that owns a file-writing persona must be on the allowlist.
  // Personas are the half a reader forgets, because the owning skill's own name
  // gives no hint that its subtree writes files.
  const PERSONA_OWNERS: Array<[string, string]> = [
    ["sf-bug-reproduction-validator", "sf-debug"],
    ["sf-pr-comment-resolver", "sf-resolve-pr-feedback"],
    ["sf-deployment-verification-agent", "sf-review"],
    ["sf-mcp-tool-builder-agent", "mcp-tool-builder"],
  ];

  test("every skill owning a file-writing persona is on the allowlist", () => {
    const { allowlist } = lintAuthoringAllowlist(PLUGIN_ROOT);
    for (const [persona, owner] of PERSONA_OWNERS) {
      expect(
        allowlist.includes(owner),
        `${owner} owns the file-writing persona ${persona} and must be allowlisted`,
      ).toBe(true);
    }
  });

  test("every skill named *-generate / *-refactor / *-uplift is on the allowlist", () => {
    const { readdirSync, existsSync } = require("fs") as typeof import("fs");
    const { allowlist } = lintAuthoringAllowlist(PLUGIN_ROOT);
    const skillsDir = join(PLUGIN_ROOT, "skills");
    const generators = readdirSync(skillsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((n) => /-(generate|refactor|uplift)$/.test(n))
      .filter((n) => existsSync(join(skillsDir, n, "SKILL.md")));

    expect(generators.length).toBeGreaterThan(0);
    for (const g of generators) {
      expect(allowlist.includes(g), `${g} authors metadata and must be allowlisted`).toBe(true);
    }
  });

  test("sf-lfg is allowlisted, so the pipeline is not stranded", () => {
    expect(lintAuthoringAllowlist(PLUGIN_ROOT).allowlist).toContain("sf-lfg");
  });
});
