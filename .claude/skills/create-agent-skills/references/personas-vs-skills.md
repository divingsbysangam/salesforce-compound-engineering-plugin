# Personas vs. skills

Read with `create-agent-skills/SKILL.md`. Procedure lives here.

## Personas vs. skills
* **Persona** — a specialist *prompt asset* (a reviewer, researcher, or validator) at `skills/<owner>/references/personas/<name>.md`. It is dispatched at runtime as an isolated subagent; it is **not** registered in any manifest.

* **Skill** — a user-facing entry point at `skills/<name>/SKILL.md` that auto-routes from its `description` frontmatter. Workflow skills *dispatch* personas; domain skills *provide knowledge*.

***

