# Skill Structure

Read with `create-agent-skills/SKILL.md`.

## Skill Structure

Skills live in `skills/{skill-name}/` with a `SKILL.md` file carrying `name`, `description`, and (optionally) `argument-hint` frontmatter. The `description` field powers auto-routing — enumerate Salesforce-flavored trigger phrases there, not in the body.

```markdown
---
name: {skill-name}
description: "{What this does + trigger phrases users would say}"
argument-hint: "[optional argument hint]"
---

# {Skill Name}

{Description of what knowledge this skill provides, or what workflow it runs}

## {Section 1}
{Content — patterns, reference, examples, or steps}

## {Section 2}
{More content}
```

A skill that dispatches personas should carry a **"Persona dispatch"** note after its H1 — a one-line pointer to the `dispatching-parallel-personas` skill for the shared mechanics (isolated subagents, same-response parallelism, same-file-conflict check) plus this skill's own pointer to where its personas live (see any workflow skill for the wording) — and a dispatch list naming the personas it runs.

### Skill Design Principles

1. **Reference, not instructions**: domain skills provide knowledge; workflow skills + personas use it.
2. **Scoped**: each skill has a clear scope (APEX\_ONLY, UNIVERSAL, etc.) stated in prose.
3. **Searchable**: clear headings and code examples.
4. **Concise**: include only what's needed for decision-making.
5. **Substance over sycophancy**: agent-facing skill and persona prose should avoid gratitude-performance language ("You're absolutely right!", "Thanks for catching that!") in favor of verified substance — this keeps the pattern from creeping into future skills.

***

