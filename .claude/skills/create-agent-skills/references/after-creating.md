# After Creating

Read with `create-agent-skills/SKILL.md`. Procedure lives here.

## After Creating
**A new persona:**

1. Save it to the owning skill's `references/personas/<name>.md` (see the ownership table).
2. Wire its name into that skill's dispatch list and "Persona dispatch" note.
3. If it should run during the full pipeline, it's reached automatically — `sf-lfg` delegates to `/sf-review`, `/sf-plan`, etc.
4. Verify it ships: `cli/` copies a skill's whole `references/` subtree, so no manifest edit is needed.

**A new skill:**

1. Add `skills/{skill-name}/SKILL.md` with proper frontmatter.
2. Update `skills/index.md` (routing table).
3. Bump the version across the four manifests (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`).
4. Run the CLI checks: `cd cli && bun run typecheck && bun test`.

***

