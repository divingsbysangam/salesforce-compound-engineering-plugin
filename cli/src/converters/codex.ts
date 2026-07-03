import { join } from "path";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

export class CodexConverter extends BaseConverter {
  readonly target: TargetPlatform = "codex";
  readonly label = "Codex";
  // Codex natively reads AGENTS.md as always-loaded project context.
  readonly instructionsFileName = "AGENTS.md";

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const codexDir = join(outputDir, ".codex");

    this.convertAgents(plugin, codexDir);
    this.convertCommands(plugin, codexDir);
    this.convertSkills(plugin, codexDir);
    this.convertMcp(plugin, codexDir);
    this.emitHook(plugin, codexDir);
  }

  private convertAgents(plugin: ClaudePlugin, codexDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      const fm = formatFrontmatter({
        name,
        description: truncate(agent.description, 1024),
      });
      const body = this.transform(agent.body);
      const path = join(codexDir, "skills", name, "SKILL.md");
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Agent → Skill", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, codexDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);

      // Prompt file (references the skill)
      const promptContent = `Use the $${name} skill to execute this workflow.\n`;
      const promptPath = join(codexDir, "prompts", `${name}.md`);
      this.writeFile(promptPath, promptContent);

      // Skill file (actual instructions)
      const fm = formatFrontmatter({
        name,
        description: truncate(cmd.description, 1024),
      });
      const body = this.transform(cmd.body);
      const skillPath = join(codexDir, "skills", name, "SKILL.md");
      this.writeFile(skillPath, `${fm}\n\n${body}\n`);
      this.log("Command → Prompt+Skill", skillPath);
    }
  }

  private convertSkills(plugin: ClaudePlugin, codexDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(codexDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(codexDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, codexDir: string): void {
    const servers = Object.entries(plugin.mcpServers);
    if (servers.length === 0) return;

    const lines: string[] = [];
    for (const [name, server] of servers) {
      if (server.command) {
        lines.push(`[mcp_servers.${name}]`);
        lines.push(`command = "${server.command}"`);
        if (server.args?.length) {
          lines.push(`args = [${server.args.map((a) => `"${a}"`).join(", ")}]`);
        }
        if (server.env) {
          lines.push("");
          lines.push(`[mcp_servers.${name}.env]`);
          for (const [key, value] of Object.entries(server.env)) {
            lines.push(`${key} = "${value}"`);
          }
        }
        lines.push("");
      }
    }

    const path = join(codexDir, "config.toml");
    this.writeFile(path, lines.join("\n") + "\n");
    this.log("MCP Config", path);
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}
