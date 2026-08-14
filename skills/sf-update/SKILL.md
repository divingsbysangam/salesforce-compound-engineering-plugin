---
name: sf-update
description: "Check for and apply updates to the sf-compound-engineering-plugin from upstream. Use when the user says 'update the plugin', 'check for plugin updates', 'is there a newer sf-compound-engineering version'."
argument-hint: "[no arguments]"
---

# sf-update

Check the GitHub releases endpoint for divingsbysangam/salesforce-compound-engineering-plugin against the locally installed version, present the changelog delta, and optionally run `claude /plugin update sf-compound-engineering`.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Salesforce Angle

* Upstream URL is `https://github.com/divingsbysangam/salesforce-compound-engineering-plugin`. The skill checks the GitHub releases endpoint for the latest tag and compares against the installed version.

* Local plugin install lives at the marketplace cache path; reference `.claude-plugin/plugin.json#version` for the installed version.

* Salesforce skill/agent updates may include changes to docs/solutions/ schema — surface schema breaks before applying.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## Procedure

This skill follows the standard sf-compound-engineering execution discipline:

1. **Understand the input** — read the `<feature_description>` block above and any referenced files, plans, or issues.
2. **Plan a small set of phases** — break the work into 2-5 ordered steps that an implementer (or another skill) can verify.
3. **Apply the Salesforce Angle notes above** — these encode the platform-specific considerations (governor limits, sharing context, deploy ordering, FLS, metadata semantics) that distinguish this skill from generic counterparts.
4. **Use Salesforce-aware contexts and commands** — file paths under `force-app/main/default/...`, test commands like `sf apex run test`, deploy commands like `sf project deploy validate` and `sf project deploy start`, query the org with `sf data query` when state inspection is needed.
5. **<span data-proof="authored" data-by="ai:claude">Surface decisions back to the user</span>** <span data-proof="authored" data-by="ai:claude">— when a step requires a choice that materially affects scope or risk, ask using the platform's blocking question tool rather than guessing.</span>

## Related

* Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).

* Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.