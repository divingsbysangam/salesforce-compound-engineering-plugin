import { join } from "path";
import { homedir } from "os";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

export class PiConverter extends BaseConverter {
  readonly target: TargetPlatform = "pi";
  readonly label = "Pi";

  installRoot(outputDir: string): string {
    return outputDir !== "." ? join(outputDir, ".pi", "agent") : join(homedir(), ".pi", "agent");
  }

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const piDir = this.installRoot(outputDir);

    this.convertAgents(plugin, piDir);
    this.convertCommands(plugin, piDir);
    this.convertSkills(plugin, piDir);
    this.convertMcp(plugin, piDir);
    this.emitHook(plugin, piDir);
  }

  private convertAgents(plugin: ClaudePlugin, piDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      const fm = formatFrontmatter({
        name,
        description: agent.description,
      });
      const body = this.transform(agent.body);
      const path = join(piDir, "skills", name, "SKILL.md");
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Agent → Skill", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, piDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);
      const body = this.transform(cmd.body);
      const path = join(piDir, "prompts", `${name}.md`);
      this.writeFile(path, body + "\n");
      this.log("Command → Prompt", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, piDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(piDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(piDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, piDir: string): void {
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

    const path = join(piDir, "mcp.json");
    this.mergeJsonFile(path, config);
    this.log("MCP Config", path);
  }
}
