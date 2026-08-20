---
name: flow-generate
description: "Generate Salesforce Flow metadata (Screen / Autolaunched / Record-Triggered before-save and after-save / Scheduled) using the MCP `execute_metadata_action` pipeline (fetchGroundedObjectMetadata → flowElementSelection → flowElementGeneration). Use this skill for any Flow generation. Trigger phrases: 'create a flow', 'build a flow that', 'when a record is created send', 'trigger daily at', 'send an email when', 'update the field when', 'automate this with a flow', 'generate flow XML', 'autolaunched flow for'. Pairs with `flow-patterns` (reference). Do NOT trigger for Apex automation — use `apex-generate`."
argument-hint: "[flow type and intent, e.g. 'before-save flow on Lead to populate territory' or 'screen flow for case escalation']"
---

# /flow-generate

> **Principles enforced:** 1 (preserve the quality ceiling), 4 (spec is the artifact), 2 (verifiability). See `PRINCIPLES.md`.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **The pipeline is non-negotiable** — read `references/the-pipeline-is-non-negotiable.md` before acting on this section.
- **Step 0: Pre-implementation research (parallel, Principle 7)** — read `references/step-0-pre-implementation-research-parallel-principle-7.md` before acting on this section.
- **Post-generation validation (mandatory, Principle 2)** — read `references/post-generation-validation-mandatory-principle-2.md` before acting on this section.
- **Hard constraints (every rule fails the deliverable if violated)** — read `references/hard-constraints-every-rule-fails-the-deliverable-if-violated.md` before acting on this section.
- **Output report** — read `references/output-report.md` before acting on this section.
- **Hand off** — read `references/hand-off.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## Copy-paste-to-agent

```
Generate a Salesforce Flow by running the strict 3-step MCP pipeline. The pipeline IS the
contract: fetchGroundedObjectMetadata → flowElementSelection → flowElementGeneration.
Loop on flowElementGeneration with the same operationId until isComplete=true. Never
hand-write Flow XML. Never skip steps. After XML is returned, validate with
sf code-analyzer and dispatch flow-governor-monitor + flow-complexity-analyzer review
agents in parallel. Bulkify per Salesforce flow best practices: no DML/SOQL inside loops.
```
