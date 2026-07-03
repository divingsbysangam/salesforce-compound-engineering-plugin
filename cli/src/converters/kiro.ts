import { join } from "path";
import { BaseConverter } from "./base.js";
import type { ClaudePlugin, TargetPlatform } from "../parser/types.js";
import { formatFrontmatter, normalizeName } from "../transforms/frontmatter.js";

const TOOL_REMAP: Record<string, string> = {
  Bash: "shell",
  Edit: "write",
  Glob: "glob",
  Grep: "grep",
  Read: "read",
  Write: "write",
  WebFetch: "web_fetch",
  WebSearch: "web_search",
  Task: "use_subagent",
};

export class KiroConverter extends BaseConverter {
  readonly target: TargetPlatform = "kiro";
  readonly label = "Kiro";
  // Kiro has a real hook primitive (Agent Hooks, JSON .kiro.hook files).
  readonly hookClass = "native-hook" as const;

  convert(plugin: ClaudePlugin, outputDir: string): void {
    const kiroDir = join(outputDir, ".kiro");

    this.convertAgents(plugin, kiroDir);
    this.convertCommands(plugin, kiroDir);
    this.convertSkills(plugin, kiroDir);
    this.convertMcp(plugin, kiroDir);
    this.convertSteering(plugin, kiroDir);
    this.emitHook(plugin, kiroDir);
  }

  /**
   * Kiro Agent Hook: emit a native session-start hook declaration and copy the
   * primer script it runs. This is the native-hook class — no instructions-file
   * fallback needed.
   */
  protected emitHook(plugin: ClaudePlugin, kiroDir: string): void {
    const hooks = plugin.hooks;
    if (!hooks?.scriptContent) return;

    const scriptDest = join(kiroDir, "hooks", "session-start");
    this.writeFile(scriptDest, hooks.scriptContent, 0o755);

    const hookDecl = {
      enabled: true,
      name: "SF Discipline Primer",
      description:
        "Injects the SF compound-engineering discipline primer at session start.",
      version: "1",
      when: { type: "sessionStart" },
      then: { type: "runCommand", command: "./hooks/session-start" },
    };
    const hookPath = join(kiroDir, "hooks", "session-start-primer.kiro.hook");
    this.writeFile(hookPath, JSON.stringify(hookDecl, null, 2) + "\n");
    this.log("Hook (native SessionStart)", hookPath);
  }

  private convertAgents(plugin: ClaudePlugin, kiroDir: string): void {
    for (const agent of plugin.agents) {
      const name = normalizeName(agent.name).slice(0, 64);
      const body = this.remapTools(this.transform(agent.body));

      // Write prompt file
      const promptPath = join(kiroDir, "agents", "prompts", `${name}.md`);
      this.writeFile(promptPath, body + "\n");

      // Write JSON config
      const config = {
        name,
        description: agent.description,
        prompt: `file://./prompts/${name}.md`,
        tools: ["*"],
        resources: [
          "file://.kiro/steering/**/*.md",
          "skill://.kiro/skills/**/SKILL.md",
        ],
        includeMcpJson: true,
        welcomeMessage: `Switching to the ${name} agent. ${agent.description}`,
      };
      const configPath = join(kiroDir, "agents", `${name}.json`);
      this.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
      this.log("Agent", configPath);
    }
  }

  private convertCommands(plugin: ClaudePlugin, kiroDir: string): void {
    for (const cmd of plugin.commands) {
      const name = normalizeName(cmd.name);
      const fm = formatFrontmatter({
        name,
        description: cmd.description,
      });
      const body = this.remapTools(this.transform(cmd.body));
      const path = join(kiroDir, "skills", name, "SKILL.md");
      this.writeFile(path, `${fm}\n\n${body}\n`);
      this.log("Command → Skill", path);
    }
  }

  private convertSkills(plugin: ClaudePlugin, kiroDir: string): void {
    for (const skill of plugin.skills) {
      const name = normalizeName(skill.name);
      for (const file of skill.files) {
        const content = this.remapTools(this.transform(file.content));
        const path = join(kiroDir, "skills", name, file.relativePath);
        this.writeFile(path, content);
      }
      this.log("Skill", join(kiroDir, "skills", name));
    }
  }

  private convertMcp(plugin: ClaudePlugin, kiroDir: string): void {
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
        console.warn(`  Warning: Kiro only supports stdio MCP servers, skipping HTTP server: ${name}`);
      }
    }

    const path = join(kiroDir, "settings", "mcp.json");
    this.mergeJsonFile(path, mcpConfig);
    this.log("MCP Config", path);
  }

  private convertSteering(plugin: ClaudePlugin, kiroDir: string): void {
    const steeringContent = [
      `# ${plugin.name}`,
      "",
      plugin.description,
      "",
      `Version: ${plugin.version}`,
      "",
      "## Available Skills",
      "",
      ...plugin.skills.map((s) => `- **${s.name}**: ${s.description || "Reference documentation"}`),
      "",
      "## Available Agents",
      "",
      ...plugin.agents.map((a) => `- **${a.name}** (${a.category}): ${a.description}`),
    ].join("\n");

    const path = join(kiroDir, "steering", `${normalizeName(plugin.name)}.md`);
    this.writeFile(path, steeringContent + "\n");
    this.log("Steering", path);
  }

  private remapTools(content: string): string {
    let result = content;
    for (const [claude, kiro] of Object.entries(TOOL_REMAP)) {
      result = result.replaceAll(`the ${claude} tool`, `the ${kiro} tool`);
      result = result.replaceAll(`Use ${claude}`, `Use ${kiro}`);
    }
    return result;
  }
}
