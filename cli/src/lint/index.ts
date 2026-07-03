/**
 * Plugin lint aggregator.
 *
 * Runs the mechanical anti-pattern checks across a plugin's skills and personas
 * so two dangling-reference classes are caught by tooling, not review vigilance:
 *   - `description-sdo`      — step-count / workflow-shape language in a skill
 *                              description (auto-routing frontmatter).
 *   - `rubric-resolvable`    — confidence-rubric / subagent-template references
 *                              that do not resolve to a real file (Gap-11).
 */

import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { parseMarkdown } from "../parser/markdown.js";
import { lintDescription, type DescriptionLintResult } from "./description-sdo.js";
import { lintRubricReferences, type RubricLintResult } from "./rubric-resolvable.js";

export { lintDescription, lintRubricReferences };
export type { DescriptionLintResult, RubricLintResult };

export interface LintReport {
  descriptions: DescriptionLintResult[];
  rubrics: RubricLintResult[];
  /** Flattened, human-readable violation strings across both checks. */
  violations: string[];
  ok: boolean;
}

function findMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(full));
    } else if (entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Lint every skill description and every skill/persona markdown file under
 * `<pluginDir>/skills`. Returns all violations; `ok` is true when there are none.
 */
export function lint(pluginDir: string): LintReport {
  const skillsDir = join(pluginDir, "skills");

  const descriptions: DescriptionLintResult[] = [];
  const rubrics: RubricLintResult[] = [];

  if (existsSync(skillsDir)) {
    // description-sdo: one result per skill (from its SKILL.md description).
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillFile)) continue;
      const { frontmatter } = parseMarkdown(readFileSync(skillFile, "utf-8"));
      descriptions.push(
        lintDescription(entry.name, frontmatter.description as string | undefined),
      );
    }

    // rubric-resolvable: one result per markdown file in the tree.
    for (const file of findMarkdownFiles(skillsDir)) {
      rubrics.push(lintRubricReferences(file, readFileSync(file, "utf-8")));
    }
  }

  const violations = [
    ...descriptions.flatMap((d) => d.violations),
    ...rubrics.flatMap((r) => r.violations),
  ];

  return { descriptions, rubrics, violations, ok: violations.length === 0 };
}
