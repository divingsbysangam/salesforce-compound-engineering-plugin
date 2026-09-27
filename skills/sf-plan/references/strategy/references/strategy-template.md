# Salesforce Strategy Template

Loaded by `SKILL.md` after the interview is complete. Fill it in using the captured answers and write to `STRATEGY.md`.

## Rules for filling in

- Use the user's own language where possible. Do not paraphrase into generic PM-speak or platform truisms.
- Each section stays compact. The whole doc should read in under 5 minutes.
- Section order is locked. Do not add new top-level sections.
- Optional sections: delete entirely if unused. Do not leave empty headers.
- Set `last_updated` in the YAML frontmatter to today's ISO date (YYYY-MM-DD). Do not duplicate the date in prose.
- Set `name` to the program/product name (same value as the H1 title).
- Set `context` to the Phase 0 choice: `internal-org`, `consulting-engagement`, or `isv-product`.

## Template

The block below is the literal file to write (minus this line and the fences). Replace every `{{placeholder}}` with the captured answer. Delete any optional section whose placeholder wasn't answered.

~~~markdown
---
name: {{program_name}}
context: {{internal-org | consulting-engagement | isv-product}}
last_updated: {{YYYY-MM-DD}}
---

# {{program_name}} Strategy

> Context: {{one line — e.g. "Internal Service Cloud org for the support org" / "Acme Corp CPQ engagement (SOW-2026-014)" / "AppExchange managed package for field-service SMBs"}}

## Target problem

{{1-2 sentence diagnosis. Names the business situation and the crux that makes it hard. No solution language.}}

## Our approach

{{1-2 sentence guiding policy. The choice (native-first / declarative-first / Agentforce-led / integration-hub / managed-package boundary, etc.) that makes the target problem tractable. Implies what you are NOT doing.}}

## Who it's for

**Primary:** {{Persona name}} ({{internal | external}}) — {{one-sentence JTBD, e.g. "They're hiring this to..."}}

<!-- ISV only: name the buyer separately if it differs from the end user.
**Buyer:** {{subscriber admin persona}} — {{what they need to say yes}} -->
<!-- Duplicate the Primary block only if a second persona is truly load-bearing. Fewer is better. -->

## Key metrics

- **{{metric 1 name}}** — {{one-line definition; where it's measured: Lightning Usage App / report / EventLogFile / the data}}
- **{{metric 2 name}}** — {{...}}
- **{{metric 3 name}}** — {{...}}

<!-- 3-5 total. Stop at 5. Prefer business-outcome and adoption metrics over build-output counts. At most one platform-health metric. -->

## Tracks

### {{Track 1 name}}

{{One line: the investment area, not a feature/metadata list.}}

_Why it serves the approach:_ {{one line}}

<!-- Duplicate for 2-4 tracks total. If you can't keep it to 4, fold related tracks together. -->

## Milestones

- **{{YYYY-MM-DD}}** — {{milestone — go-live, UAT gate, Salesforce release dependency, renewal}}

<!-- Optional. Delete the section if unused. Only real, externally visible milestones. -->

## Not working on

- {{one line per item — the tempting custom-code path or premature framework you're deferring}}

<!-- Optional. Delete the section if unused. -->

## Positioning / enablement

**One-liner:** {{single-sentence pitch (ISV) or rollout/adoption message (internal/consulting)}}

**Key message:** {{2-3 lines if useful}}

<!-- Optional. Delete the section if unused. -->
~~~

## Post-write checklist

Before confirming the write, scan the draft for:

- [ ] Frontmatter present with `name`, `context`, and `last_updated` keys.
- [ ] `last_updated` carries today's date in ISO format (YYYY-MM-DD).
- [ ] `context` is one of the three allowed values.
- [ ] No section has more than 4 sentences except Tracks (each track has its own short block).
- [ ] No placeholders remain (`{{...}}`).
- [ ] Optional sections with no content deleted, not left empty.
- [ ] Metric count is 3–5 and skews to outcomes/adoption, not build-output counts. Track count is 2–4.
- [ ] Target problem and Our approach are connected — one clearly responds to the other.
- [ ] No section is a metadata inventory (object/flow/Apex lists belong in plans, not strategy).
