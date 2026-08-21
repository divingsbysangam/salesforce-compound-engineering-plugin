import { join } from "path";
import { homedir } from "os";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { normalizeName } from "../transforms/frontmatter.js";

export class QwenConverter extends BaseConverter {
  readonly target: TargetPlatform = "qwen";
  readonly label = "Qwen Code";
  // Qwen Code always loads QWEN.md as hierarchical context.
  readonly instructionsFileName = "QWEN.md";

  installRoot(_outputDir: string, plugin: ClaudePlugin): string {
    // Qwen loads extensions only from its user-global directory.
    return join(homedir(), ".qwen", "extensions", normalizeName(plugin.name));
  }

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const qwenDir = this.installRoot(outputDir, plugin);

    this.convertAgents(plugin, qwenDir);
    this.convertCommands(plugin, qwenDir);
    this.convertSkills(plugin, qwenDir);
    this.emitHook(plugin, qwenDir);
  }

  private convertAgents(plugin: ClaudePlugin, qwenDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name);
      // Qwen uses YAML agent format
      const yaml = [
        `name: ${name}`,
        `description: ${agent.description}`,
        ...(agent.model ? [`model: ${agent.model}`] : []),
        `instructions: |`,
        ...this.transform(agent.body).split("\n").map((l) => `  ${l}`),
      ].join("\n");

      const path = join(qwenDir, "agents", `${name}.yaml`);
      this.writeFile(path, yaml + "\n");
      this.log("Agent (YAML)", path);
    }
  }

  private convertCommands(plugin: ClaudePlugin, qwenDir: string): void {
    for (const cmd of plugin.commands) {
      // Qwen uses colon-separated command names
      const name = normalizeName(cmd.name);
      const body = this.transform(cmd.body);
      const path = join(qwenDir, "commands", `${name}.md`);
      this.writeFile(path, body + "\n");
      this.log("Command", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, qwenDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.transform(file.content);
        const path = join(qwenDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(qwenDir, "skills", name));
    }
  }
}
