/**
 * Lint the authoring allowlist and the metadata path-class routing table.
 *
 * `hooks/authoring-skills.txt` names the skills that may grant authorisation to
 * edit Salesforce metadata; `hooks/metadata-path-routing.txt` maps a path class
 * to the skill a denied author should be sent to. Both are hand-maintained data
 * files, and both fail in ways a reader cannot see:
 *
 *   - a name that no longer resolves to a real skill silently stops authorising
 *   - a routing target missing from the allowlist sends a denied author toward
 *     a skill that cannot authorise the edit — a dead end that reads like help
 *
 * This extends the repo's no-dangling-reference criterion to data files. Note it
 * is the first lint rule to look OUTSIDE `skills/`.
 *
 * Direction: this check is ONE-WAY by design. It cannot detect a skill that
 * writes metadata but is absent from the allowlist, because nothing in a
 * SKILL.md mechanically declares that it writes metadata. That reverse check
 * needs a frontmatter marker across all 69 skills; until then the allowlist is
 * hand-maintained and its file says so.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

export interface AuthoringAllowlistLintResult {
  ok: boolean;
  violations: string[];
  /** Skill names parsed from the allowlist, in file order. */
  allowlist: string[];
  /** `[glob, owningSkill]` pairs parsed from the routing table, in file order. */
  routes: Array<[string, string]>;
}

const ALLOWLIST_REL = join("hooks", "authoring-skills.txt");
const ROUTING_REL = join("hooks", "metadata-path-routing.txt");

/** Strip comments and blank lines; both files share this shape. */
function contentLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

export function lintAuthoringAllowlist(pluginDir: string): AuthoringAllowlistLintResult {
  const violations: string[] = [];
  const allowlist: string[] = [];
  const routes: Array<[string, string]> = [];

  const allowlistPath = join(pluginDir, ALLOWLIST_REL);
  const routingPath = join(pluginDir, ROUTING_REL);

  // Absent files are not a violation: a plugin that ships no gate has no
  // allowlist to check. A file that EXISTS must be well-formed.
  if (!existsSync(allowlistPath) && !existsSync(routingPath)) {
    return { ok: true, violations, allowlist, routes };
  }

  if (existsSync(allowlistPath)) {
    for (const line of contentLines(readFileSync(allowlistPath, "utf-8"))) {
      // One bare skill name per line. Anything else is a malformed entry rather
      // than a name that happens not to resolve, so say which it is.
      if (/\s/.test(line)) {
        violations.push(
          `${ALLOWLIST_REL}: malformed entry "${line}" — expected one bare skill name per line`,
        );
        continue;
      }
      allowlist.push(line);
      if (!existsSync(join(pluginDir, "skills", line, "SKILL.md"))) {
        violations.push(
          `${ALLOWLIST_REL}: "${line}" does not resolve to skills/${line}/SKILL.md`,
        );
      }
    }

    const seen = new Set<string>();
    for (const name of allowlist) {
      if (seen.has(name)) {
        violations.push(`${ALLOWLIST_REL}: duplicate entry "${name}"`);
      }
      seen.add(name);
    }
  } else {
    violations.push(`${ROUTING_REL} exists but ${ALLOWLIST_REL} is missing`);
  }

  if (existsSync(routingPath)) {
    for (const line of contentLines(readFileSync(routingPath, "utf-8"))) {
      const parts = line.split(/\s+/);
      if (parts.length !== 2) {
        violations.push(
          `${ROUTING_REL}: malformed route "${line}" — expected "<glob> <owning-skill>"`,
        );
        continue;
      }
      const [glob, owner] = parts as [string, string];
      routes.push([glob, owner]);

      // The invariant that makes a deny actionable.
      if (!allowlist.includes(owner)) {
        violations.push(
          `${ROUTING_REL}: route "${glob}" points at "${owner}", which is not in ${ALLOWLIST_REL} — a denied author would be sent to a skill that cannot authorise the edit`,
        );
      }
    }
  }

  return { ok: violations.length === 0, violations, allowlist, routes };
}
