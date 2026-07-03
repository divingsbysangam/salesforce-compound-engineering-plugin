import { join } from "path";
import { symlinkSync, existsSync, mkdirSync } from "fs";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";

export class CursorConverter extends BaseConverter {
  readonly target: TargetPlatform = "cursor";
  readonly label = "Cursor (sync only)";
  // Cursor always loads files under .cursor/rules/ as project rules.
  readonly instructionsFileName = join("rules", "sf-discipline-primer.md");

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const cursorDir = join(outputDir, ".cursor");

    this.syncSkills(plugin, cursorDir, outputDir);
    this.convertMcp(plugin, cursorDir);
    this.emitHook(plugin, cursorDir);
  }

  private syncSkills(plugin: ClaudePlugin, cursorDir: string, pluginDir: string): void {
    const skillsDir = join(cursorDir, "skills");
    mkdirSync(skillsDir, { recursive: true });

    for (const skill of plugin.skills) {
      const src = join(pluginDir, "skills", skill.name);
      const dest = join(skillsDir, skill.name);

      if (existsSync(dest)) continue;

      try {
        symlinkSync(src, dest);
        this.log("Skill (symlink)", dest);
      } catch {
        // Copy files if symlink fails (Windows)
        for (const file of skill.files) {
          const content = this.transform(file.content);
          const path = join(dest, file.relativePath);
          this.writeFile(path, content);
        }
        this.log("Skill (copy)", dest);
      }
    }
  }

  private convertMcp(plugin: ClaudePlugin, cursorDir: string): void {
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
      }
    }

    const path = join(cursorDir, "mcp.json");
    this.mergeJsonFile(path, mcpConfig);
    this.log("MCP Config", path);
  }
}
