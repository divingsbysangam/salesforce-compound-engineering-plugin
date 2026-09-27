# /sf-plan mode:strategy — Salesforce Product & Program Strategy

> **Principles enforced:** especially 4 (the spec is the artifact — STRATEGY.md is a durable, version-controlled anchor) and 5 (taste over typing — the strategic choices are human calls). See `PRINCIPLES.md`.

> **Note: the current year is 2026.** Use this when dating the strategy document.

`sf-plan mode:strategy` produces and maintains `STRATEGY.md` — a short, durable anchor that captures what the Salesforce program or product is, who it serves, how it succeeds, and where the team is investing. It lives at the repo root as a canonical file (peer of `README.md`). The loop skills (`sf-plan mode:ideate`, `sf-plan mode:brainstorm`, `sf-plan`) read it as grounding when it exists, so the autonomous middle of the pipeline is anchored to real direction rather than re-derived each run.

The document is short and structured on purpose. Good answers to a handful of sharp questions beat any amount of prose. This skill asks those questions, pushes back on weak answers, and writes the doc.

## Interaction Method

Use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.

Ask one question at a time. Prefer free-form responses for the substantive sections (problem, approach, persona); reserve single-select for routing decisions (which section to revisit). Each option label must be self-contained.

## Focus Hint

<focus_hint> #$ARGUMENTS </focus_hint>

Interpret any argument as an optional focus: a section name to revisit (`metrics`, `approach`, `tracks`) or a scope hint. With no argument, proceed open-ended and let the file state decide the path.

## Core Principles

1. **Anchor, not plan.** Strategy is what the program is and why. Features belong in `sf-plan mode:brainstorm`; implementation belongs in `sf-plan`; schedules belong in the backlog (Jira / Linear / GitHub Issues). Do not let them creep into the doc.
2. **Rigor in the questions, not the headings.** The section headers are plain English. The interview questions enforce strategy discipline.
3. **Short is a feature.** The template is constrained. Adding sections costs more than it looks like. Push back on expansion.
4. **Durable across runs.** This skill is rerunnable. On a second run it updates in place, preserves what is working, and only challenges sections that look stale or weak.
5. **Salesforce-context-aware.** A consulting engagement against a customer org, an internal org program, and an ISV/AppExchange product have different problems, personas, and metrics. Establish the context first (see Phase 0) — it shapes every later question.

## Execution Flow

### Phase 0: Route by File State and Establish Org Context

Read `STRATEGY.md` using the native file-read tool.

- **File does not exist** → First run. Establish org context (below), then go to Phase 1.
- **File exists and argument names a specific section** → Targeted update. Go to Phase 2.
- **File exists, no argument** → Ask which section(s) to revisit, then Phase 2.

Announce the path in one line: "No strategy doc found — let's write it." or "Found existing strategy — let's review and update."

**Org context (first run only).** Ask one single-select question to set the frame, because it changes the interview:

- **Internal org program** — building on a Salesforce org your company owns/operates (the "users" are internal: reps, agents, ops, admins).
- **Consulting engagement** — delivering against a client's org and a signed scope (BRD/SOW); the "users" are the client's business and end users.
- **ISV / AppExchange product** — a packaged product sold to many Salesforce customers (the "users" are subscriber admins and their end users).

Record the chosen context in the template's top note. It does not add a section — it tunes the questions.

### Phase 1: First-Run Interview

Read `references/interview.md`. This load is non-optional — the pushback rules, Salesforce anti-pattern examples, and quality bar for each section live there. Improvising from memory produces a passive transcription instead of a strategy doc.

Run the interview in final-document section order:

1. Target problem
2. Our approach
3. Who it's for
4. Key metrics
5. Tracks
6. Milestones (optional)
7. Not working on (optional)
8. Positioning / enablement (optional)

For each section, ask the opening question, apply the pushback rules, and capture the final answer in the user's own language. Do not skip the pushback step — it is the core of the skill. Two rounds of pushback per section maximum; capture what the user gives after that and note the section is worth revisiting next run.

When all required sections (1–5) are captured, read `references/strategy-template.md`, fill it in, present the full draft in chat before writing, offer one round of edits, then write to `STRATEGY.md`.

### Phase 2: Update Run

Read the existing `STRATEGY.md` thoroughly. Summarize current state in 3–5 lines so the user sees what is on file.

If the argument named a specific section, jump to that section in `references/interview.md`. Preserve all other sections exactly. Apply pushback as if first run — do not rubber-stamp weak content just because it is already written.

If no specific target, ask which section to revisit. For each revisited section, re-interview with full pushback. Leave confirmed-accurate sections untouched. Update `last_updated` in the YAML frontmatter to today's ISO date. Write the updated doc back to `STRATEGY.md`.

### Phase 3: Downstream Handoff

After writing, note in one line where the file lives and that `sf-plan mode:ideate`, `sf-plan mode:brainstorm`, and `sf-plan` will pick it up as grounding on their next run. If no loop skill has run yet on this repo, suggest `/sf-plan mode:ideate` or `/sf-plan mode:brainstorm` as the next step.

## What This Skill Does Not Do

- Does not write requirements (BRD/FRD) or implementation plans — those are `sf-plan mode:brainstorm` and `sf-plan`.
- Does not update the backlog or reconcile in-flight work. Strategy is the doc; execution lives elsewhere.
- Does not compute metric values. It records which metrics matter and where they live (Lightning Usage App, reports, EventLogFile), not what they read today — that is `sf-product-pulse`.
- Does not design the data model or sharing architecture. Those are downstream platform decisions.

## Learn More

The "Target problem / Our approach / Tracks" structure follows Richard Rumelt's *Good Strategy Bad Strategy* — diagnosis, guiding policy, coherent action. The interview questions push past the "bad strategy" patterns: fluff, goals dressed up as strategy, and feature lists (or, in Salesforce terms, object/flow inventories) in place of a guiding choice.
