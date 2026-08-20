---
title: "feat: Multi-Tool CLI Installer for SF Compound Engineering Plugin"
type: feat
date: 2026-03-02
---

# Multi-Tool CLI Installer

Build a Bun/TypeScript CLI that converts the SF Compound Engineering Plugin (Claude Code format) into native formats for 7+ AI coding tools, published as an npm package.

## Overview

Currently, the plugin only works with Claude Code. This CLI will read the plugin's markdown commands, agents, skills, and MCP config, then convert them into each platform's native format — exactly how  `this plugin’s installer` works.

**Goal:** `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to [target]`

## Problem Statement

The SF Compound Engineering Plugin contains 7 commands, 33 agents, 12 skills, and MCP config that are valuable for any Salesforce developer — but they're locked to Claude Code. Other AI coding tools (Copilot, Windsurf, Gemini CLI, OpenCode, Codex, Kiro) have their own formats for instructions, skills, and agents. A converter CLI bridges this gap.

## Proposed Solution

A TypeScript CLI using Bun that:

1. **Reads** the Claude Code plugin structure (commands/, agents/, skills/, .mcp.json, plugin.json)
2. **Parses** markdown files with YAML frontmatter into structured objects
3. **Transforms** content with platform-specific rewriting (paths, task calls, slash command refs)
4. **Writes** to each target platform's expected directory structure and format

## Technical Approach

### Architecture

```
cli/
├── package.json                 # npm package config
├── tsconfig.json                # TypeScript config
├── src/
│   ├── index.ts                 # CLI entry point (citty)
│   ├── commands/
│   │   ├── install.ts           # install command handler
│   │   └── sync.ts              # sync command handler
│   ├── parser/
│   │   ├── plugin.ts            # Read plugin.json, .mcp.json
│   │   ├── markdown.ts          # Parse .md files → { frontmatter, body }
│   │   └── types.ts             # ClaudePlugin, Agent, Command, Skill types
│   ├── converters/
│   │   ├── base.ts              # Abstract converter with shared transforms
│   │   ├── copilot.ts           # GitHub Copilot converter
│   │   ├── windsurf.ts          # Windsurf converter
│   │   ├── gemini.ts            # Gemini CLI converter
│   │   ├── kiro.ts              # Kiro converter
│   │   ├── opencode.ts          # OpenCode converter
│   │   ├── codex.ts             # Codex converter
│   │   └── cursor.ts            # Cursor sync-only converter
│   ├── transforms/
│   │   ├── paths.ts             # Rewrite .claude/ → platform paths
│   │   ├── references.ts        # Rewrite Task, @agent, /command refs
│   │   └── frontmatter.ts       # Format YAML frontmatter per platform
│   └── utils/
│       ├── detect.ts            # Auto-detect installed tools
│       ├── merge.ts             # Merge with existing config (user wins)
│       └── fs.ts                # File I/O helpers
└── tests/
    ├── parser.test.ts
    ├── converters/
    │   ├── copilot.test.ts
    │   └── ...
    └── transforms.test.ts
```

### Source Format (What We Read)

| Component | Source Path | Parsed Into |
|-----------|-----------|-------------|
| Commands | `commands/*.md` | `{ name, description, arguments, body }` |
| Agents | `agents/{category}/*.md` | `{ name, description, scope, model, body }` |
| Skills | `skills/{name}/SKILL.md` + assets | `{ name, description, scope, files[] }` |
| MCP Config | `.mcp.json` | `{ mcpServers: { ... } }` |
| Manifest | `.claude-plugin/plugin.json` | `{ name, version, components }` |

### Implementation Phases

#### Phase 1: Core Parser + 2 Converters

**Goal:** Working CLI that installs to Copilot and Windsurf.

**Tasks:**

- [ ] Initialize Bun project: `cli/package.json`, `cli/tsconfig.json`
  - Package name: `@divingsbysangam/sf-compound-plugin`
  - Dependencies: `citty`, `js-yaml`, `gray-matter`
- [ ] `src/parser/types.ts` — Define TypeScript interfaces
  ```typescript
  // cli/src/parser/types.ts
  interface ClaudePlugin {
    name: string;
    version: string;
    commands: Command[];
    agents: Agent[];
    skills: Skill[];
    mcpServers: Record<string, McpServer>;
  }

  interface Command {
    name: string;
    description: string;
    argumentHint?: string;
    model?: string;
    body: string;
  }

  interface Agent {
    name: string;
    description: string;
    scope?: string;
    model?: string;
    body: string;
    category: string;
  }

  interface Skill {
    name: string;
    description?: string;
    scope?: string;
    files: { path: string; content: string }[];
  }

  interface McpServer {
    command?: string;
    args?: string[];
    url?: string;
    headers?: Record<string, string>;
    env?: Record<string, string>;
  }
  ```
