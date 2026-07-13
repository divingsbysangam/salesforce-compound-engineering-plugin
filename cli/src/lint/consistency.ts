import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseMarkdown } from "../parser/markdown.js";

export interface ConsistencyLintResult {
  ok: boolean;
  violations: string[];
}

function json(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, any>;
}

/** Check release metadata, indexed skills, and known pre-V3 documentation drift. */
export function lintConsistency(pluginDir: string): ConsistencyLintResult {
  const violations: string[] = [];
  const manifestPaths = [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
  ].map((path) => join(pluginDir, path));
  const versions = manifestPaths
    .filter((path) => existsSync(path))
    .map((path) => ({ path, version: json(path).version }));
  const marketplacePath = join(pluginDir, ".claude-plugin/marketplace.json");
  if (existsSync(marketplacePath)) {
    const marketplace = json(marketplacePath);
    versions.push({ path: marketplacePath, version: marketplace.metadata?.version });
    versions.push({ path: marketplacePath, version: marketplace.plugins?.[0]?.version });
  }
  const distinctVersions = new Set(versions.map(({ version }) => version));
  if (distinctVersions.size > 1) {
    violations.push(`manifest versions drift: ${versions.map(({ path, version }) => `${path}=${version}`).join(", ")}`);
  }

  const skillsDir = join(pluginDir, "skills");
  const indexPath = join(skillsDir, "index.md");
  if (existsSync(skillsDir) && existsSync(indexPath)) {
    const index = readFileSync(indexPath, "utf8");
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillPath = join(skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillPath)) continue;
      const { frontmatter } = parseMarkdown(readFileSync(skillPath, "utf8"));
      const name = String(frontmatter.name ?? entry.name);
      // Most catalog entries use a human-readable label, so validate the
      // canonical path (or the direct slash command for workflow skills).
      if (!index.includes(`${name}/SKILL.md`) && !index.includes(`/sf-${name}`) && !index.includes(`\`${name}\``)) {
        violations.push(`skill is missing from skills/index.md: ${name}`);
      }
    }
  }

  const contributingPath = join(pluginDir, "CONTRIBUTING.md");
  if (existsSync(contributingPath)) {
    const contributing = readFileSync(contributingPath, "utf8");
    for (const stale of ["├── commands/", "├── agents/", "7 skills + index.md"]) {
      if (contributing.includes(stale)) {
        violations.push(`CONTRIBUTING.md contains retired V3 structure: ${stale}`);
      }
    }
  }
  return { ok: violations.length === 0, violations };
}
