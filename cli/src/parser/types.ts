export interface Command {
  name: string;
  description: string;
  argumentHint?: string;
  model?: string;
  body: string;
}

export interface Agent {
  name: string;
  description: string;
  scope?: string;
  model?: string;
  category: string;
  body: string;
}

export interface SkillFile {
  relativePath: string;
  content: string;
}

export interface Skill {
  name: string;
  description?: string;
  scope?: string;
  files: SkillFile[];
}

export interface McpServer {
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
}

/**
 * The plugin's session-start hook, parsed from the canonical Claude Code
 * source (`hooks/hooks.json` + the `${CLAUDE_PLUGIN_ROOT}/scripts/...` script
 * it references). Converters route this to each platform's hook-support class
 * (native hook / lifecycle callback / instructions-file fallback). Optional:
 * absent hooks mean no emission, keeping older plugins backward-compatible.
 */
export interface PluginHooks {
  /** Raw parsed `hooks/hooks.json` (Claude Code native SessionStart format). */
  config: Record<string, unknown>;
  /** Path (relative to the plugin root) of the session-start primer script. */
  scriptRelPath: string;
  /** Full contents of the primer script — copied by native-hook platforms. */
  scriptContent: string;
  /**
   * The plain-text discipline primer the script emits to stdout. Single source
   * of truth; extracted from the script's heredoc so it never drifts. Used by
   * the instructions-file fallback and the in-process lifecycle callback.
   */
  primerText: string;
}

export interface ClaudePlugin {
  name: string;
  version: string;
  description: string;
  commands: Command[];
  agents: Agent[];
  skills: Skill[];
  mcpServers: Record<string, McpServer>;
  /** Session-start hook source, if the plugin ships one. */
  hooks?: PluginHooks;
}

export type TargetPlatform =
  | "copilot"
  | "windsurf"
  | "gemini"
  | "kiro"
  | "opencode"
  | "codex"
  | "cursor"
  | "droid"
  | "pi"
  | "openclaw"
  | "qwen";
