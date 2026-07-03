# Principles

The seven principles that make this plugin opinionated, in priority order. Every skill in `skills/` and every persona under `skills/<owner>/references/personas/` should be coherent with these. When the implementation drifts from a principle, fix the implementation — don't soften the principle.

This document is the source of truth. `CLAUDE.md`, `README.md`, and the seven core workflow skills (`sf-brainstorm`, `sf-plan`, `sf-deepen`, `sf-work`, `sf-review`, `sf-compound`, `sf-lfg`) all reference these principles by number.

---

## 1. Preserve the quality ceiling — vibe coding is not shipping

Vibe coding raises the floor for what anyone can produce. Agentic engineering preserves the ceiling that production Salesforce orgs already require. You are not allowed to introduce CRUD/FLS bypasses, governor-limit regressions, or sharing-model violations because an agent wrote the diff.

**Why it matters.** The same model that refactors a 100k-line codebase will also confidently tell a Salesforce admin that an unbulkified trigger is fine because "it works on this test record." The model is jagged; the org is not. A vulnerability is a vulnerability regardless of which keyboard typed it.

**How this plugin enforces it.** `sf-review` runs security and governor agents on every diff. `sf-lfg` aborts the pipeline on Critical/High security findings rather than routing them to a "warnings" bucket. The non-negotiable gates are listed at the top of `skills/sf-review/SKILL.md`.

---

## 2. Verifiability is the automation lever — design specs so outputs are checkable

Tasks you can verify can be automated harder. Tasks you cannot verify regress silently and stay regressed. Before you write a Salesforce feature, name the thing that proves it works.

**Why it matters.** Reinforcement learning rewards verifiable outputs, which is why coding and math advanced faster than aesthetics or product judgment. The same dynamic shows up at the project scale: features with explicit acceptance criteria converge; features without them drift. In Salesforce specifically, "tests get written after the fact" is the default failure mode — verification needs to be a planning artifact, not a cleanup task.

**How this plugin enforces it.** `skills/sf-plan/SKILL.md` requires a **Verification Strategy** section in every plan: what's the SOQL/Apex assertion, what's the bulk threshold, what's the integration mock, what's the deployment dry-run. `sf-lfg` will not advance from `plan` to `work` until the verification strategy is filled in. `sf-work`'s System-Wide Test Check (5 questions) is the runtime mirror of this.

---

## 3. Stay in the loop — assume jagged intelligence

The same model that finds a zero-day will tell you to walk to a 50-meter car wash. The capability surface is jagged: superhuman in one circuit, dumb in the next. Treat agents as tools, not employees. You stay in the loop on the categories of failure they can't see.

**Why it matters.** Salesforce has dozens of these jagged edges: order of execution, sharing recalculation, async governor limits, mixed-DML rules, MIXED_DML_OPERATION inside Queueables, recursive trigger contexts. An agent that writes a confident-looking trigger will not flag that the same logic in a `before update` and `after update` context will double-fire under workflow recursion. You will.

**How this plugin enforces it.** `sf-review` looks for *categories* of failure (governor classes, sharing classes, trigger-recursion classes), not just diff-line issues. The five System-Wide Test Check questions in `sf-work` are exactly the jagged-edge checks an agent will skip without prompting. Human-in-the-loop is structurally required at every gate in `sf-lfg`.

---

## 4. The spec is the artifact — co-design it, don't just plan-mode it

A thin "plan mode" outline is not a spec. The agent is good at filling blanks. You are good at deciding which blanks exist. Co-design a detailed spec — including verification, sharing model, and order-of-execution implications — then let the agent fill in the rest.

**Why it matters.** Most failed Salesforce builds fail at spec, not at code. "Build a Lead auto-assignment flow" is not a spec; "auto-assign Leads to the Owner with the lowest open-Lead count within the Lead's geo Territory, falling back to round-robin within the Territory's queue when no eligible Owner exists, with full bulk safety up to a 200-record import" is a spec. The first one produces 80 lines of plausible Apex that hand-waves the geo lookup; the second one produces working code on the first try.

