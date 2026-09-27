# /sf-plan mode:brainstorm

> **Persona dispatch.** This skill dispatches its research personas as isolated subagents — see `../../../sf-work/references/dispatch/guide.md` for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). Research personas are referenced from `../personas/`.

> **Principles enforced:** 4 (spec is the artifact, in embryo). See `PRINCIPLES.md`.

**Strategy grounding:** If a `STRATEGY.md` exists at the repo root, read it first so the brainstorm stays inside the program's target problem, approach, and personas.

## Copy-paste-to-agent

```
Run a Salesforce-aware brainstorm to refine a feature idea before planning. Ask one
focused question at a time about problem, users, scale, and constraints. For each viable
approach, evaluate the declarative-vs-code trade-off (governor limits, maintenance,
testability, sharing impact). Save the result to docs/brainstorms/YYYY-MM-DD-{slug}.md as
input to /sf-plan — this is pre-spec exploration, not a spec.
```

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Interaction Method

When asking the user a question, use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.

Ask one question at a time. Prefer a concise single-select choice when natural options exist.

You are facilitating a brainstorm session to explore an idea before planning. Your job is to help think through approaches, trade-offs, and Salesforce-specific considerations.

## Goal

Explore and refine: `$ARGUMENTS.idea`

***

## Phase 0: Assess Clarity

Rate the idea's clarity:

* **Clear**: User knows what they want, specific requirements → Move fast through Phase 1

* **Exploratory**: User has a general direction but needs options → Spend time in Phase 2

* **Vague**: User has a problem but no direction → Start deep in Phase 1

***

## Phase 1: Understand (One Question at a Time)

Ask focused questions using the AskUserQuestion tool. One question per round:

1. **What problem does this solve?** — Understand the pain point
2. **Who uses this?** — Admin, developer, end user, integration
3. **What exists today?** — Current workaround or manual process
4. **What's the scale?** — Records, users, frequency
5. **What are the constraints?** — Timeline, org limits, existing architecture

Stop asking when the idea is clear enough to explore approaches. Don't over-question.

***

## Phase 2: Explore Approaches

For each viable approach, evaluate Salesforce-specific trade-offs:

### Declarative vs Code Decision Matrix

| Factor             | Declarative (Flow)    | Code (Apex)         | Hybrid       |
| ------------------ | --------------------- | ------------------- | ------------ |
| Maintainability    | Admin-friendly        | Developer-required  | Mixed        |
| Governor Limits    | Flow-specific limits  | Full Apex limits    | Best of both |
| Complexity ceiling | Medium                | High                | High         |
| Testing            | Limited               | Full test framework | Full         |
| Deployment         | Change sets, metadata | Same + CI/CD        | Same         |

### For each approach, assess:

* **Feasibility**: Can Salesforce do this natively?

* **Scalability**: Will it work at the expected data volume?

* **Security**: Sharing model implications?

* **Maintenance**: Who will maintain this long-term?

* **Governor Limits**: What limits are at risk?

### Optional: Parallel Research

If approaches are unclear, dispatch research personas:

* Task sf-external-researcher(idea\_context)

***

## Phase 3: Capture

Save the brainstorm to `docs/brainstorms/YYYY-MM-DD-{topic-slug}.md`:

```markdown
---
title: "{topic}"
date: YYYY-MM-DD
status: complete
participants: [user, claude]
---

# Brainstorm: {topic}

## Problem Statement
{What problem are we solving}

## Key Requirements
- {requirement 1}
- {requirement 2}

## Approaches Considered

### Approach A: {name}
- **How**: {description}
- **Pros**: {list}
- **Cons**: {list}
- **SF Considerations**: {governor limits, sharing, etc.}

### Approach B: {name}
- **How**: {description}
- **Pros**: {list}
- **Cons**: {list}
- **SF Considerations**: {governor limits, sharing, etc.}

## Chosen Approach
{which approach and why}

## Open Questions
- {question 1}
- {question 2}

## Next Steps
- /sf-plan {feature description}
```

***

## Phase 4: Handoff

When brainstorm is complete:

```
Brainstorm captured: docs/brainstorms/YYYY-MM-DD-{topic}.md

Approaches explored: {count}
Chosen approach: {name}
Open questions: {count}

Next: /sf-plan {feature description based on chosen approach}
```