- [ ] `src/parser/markdown.ts` — Parse markdown files with gray-matter
- [ ] `src/parser/plugin.ts` — Read full plugin structure from disk
- [ ] `src/transforms/paths.ts` — Path rewriting `.claude/` → platform paths
- [ ] `src/transforms/references.ts` — Rewrite `Task agent(args)`, `@agent`, `/command` references
- [ ] `src/transforms/frontmatter.ts` — Format YAML frontmatter per platform
- [ ] `src/converters/base.ts` — Abstract base with shared logic
- [ ] `src/converters/copilot.ts` — GitHub Copilot converter
- [ ] `src/converters/windsurf.ts` — Windsurf converter
- [ ] `src/index.ts` — CLI entry with `install` command
- [ ] Tests for parser and both converters

**Copilot Output Format:**

| Claude Concept | Copilot Format | Output Path |
|---|---|---|
| Commands | `SKILL.md` with frontmatter | `.github/skills/{name}/SKILL.md` |
| Agents | `.agent.md` with YAML frontmatter (`description`, `tools: ["*"]`) | `.github/agents/{name}.agent.md` |
| Skills | Copied as-is | `.github/skills/{name}/` |
| MCP | `copilot-mcp-config.json` | `.github/copilot-mcp-config.json` |

**Windsurf Output Format:**

| Claude Concept | Windsurf Format | Output Path |
|---|---|---|
| Commands | Workflow `.md` with frontmatter | `global_workflows/{name}.md` or `workflows/{name}.md` |
| Agents | `SKILL.md` in skills directory | `skills/{name}/SKILL.md` |
| Skills | Copied as-is | `skills/{name}/` |
| MCP | `mcp_config.json` (0o600 perms) | `mcp_config.json` |

#### Phase 2: Gemini + Kiro + OpenCode

- [ ] `src/converters/gemini.ts` — Gemini CLI converter
  - Commands → TOML files with `description` + `prompt` fields
  - Agents/Skills → `.gemini/skills/{name}/SKILL.md`
  - MCP → merged into `.gemini/settings.json`
  - Namespaced commands: `sf-plan` → `commands/sf-plan.toml`
- [ ] `src/converters/kiro.ts` — Kiro converter
  - Agents → JSON config + prompt `.md` pair
  - Tool name remapping: `Bash`→`shell`, `Edit`→`write`, `Glob`→`glob`, `Grep`→`grep`, `Task`→`use_subagent`
  - Commands/Skills → `.kiro/skills/{name}/SKILL.md`
  - CLAUDE.md → `.kiro/steering/sf-compound-engineering.md`
  - MCP → `.kiro/settings/mcp.json` (stdio only)
- [ ] `src/converters/opencode.ts` — OpenCode converter
  - Model alias resolution: `haiku`→`anthropic/claude-haiku-4-5`, `sonnet`→`anthropic/claude-sonnet-4-5`
  - Temperature inference from agent name/description
  - MCP → `opencode.json` under `mcp` key
  - Hooks → TypeScript plugin files (only platform supporting hooks)
- [ ] Tests for all 3 converters

**Gemini TOML Example:**
```toml
# .gemini/commands/sf-plan.toml
description = "Research and design specs with parallel agent research (NO CODE)"
prompt = """
Follow these steps to plan...

User request: {{args}}
"""
```

**Kiro Agent JSON Example:**
```json
{
  "name": "apex-governor-guardian",
  "description": "Reviews Apex for governor limit compliance",
  "prompt": "file://./prompts/apex-governor-guardian.md",
  "tools": ["*"],
  "resources": [
    "file://.kiro/steering/**/*.md",
    "skill://.kiro/skills/**/SKILL.md"
  ],
  "includeMcpJson": true
}
```

#### Phase 3: Codex + Cursor Sync + Auto-Detect

- [ ] `src/converters/codex.ts` — Codex converter
  - Commands → prompt `.md` + skill `.md` pair
  - MCP → `.codex/config.toml` format
  - Agent refs: `@agent-name` → `$agent-name skill`
- [ ] `src/converters/cursor.ts` — Cursor sync-only (symlinks + MCP merge)
  - Skills symlinked to `.cursor/skills/`
  - MCP merged into `.cursor/mcp.json`
