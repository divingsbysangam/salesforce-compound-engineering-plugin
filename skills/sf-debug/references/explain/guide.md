# Explain It To Me

Teach the user one thing well: a concept, a change, an idea, or a window of their own recent work. Agent-driven development removed the learning that writing code by hand used to provide; this skill is the replacement — the human keeps learning while agents do the writing.

What to explain is the input this skill was invoked with, present in the current prompt or conversation (whether the user asked directly or a calling skill passed it).

**Note: The current year is 2026.** Use this when weighting external sources and dating artifacts.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Who the explainer is for** — read `references/who-the-explainer-is-for.md` before acting on this section.
- **Model Tiers** — read `references/model-tiers.md` before acting on this section.
- **Execution Flow** — read `references/execution-flow.md` before acting on this section.
- **Boundaries** — read `references/boundaries.md` before acting on this section.

## Dispatch

Follow this skill's references for any subagent. A harness with no subagent tool runs that pass inline and says so in one line. Do not load a separate context script, and do not re-ask whether the invocation authorized the skill's own passes.

## Interaction Method

When you must ask the user a question, use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_question` in Antigravity CLI (`agy`), `ask_user` in Pi (requires the `pi-ask-user` extension). Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors (e.g., Codex edit modes) — not because a schema load is required. In the fallback, stop and wait for the user's reply. Never silently skip the question. Ask one question at a time.

## Artifact Root

This skill writes an explainer under `<root>/explainers/` only when it archives one to the repo, and may read learnings under `<root>/solutions/`. Resolve `<root>` (per the block below) only when you actually compose such a path — a scratch-only or external-concept explainer writes to its run directory and never needs it, so do not resolve or create a root at the start of every run. Pass the resolved path to any subagent when you do resolve it, not the config.

<!-- sf-docs-root:start -->
**Resolve the SFCE artifact root `<root>` before composing any artifact path.**

- **Read** `docs_root` from `<repo-root>/.compound-engineering/config.yaml` only (`<repo-root>` = `git rev-parse --show-toplevel`). Do not read `docs_root` from `config.local.yaml`. Unset -> `<root>` is `docs`, exactly as before.
- **Ordinary keys** other than `docs_root`: read `<repo-root>/.compound-engineering/config.local.yaml`, then `config.yaml`. Missing files are skipped. The first active (non-comment) value wins. An empty scalar is unset and the next layer applies. A present list or map, including an empty one, wins as a whole.
- **Validate** a set value: a repo-relative directory whose real, symlink-resolved path stays inside the repo and is neither the repo root nor under `.git/`. Otherwise stop with an error naming `docs_root` and the value -- never fall back to `docs`.
- **Use** `<root>` as the sole artifact location: create it if absent, compose each path as `<root>/<subdir>` with this skill's own subdirectory, and never also read `docs`.
<!-- sf-docs-root:end -->
