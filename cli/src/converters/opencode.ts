import { join } from "path";
import { homedir } from "os";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

const MODEL_MAP: Record<string, string> = {
  haiku: "anthropic/claude-haiku-4-5",
  sonnet: "anthropic/claude-sonnet-4-5",
  opus: "anthropic/claude-opus-4",
};

export class OpenCodeConverter extends BaseConverter {
  readonly target: TargetPlatform = "opencode";
  readonly label = "OpenCode";

  installRoot(outputDir: string): string {
    return outputDir !== "." ? join(outputDir, ".opencode") : join(homedir(), ".config", "opencode");
  }

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const ocDir = this.installRoot(outputDir);

    this.convertAgents(plugin, ocDir);
    this.convertCommands(plugin, ocDir);
    this.convertSkills(plugin, ocDir);
    this.convertMcp(plugin, ocDir);
    this.emitHook(plugin, ocDir);
  }

  private convertAgents(plugin: ClaudePlugin, ocDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      const model = agent.model ? MODEL_MAP[agent.model] || agent.model : undefined;
      const temperature = inferTemperature(agent.name, agent.description);

      const fm = formatFrontmatter({
        description: agent.description,
        mode: "agent",
        ...(model && { model }),
        ...(temperature !== undefined && { temperature }),
      });
      const body = this.transform(agent.body);
      const path = join(ocDir, "agents", `${name}.md`);
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Agent", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, ocDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);
      const model = cmd.model ? MODEL_MAP[cmd.model] || cmd.model : undefined;

      const fm = formatFrontmatter({
        description: cmd.description,
        ...(model && { model }),
      });
      const body = this.transform(cmd.body);
      const path = join(ocDir, "commands", `${name}.md`);
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Command", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, ocDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(ocDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(ocDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, ocDir: string): void {
    const servers = Object.entries(plugin.mcpServers);
    if (servers.length === 0) return;

    const config: Record<string, unknown> = { mcp: {} };
    const mcp = config.mcp as Record<string, unknown>;

    for (const [name, server] of servers) {
      if (server.command) {
        mcp[name] = {
          type: "local",
          command: [server.command, ...(server.args || [])],
          ...(server.env && { env: server.env }),
        };
      } else if (server.url) {
        mcp[name] = {
          type: "remote",
          url: server.url,
          ...(server.headers && { headers: server.headers }),
        };
      }
    }

    const path = join(ocDir, "opencode.json");
    this.mergeJsonFile(path, config);
    this.log("MCP Config", path);
  }
}

function inferTemperature(name: string, description: string): number | undefined {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes("review") || text.includes("audit") || text.includes("security")) return 0.1;
  if (text.includes("plan") || text.includes("architect")) return 0.2;
  if (text.includes("doc") || text.includes("compound")) return 0.3;
  if (text.includes("brainstorm") || text.includes("creative")) return 0.6;
  return undefined;
}
