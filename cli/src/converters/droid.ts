import { join } from "path";
import { homedir } from "os";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

export class DroidConverter extends BaseConverter {
  readonly target: TargetPlatform = "droid";
  readonly label = "Factory Droid";

  installRoot(outputDir: string): string {
    return outputDir !== "." ? join(outputDir, ".factory") : join(homedir(), ".factory");
  }

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const droidDir = this.installRoot(outputDir);

    this.convertAgents(plugin, droidDir);
    this.convertCommands(plugin, droidDir);
    this.convertSkills(plugin, droidDir);
    this.convertMcp(plugin, droidDir);
    this.emitHook(plugin, droidDir);
  }

  private convertAgents(plugin: ClaudePlugin, droidDir: string): void {
    for (const agent of plugin.agents) {
      // Droid strips namespace prefixes (e.g., sf- prefix)
      const name = normalizeName(agent.name).replace(/^sf-/, "");
      const fm = formatFrontmatter({
        name,
        description: agent.description,
        ...(agent.model && { model: agent.model }),
      });
      const body = this.transform(agent.body);
      const path = join(droidDir, "agents", `${name}.md`);
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Agent", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, droidDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name).replace(/^sf-/, "");
      const fm = formatFrontmatter({
        name,
        description: cmd.description,
      });
      const body = this.transform(cmd.body);
      const path = join(droidDir, "commands", `${name}.md`);
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Command", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, droidDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(droidDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(droidDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, droidDir: string): void {
    const servers = Object.entries(plugin.mcpServers);
    if (servers.length === 0) return;

    const config: Record<string, unknown> = { mcpServers: {} };
    const mcpServers = config.mcpServers as Record<string, unknown>;

    for (const [name, server] of servers) {
      if (server.command) {
        mcpServers[name] = {
          command: server.command,
          args: server.args || [],
          ...(server.env && { env: server.env }),
        };
      }
    }

    const path = join(droidDir, "mcp.json");
    this.mergeJsonFile(path, config);
    this.log("MCP Config", path);
  }
}
