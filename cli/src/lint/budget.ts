/**
 * Token budgets for the always-loaded and frequently-dispatched surfaces.
 *
 * Every skill description is in context on every session, a SKILL.md body is
 * loaded on every invocation, and a review lens is loaded once per dispatched
 * subagent. Growth on any of these is paid on every run, so each gets a hard
 * ceiling instead of relying on review vigilance.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { parseMarkdown } from "../parser/markdown.js";

export const BUDGETS = {
  /** Characters in a skill's `description` frontmatter. */
  description: 250,
  /** Bytes in a top-level SKILL.md (some hosts truncate near 8KB). */
  skillFile: 8000,
  /** Bytes in a review lens under sf-review/references/lenses/. */
  lensFile: 3500,
};

export interface BudgetLintResult {
  ok: boolean;
  violations: string[];
}

export function lintBudgets(pluginDir: string, budgets = BUDGETS): BudgetLintResult {
  const violations: string[] = [];
  const skillsDir = join(pluginDir, "skills");
  if (!existsSync(skillsDir)) return { ok: true, violations };

  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = join(skillsDir, entry.name, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    const raw = readFileSync(skillFile, "utf-8");
    const bytes = Buffer.byteLength(raw, "utf-8");
    if (bytes > budgets.skillFile) {
      violations.push(`${entry.name}: SKILL.md is ${bytes} bytes (budget ${budgets.skillFile})`);
    }
    const description = String(parseMarkdown(raw).frontmatter.description ?? "");
    if (description.length > budgets.description) {
      violations.push(
        `${entry.name}: description is ${description.length} characters (budget ${budgets.description})`,
      );
    }
  }

  const lensDir = join(skillsDir, "sf-review", "references", "lenses");
  if (existsSync(lensDir)) {
    for (const name of readdirSync(lensDir)) {
      if (!name.endsWith(".md")) continue;
      const size = statSync(join(lensDir, name)).size;
      if (size > budgets.lensFile) {
        violations.push(`lens ${name} is ${size} bytes (budget ${budgets.lensFile})`);
      }
    }
  }
  return { ok: violations.length === 0, violations };
}
