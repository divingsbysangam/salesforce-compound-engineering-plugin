# Persona Structure

Read with `create-agent-skills/SKILL.md`. Procedure lives here.

## Persona Structure
A persona is a prompt asset with **minimal frontmatter** — `name` and `description` only. The agent-era `model`, `tools`, `color`, and `scope` fields are gone: the dispatching skill chooses the subagent's tools and model at dispatch time.

```markdown
---
name: sf-{domain}-{role}
description: {One-line description — also the auto-routing trigger}
---

> Persona prompt asset — dispatched by workflow skills as an isolated subagent (or applied inline on harnesses without a subagent primitive). Not a registered agent.

# {Persona Title}

**SCOPE: {APEX_ONLY | LWC_ONLY | AUTOMATION_ONLY | INTEGRATION_ONLY | UNIVERSAL}** — state scope in prose (no `scope` field).

{Role description — who you are and what you check/produce}