**How this plugin enforces it.** `sf-plan` produces three sections per plan — `spec.md`, `plan.md`, `tasks.md`. `sf-deepen` is explicitly a *spec-tightening pass*, not a research dump: it adds governor analysis, sharing impact, order-of-execution placement, and API-version constraints to the spec, not generic best-practice prose. The agent fills the blanks the human declared.

---

## 5. Taste, judgment, oversight are the human's job

Models produce code that "works but is gross" — bloaty, copy-pasted, awkwardly abstracted, brittle. The fix is not better prompts. The fix is human review with explicit aesthetic standards.

**Why it matters.** A trigger handler that works on first run but duplicates 40 lines of CRUD/FLS boilerplate across three handlers will pass every test and fail the next refactor. A "works but gross" Salesforce metadata bundle compounds: each new feature pays the tax. Aesthetic debt is real debt.

**How this plugin enforces it.** `sf-review` includes `sf-code-simplicity-reviewer` and `pattern-recognition-specialist` for exactly this reason. `sf-compound` captures *aesthetic and taste learnings* (e.g., "we standardized on the `fflib_SObjectDomain` pattern because three handlers had reinvented selector logic") alongside bug-fix learnings. The capture is structured; the judgment is yours.

---

## 6. Agent-native docs over human-native docs

When you write a skill, an agent file, a CLAUDE.md entry, or a solution doc, ask: "what is the piece of text I would copy-paste to my agent?" That copy-paste-to-agent block is the doc. Everything else is a human-readable preamble around it.

**Why it matters.** Salesforce's own documentation is the canonical example of human-native docs that strand agents — "open Setup, navigate to Object Manager, click..." None of that helps an agent. The plugin's job is to translate Salesforce's GUI-shaped knowledge into copy-paste blocks an agent can act on directly.

**How this plugin enforces it.** Each of the seven core workflow skills carries a top-of-file "Copy-paste-to-agent" block — the literal prompt or command an agent should receive when the skill triggers. Domain skills (`governor-limits`, `apex-patterns`, `lwc-patterns`, etc.) follow the same pattern in a follow-up pass. `docs/solutions/` entries include a "Resolution" block written for an agent to apply directly, not an admin to follow visually.

---

## 7. Outsource thinking, not understanding

You can hand off the typing, the API recall, the boilerplate. You cannot hand off knowing why the system is shaped the way it is. The bottleneck is comprehension. Build the wiki that lets future-you and future-agents re-derive context.

**Why it matters.** A Salesforce org accretes decisions for years — why is this Account.Industry a picklist instead of a lookup? why is this trigger handler `without sharing`? why does this Flow have a wait element? An agent can refactor the code; it cannot recover the decision. Without a knowledge base, every refactor risks breaking an invariant nobody remembered to encode.

**How this plugin enforces it.** `docs/solutions/` is institutional memory: every solved problem becomes a YAML-frontmatter doc validated against `schema.yaml`. `sf-learnings-researcher` searches it on every plan and every implementation. `sf-plan` treats prior learnings as **must-read**, not optional context. Knowledge compounds; the next iteration starts smarter than the last.

---

## How to use these principles

- **When writing a new skill or persona**, name which principles it serves in its frontmatter `description`. If you cannot name one, the skill probably does not belong in this plugin.
- **When reviewing a PR against this plugin**, a finding that violates a principle outranks a finding that doesn't. "This violates Principle 2" is sufficient justification to block.
- **When the principles conflict** (rare, but happens — e.g., Principle 2 demands verification, Principle 4 demands a spec, and a one-line typo fix has neither), the principles are priority-ordered. Lower-numbered wins.

---

## Inspiration

These principles are paraphrased from Andrej Karpathy's talk at the Y Combinator AI Startup School (transcript ID `96jN2OCOfLs`). The framing — "agentic engineering preserves the quality bar," "you can outsource thinking but not understanding," "verifiability is the automation lever," "stay in the loop because intelligence is jagged," and the agent-native docs critique — is his. The Salesforce-specific application, the mapping to skills, and any errors in interpretation are this plugin's.

The talk's bigger argument — that we're transitioning from Software 1.0 (explicit rules) through 2.0 (learned weights) to 3.0 (programmable LLMs where the prompt is the program) — is the assumption this plugin operates under. If you don't accept that assumption, the principles will feel over-cautious; if you do, they will feel under-cautious.
