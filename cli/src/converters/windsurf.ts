import { join } from "path";
import { readFileSync } from "fs";
import { homedir } from "os";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

export class WindsurfConverter extends BaseConverter {
  readonly target: TargetPlatform = "windsurf";
  readonly label = "Windsurf";
  // Windsurf always loads rules files under its base dir.
  readonly instructionsFileName = join("rules", "sf-discipline-primer.md");
  private scope: "global" | "workspace" = "global";

  setScope(scope: "global" | "workspace"): void {
    this.scope = scope;
  }

  installRoot(outputDir: string): string {
    return this.scope === "global"
      ? join(homedir(), ".codeium", "windsurf")
      : join(outputDir, ".windsurf");
  }

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const baseDir = this.installRoot(outputDir);

    this.convertAgents(plugin, baseDir);
    this.convertCommands(plugin, baseDir);
    this.convertSkills(plugin, baseDir);
    this.convertMcp(plugin, baseDir);
    this.emitHook(plugin, baseDir);
  }

  private convertAgents(plugin: ClaudePlugin, baseDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      const fm = formatFrontmatter({
        name,
        description: agent.description,
      });
      const body = this.transform(agent.body);
      const path = join(baseDir, "skills", name, "SKILL.md");
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Agent → Skill", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, baseDir: string): void {
    const workflowDir = this.scope === "global" ? "global_workflows" : "workflows";
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);
      const fm = formatFrontmatter({
        description: cmd.description,
      });
      const body = this.transform(cmd.body);
      const content = `${fm}\n\n${body}\n`;
      if (content.length > 12000) {
        console.warn(`  Warning: ${name} workflow exceeds 12,000 char limit (${content.length})`);
      }
      const path = join(baseDir, workflowDir, `${name}.md`);
      this.writeFile(path, content);
      this.log("Command → Workflow", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, baseDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(baseDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(baseDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, baseDir: string): void {
    const servers = Object.entries(plugin.mcpServers);
    if (servers.length === 0) return;

    const mcpConfig: Record<string, unknown> = { mcpServers: {} };
    const mcpServers = mcpConfig.mcpServers as Record<string, unknown>;

    for (const [name, server] of servers) {
      if (server.command) {
        mcpServers[name] = {
          command: server.command,
          args: server.args || [],
          ...(server.env && { env: server.env }),
        };
      } else if (server.url) {
        mcpServers[name] = {
          serverUrl: server.url,
          ...(server.headers && { headers: server.headers }),
        };
      }
    }

    const path = join(baseDir, "mcp_config.json");
    this.mergeJsonFile(path, mcpConfig);
    // Re-write with restricted permissions
    const merged = JSON.parse(readFileSync(path, "utf-8"));
    this.writeFile(path, JSON.stringify(merged, null, 2) + "\n", 0o600);
    this.log("MCP Config", path);
  }
}