- [ ] `src/utils/detect.ts` — Auto-detect installed tools by checking directories
  ```typescript
  // cli/src/utils/detect.ts
  const detectors: Record<string, () => boolean> = {
    copilot: () => existsSync('.github'),
    windsurf: () => existsSync(join(homedir(), '.codeium/windsurf')) || existsSync('.windsurf'),
    gemini: () => existsSync('.gemini'),
    kiro: () => existsSync('.kiro'),
    opencode: () => existsSync(join(homedir(), '.config/opencode')),
    codex: () => existsSync('.codex') || existsSync(join(homedir(), '.codex')),
    cursor: () => existsSync('.cursor'),
  };
  ```
- [ ] `src/commands/sync.ts` — Sync personal Claude config to other tools
- [ ] `--to all` flag that runs all detected converters

#### Phase 4: Publish + README

- [ ] Publish to npm as `@divingsbysangam/sf-compound-plugin`
- [ ] Add CLI section to main README.md
- [ ] Add `--scope workspace|global` flag support for Windsurf
- [ ] Integration tests that verify output files match expected formats

## Content Transformation Rules (Shared Across All Converters)

### Path Rewriting

| Original | Copilot | Windsurf | Gemini | Kiro | OpenCode | Codex |
|---|---|---|---|---|---|---|
| `.claude/` | `.github/` | `.windsurf/` | `.gemini/` | `.kiro/` | `.opencode/` | `.codex/` |
| `~/.claude/` | `~/.copilot/` | `~/.codeium/windsurf/` | `~/.gemini/` | `~/.kiro/` | `~/.config/opencode/` | `~/.codex/` |

### Task Agent Call Rewriting

| Original | Copilot | Windsurf | Gemini | Kiro | OpenCode | Codex |
|---|---|---|---|---|---|---|
| `Task agent-name(args)` | `Use the agent-name skill to: args` | `@agent-name args` | `Use the agent-name skill to: args` | `Use the agent-name agent to: args` | `Task agent-name(args)` (kept) | `Use the $agent-name skill to: args` |

### Slash Command Reference Rewriting

| Original | Copilot | Windsurf | Gemini | Kiro | OpenCode | Codex |
|---|---|---|---|---|---|---|
| `/sf-plan` | `/sf-plan` | `/sf-plan` | `/sf-plan` | `the sf-plan skill` | `/sf-plan` | `/prompts:sf-plan` |

### Name Normalization

All names: lowercase, special chars → hyphens, deduplicate with numeric suffixes on collision.

## Acceptance Criteria

### Functional

- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to copilot` writes correct files to `.github/`
- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to windsurf` writes correct files
- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to gemini` writes correct TOML commands
- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to kiro` writes JSON configs + prompt files
- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to opencode` resolves model aliases
- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to codex` creates prompt+skill pairs
- [ ] `bunx @divingsbysangam/sf-compound-plugin install sf-compound-engineering --to all` auto-detects and writes to all found tools
- [ ] `bunx @divingsbysangam/sf-compound-plugin sync --target [tool]` symlinks skills and merges MCP config
- [ ] All 7 commands, 33 agents, and 12 skills are converted for each platform
- [ ] MCP config (Context7) is written in each platform's native format
- [ ] Existing user config is preserved during merges (user wins on conflict)

### Non-Functional

- [ ] CLI runs in under 5 seconds for any single target
- [ ] No runtime dependencies beyond `citty`, `js-yaml`, `gray-matter`
- [ ] Package size under 50KB (plugin content is read from disk, not bundled)
- [ ] Works with Bun and Node.js (via `bunx` or `npx`)

### Quality Gates

- [ ] Unit tests for parser (markdown → structured objects)
- [ ] Unit tests for each converter (structured objects → platform files)
- [ ] Unit tests for all transform functions (paths, references, frontmatter)
- [ ] Integration test: full install cycle for each platform

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| Platform format changes | Each converter is isolated; easy to update one without affecting others |
| TOML generation for Gemini | Use `@iarna/toml` or simple string templating (TOML is simple enough) |
| Kiro's stdio-only MCP | Context7 uses stdio (npx), so no issue for our plugin |
| Cursor removed CLI install | Sync-only approach (symlinks + MCP merge) |
| npm publish scope | Need `@divingsbysangam` org on npm, or use unscoped name |

## Success Metrics

- Plugin installable on 7 AI coding tools via single CLI
- All 52 plugin files (7 commands + 33 agents + 12 skills) correctly converted per platform
- MCP config (Context7) available on all platforms that support it

## References

- converter: 
- npm package: `this plugin’s installer` v0.12.0
- Copilot agent format: `.github/agents/*.agent.md`
- Windsurf workflows: `.windsurf/workflows/*.md`
- Gemini commands: `.gemini/commands/*.toml`
- Kiro agents: `.kiro/agents/*.json` + prompts
- OpenCode config: `opencode.json`
- Codex skills: `.codex/skills/*/SKILL.md`
