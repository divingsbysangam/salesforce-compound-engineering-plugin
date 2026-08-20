---
name: create-agent-skills
description: "Guide for adding new personas and skills to the SF Compound Engineering Plugin. Use when creating a new review/research persona, adding a domain-knowledge or workflow skill, or wiring a new specialist concern into sf-review / sf-doc-review / sf-plan. Encodes the agentless (V3.1) conventions: personas are skill-local prompt assets, not registered agents."
argument-hint: "[optional: 'persona' or 'skill', plus the concern to add]"
---

# Creating Personas and Skills

Guide for extending the SF Compound Engineering Plugin. **V3.1 is agentless** — there are no standalone registered agents. Specialist behavior lives as **persona prompt assets** owned by the workflow skill that dispatches them, and shipped to every platform as ordinary skill files. Read `../../CLAUDE.md` (Architecture) and `PRINCIPLES.md` before non-trivial changes.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Personas vs. skills** — read `references/personas-vs-skills.md` before acting on this section.
- **Persona Structure** — read `references/persona-structure.md` before acting on this section.
- **Your Process** — read `references/your-process.md` before acting on this section.
- **Output Format** — read `references/output-format.md` before acting on this section.
- **When to Use** — read `references/when-to-use.md` before acting on this section.
- **Skill Structure** — read `references/skill-structure.md` before acting on this section.
- **Skill tiers (Protocol A/B)** — read `references/skill-tiers-protocol-a-b.md` before acting on this section.
- **Content quality — pressure-testing discipline-gate skills** — read `references/content-quality-pressure-testing-discipline-gate-skills.md` before acting on this section.
- **After Creating** — read `references/after-creating.md` before acting on this section.
- **Naming Conventions** — read `references/naming-conventions.md` before acting on this section.

