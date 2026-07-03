import { join } from "path";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform, McpServer } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

export class CopilotConverter extends BaseConverter {
  readonly target: TargetPlatform = "copilot";
  readonly label = "GitHub Copilot";
  // Copilot always loads .github/copilot-instructions.md as repo context.
  readonly instructionsFileName = "copilot-instructions.md";

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const ghDir = join(outputDir, ".github");

    this.convertAgents(plugin, ghDir);
    this.convertCommands(plugin, ghDir);
    this.convertSkills(plugin, ghDir);
    this.convertMcp(plugin, ghDir);
    this.emitHook(plugin, ghDir);
  }

  private convertAgents(plugin: ClaudePlugin, ghDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      const fm = formatFrontmatter({
        description: agent.description,
        tools: ["*"],
        infer: true,
        ...(agent.model && { model: agent.model }),
      });
      const body = this.transform(agent.body);
      const content = `${fm}\n\n${body}\n`;
      if (content.length > 30000) {
        console.warn(`  Warning: ${name}.agent.md exceeds 30,000 char limit (${content.length})`);
      }
      const path = join(ghDir, "agents", `${name}.agent.md`);
      this.writeFile(path, content);
      this.log("Agent", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, ghDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);
      const fm = formatFrontmatter({
        name,
        description: cmd.description,
      });
      const body = this.transform(cmd.body);
      const path = join(ghDir, "skills", name, "SKILL.md");
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Command → Skill", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, ghDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(ghDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(ghDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, ghDir: string): void {
    const servers = Object.entries(plugin.mcpServers);
    if (servers.length === 0) return;

    const mcpConfig: Record<string, unknown> = { mcpServers: {} };
    const mcpServers = mcpConfig.mcpServers as Record<string, unknown>;

    for (const [name, server] of servers) {
      if (server.command) {
        mcpServers[name] = {
          type: "local",
          command: server.command,
          args: server.args || [],
          tools: ["*"],
          ...(server.env && { env: prefixEnvVars(server.env) }),
        };
      } else if (server.url) {
        mcpServers[name] = {
          type: "sse",
          url: server.url,
          tools: ["*"],
          ...(server.headers && { headers: server.headers }),
        };
      }
    }

    const path = join(ghDir, "copilot-mcp-config.json");
    this.mergeJsonFile(path, mcpConfig);
    this.log("MCP Config", path);
  }
}

function prefixEnvVars(env: Record<string, string>): Record<string, string> {
  const prefixed: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    prefixed[`COPILOT_MCP_${key}`] = value;
  }
  return prefixed;
}
