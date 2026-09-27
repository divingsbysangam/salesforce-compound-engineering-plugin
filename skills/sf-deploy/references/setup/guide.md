# sf-deploy mode:setup

Verify prerequisites, surface missing pieces, and walk the user through installing or configuring each one.

<feature_description>
#$ARGUMENTS
</feature_description>

## Salesforce Angle

- Check `sf --version` (Salesforce CLI v2+) and report install command if missing.
- Check for `sfdx-project.json` in the project root (current dir or first ancestor with one).
- Check `.mcp.json` for Context7 and `@salesforce/mcp` entries; offer to add the Salesforce DX MCP server. Its `--toolsets` should list only what is used (default `orgs,metadata,data,testing,code-analysis,lwc-experts`), not `all`.
- Check a default org is set (`sf config get target-org --json`) and say whether it is scratch, sandbox, or production (`sf org display --json`).
- Optional, Claude Code only: offer Salesforce's `salesforce-development` plugin (`/plugin install salesforce-development@claude-plugins-official`) for the schema and Apex/SOQL language-server tools that `../../../sf-know/references/org-context/guide.md` prefers. Mention that its telemetry is on by default (`SF_DISABLE_TELEMETRY=1` turns it off).
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
| Default org | `sf config get target-org --json` | read `.sf/config.json` | alias + type or `org=unset` |
| Org-context tools | tool list contains `validate_soql` / `get_metadata_type_fields` | none | `present` or `absent (CLI fallback)` |

## Cross-skill integration

| Need | Delegate to | Reason |
| --- | --- | --- |
| Deploy / retrieve / test / org CLI | `sf-deploy mode:cli` | This skill only verifies install |
| Generate Apex / Flow / metadata | matching `*-generate` skill | Authoring is not setup |
| Agentforce authoring | `sf-generate type:agent` | Different toolchain |

## Related

- Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).
- Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.
