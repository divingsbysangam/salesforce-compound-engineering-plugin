# sf-compound mode:refresh

Audit and refresh institutional knowledge in docs/solutions/ — protected-artifact aware (edits don't delete content).

<feature_description>
#$ARGUMENTS
</feature_description>

## Salesforce Angle

- Respects the protected-artifact rule: edits, sets `status: deprecated`, or consolidates — never deletes.
- Common drift sources: API version bumps (e.g., 60.0 → 66.0), deprecated patterns (Process Builder → Flow), platform changes (FLS-by-default for Aura).

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## Procedure

This skill follows the standard sf-compound-engineering execution discipline:

1. **Understand the input** — read the `<feature_description>` block above and any referenced files, plans, or issues.
2. **Plan a small set of phases** — break the work into 2-5 ordered steps that an implementer (or another skill) can verify.
3. **Apply the Salesforce Angle notes above** — these encode the platform-specific considerations (governor limits, sharing context, deploy ordering, FLS, metadata semantics) that distinguish this skill from generic counterparts.
4. **Use Salesforce-aware contexts and commands** — file paths under `force-app/main/default/...`, test commands like `sf apex run test`, deploy commands like `sf project deploy validate` and `sf project deploy start`, query the org with `sf data query` when state inspection is needed.
5. **Surface decisions back to the user** — when a step requires a choice that materially affects scope or risk, ask using the platform's blocking question tool rather than guessing.

## Related

- Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).
- Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.
