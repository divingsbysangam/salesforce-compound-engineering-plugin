---
name: sf-test-browser
tier: workflow
description: Run browser tests for Salesforce UI pages affected by the current branch or PR. Use for changed LWC, Aura, Lightning App Builder, Experience Cloud, or static-resource UI behavior when a browser-accessible local or org preview is available.
argument-hint: "[PR number, branch name, 'current', or --port PORT]"
---

# Browser Test Skill

Run end-to-end browser tests on pages affected by a PR or branch using the best approved browser driver available in the active harness.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Modes** — read `references/modes.md` before acting on this section.
- **Browser Driver Policy** — read `references/browser-driver-policy.md` before acting on this section.
- **Workflow** — read `references/workflow.md` before acting on this section.
- **Browser Test Results** — read `references/browser-test-results.md` before acting on this section.
- **Quick Usage Examples** — read `references/quick-usage-examples.md` before acting on this section.
- **Driver Reference** — read `references/driver-reference.md` before acting on this section.
