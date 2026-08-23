---
name: sf-setup
description: "Set up the sf-compound-engineering-plugin environment for a new Salesforce developer. Validates Salesforce CLI, sfdx-project.json, MCP servers, and Claude Code plugin install. Use when onboarding to the plugin or troubleshooting install. Trigger phrases: 'set up the plugin', 'check plugin prerequisites', 'verify my Salesforce environment'. Do NOT trigger for deploy/retrieve (`sf-cli`), generating Apex/Flow/metadata (matching generate skills), or Agentforce authoring (`agentforce-develop`)."
argument-hint: "[no arguments]"
---

# sf-setup

Verify prerequisites, surface missing pieces, and walk the user through installing or configuring each one.

<feature_description>
#$ARGUMENTS
</feature_description>

## Salesforce Angle

- Check `sf --version` (Salesforce CLI v2+) and report install command if missing.
- Check for `sfdx-project.json` in the project root (current dir or first ancestor with one).
- Check `.mcp.json` for Context7 and `@salesforce/mcp` entries; offer to add the Salesforce DX MCP server.
- Verify Claude Code plugin install: `claude /plugin list` includes `sf-compound-engineering`.
- Optional: check `ast-grep` CLI presence (used by review agents for structural Apex/LWC analysis).

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## Procedure

1. Read the `<feature_description>` block and any referenced files.
2. Run the fail-closed checks below. Do not report a check as passing because it was skipped.
3. If a command errors, times out, or is missing, record `<check>=unavailable: <reason>` and tell the user how to install or fix it.
4. Ask with the blocking question tool when a choice affects scope or risk.

## Fail-closed checks

| Check | Preferred | Fallback | Report |
| --- | --- | --- | --- |
| CLI | `sf --version` | `which sf` | version string or `cli=unavailable` |
| Project | read `sfdx-project.json` walking ancestors | none | path or `project=unavailable: no sfdx-project.json` |
| MCP | read `.mcp.json` | none | servers listed or `mcp=unavailable` |
| Plugin | `claude /plugin list` | none | plugin present or `plugin=unavailable` |

## Cross-skill integration

| Need | Delegate to | Reason |
| --- | --- | --- |
| Deploy / retrieve / test / org CLI | `sf-cli` | This skill only verifies install |
| Generate Apex / Flow / metadata | matching `*-generate` skill | Authoring is not setup |
| Agentforce authoring | `agentforce-develop` | Different toolchain |

## Related

- Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).
- Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.
