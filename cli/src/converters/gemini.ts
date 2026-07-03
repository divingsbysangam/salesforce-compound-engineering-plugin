import { join } from "path";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

export class GeminiConverter extends BaseConverter {
  readonly target: TargetPlatform = "gemini";
  readonly label = "Gemini CLI";
  // Gemini CLI always loads GEMINI.md as hierarchical context.
  readonly instructionsFileName = "GEMINI.md";

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const geminiDir = join(outputDir, ".gemini");

    this.convertAgents(plugin, geminiDir);
    this.convertCommands(plugin, geminiDir);
    this.convertSkills(plugin, geminiDir);
    this.convertMcp(plugin, geminiDir);
    this.emitHook(plugin, geminiDir);
  }

  private convertAgents(plugin: ClaudePlugin, geminiDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      const fm = formatFrontmatter({
        name,
        description: truncate(agent.description, 1024),
      });
      const body = this.transform(agent.body);
      const path = join(geminiDir, "skills", name, "SKILL.md");
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Agent → Skill", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, geminiDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);
      const body = this.transform(cmd.body);
      const prompt = cmd.argumentHint
        ? `${body}\n\nUser request: {{args}}`
        : body;

      const toml = [
        `description = ${tomlString(truncate(cmd.description, 1024))}`,
        `prompt = ${tomlMultilineString(prompt)}`,
      ].join("\n");

      const path = join(geminiDir, "commands", `${name}.toml`);
      this.writeFile(path, toml + "\n");
      this.log("Command → TOML", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, geminiDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(geminiDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(geminiDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, geminiDir: string): void {
    const servers = Object.entries(plugin.mcpServers);
    if (servers.length === 0) return;

    const settings: Record<string, unknown> = { mcpServers: {} };
    const mcpServers = settings.mcpServers as Record<string, unknown>;

    for (const [name, server] of servers) {
      if (server.command) {
        mcpServers[name] = {
          command: server.command,
          args: server.args || [],
          ...(server.env && { env: server.env }),
        };
      }
    }

    const path = join(geminiDir, "settings.json");
    this.mergeJsonFile(path, settings);
    this.log("MCP Config", path);
  }
}

function tomlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function tomlMultilineString(value: string): string {
  return `"""\n${value}\n"""`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}
