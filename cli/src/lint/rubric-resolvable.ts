/**
 * Lint markdown for dangling confidence-rubric / subagent-template references.
 *
 * This is the Gap-11 failure mode: ~24 personas said "Use the anchored
 * confidence rubric in `../subagent-confidence-rubric.md`" while that file did
 * not exist. The reference read fine to a human but pointed at nothing. This
 * check verifies every such referenced path resolves on disk (relative to the
 * referencing file's directory), and flags any rubric/template mention that
 * promises a location but names no resolvable file — so the gap cannot recur
 * silently.
 */

import { existsSync } from "fs";
import { resolve, dirname } from "path";

export interface RubricLintResult {
  file: string;
  ok: boolean;
  violations: string[];
}

/** Inline-code path that names the confidence rubric or a subagent template. */
const RUBRIC_PATH_RE =
  /`([^`]*(?:subagent-confidence-rubric|confidence-rubric|subagent-template)[^`]*\.md)`/gi;

/** A rubric/template mention that promises a location ("...rubric in ..."). */
const DANGLING_MENTION_RE =
  /\b(?:confidence rubric|subagent template)\s+(?:defined in|in|at|see)\b/i;

/** Any inline-code markdown path, e.g. `../foo/bar.md`. */
const INLINE_MD_PATH_RE = /`[^`]+\.md`/;

/**
 * Return dangling-reference violations for a single markdown file.
 *
 * @param filePath absolute path of the file whose content is being linted
 *                 (used to resolve relative references)
 * @param content  the file's markdown text
 */
export function lintRubricReferences(filePath: string, content: string): RubricLintResult {
  const dir = dirname(filePath);
  const violations: string[] = [];

  // Rule A: every inline-code rubric/template path must resolve on disk.
  for (const match of content.matchAll(RUBRIC_PATH_RE)) {
    const rel = match[1].trim();
    const target = resolve(dir, rel);
    if (!existsSync(target)) {
      violations.push(
        `${filePath}: references rubric/template path \`${rel}\` which does not resolve (expected at ${target})`,
      );
    }
  }

  // Rule B: a rubric/template mention that promises a location but names no
  // inline-code file path on the same line.
  for (const line of content.split(/\r?\n/)) {
    if (DANGLING_MENTION_RE.test(line) && !INLINE_MD_PATH_RE.test(line)) {
      violations.push(
        `${filePath}: mentions a confidence rubric / subagent template with a location but names no resolvable file: "${line.trim()}"`,
      );
    }
  }

  return { file: filePath, ok: violations.length === 0, violations };
}
