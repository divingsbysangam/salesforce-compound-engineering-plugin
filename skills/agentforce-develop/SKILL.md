---
name: agentforce-develop
description: "Build, modify, debug, and deploy Agentforce agents written in Agent Script. Use when creating or modifying .agent files or aiAuthoringBundle metadata, designing subagents and actions, writing or reviewing an Agent Spec, or running sf agent generate / preview / validate / publish / activate. Trigger phrases: 'build an Agentforce agent', 'create an agent for', 'write an Agent Script', 'design subagents for', 'add an action to my agent', 'deploy this agent', 'publish my Agentforce bundle'. Do NOT trigger for Agentforce test suites (`agentforce-test`), production session traces (`agentforce-observe`), Prompt Template XML alone (`prompt-builder`), hosted MCP tools (`mcp-tool-builder`), or plain Apex / Flow / LWC (`apex-generate` / `flow-generate` / `sf-work`)."
argument-hint: "[agent name, .agent file path, or agent description; optional 'employee' or 'service' agent type]"
---

# <span data-proof="authored" data-by="ai:claude">/agentforce-develop</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling), 4 (spec is the artifact), 7 (institutional memory). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

* **When to use this skill** — read `references/when-to-use-this-skill.md` before acting on this section.

* **Rules that always apply** — read `references/rules-that-always-apply.md` before acting on this section.

* **⚠️ Deprecated Syntax — Use** **`subagent`** **not** **`topic`** **(April 2026)** — read `references/deprecated-syntax-use-subagent-not-topic-april-2026.md` before acting on this section.

* **Step 0: Pre-implementation research (parallel, Principle 7)** — read `references/step-0-pre-implementation-research-parallel-principle-7.md` before acting on this section.

* **Step 1: Design the agent and produce an Agent Spec** — read `references/step-1-design-the-agent-and-produce-an-agent-spec.md` before acting on this section.

* **Step 2: Validate environment prerequisites** — read `references/step-2-validate-environment-prerequisites.md` before acting on this section.

* **Step 3: Generate the authoring bundle** — read `references/step-3-generate-the-authoring-bundle.md` before acting on this section.

* **Step 4: Write Agent Script in the** **`.agent`** **file** — read `references/step-4-write-agent-script-in-the-agent-file.md` before acting on this section.

* **Step 5: Validate compilation** — read `references/step-5-validate-compilation.md` before acting on this section.

* **Step 6: Generate backing logic (Apex / Flow / Prompt Template stubs)** — read `references/step-6-generate-backing-logic-apex-flow-prompt-template-stubs.md` before acting on this section.

* **Step 7: Preview with live actions and read traces (Principle 3)** — read `references/step-7-preview-with-live-actions-and-read-traces-principle-3.md` before acting on this section.

* **Step 8: Publish, activate, verify** — read `references/step-8-publish-activate-verify.md` before acting on this section.

* **Step 9: End-user access (employee agents only)** — read `references/step-9-end-user-access-employee-agents-only.md` before acting on this section.

* **Capture learnings (Principle 7)** — read `references/capture-learnings-principle-7.md` before acting on this section.

* **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Build, modify, or deploy an Agentforce agent written in Agent Script. Always go through the
Agent Spec gate before writing code — the spec is the artifact (Principle 4). For backing
logic, scan sfdx-project.json package directories for existing @InvocableMethod classes,
AutoLaunchedFlows, and PromptTemplates before creating stubs (Principle 7). Validate compilation
with sf agent validate, preview behavior with sf agent preview --use-live-actions, then
publish + activate. Never proceed past spec creation without explicit user approval.
Always pass --json on every sf CLI command. Fail-closed: `sf agent validate` must run
before backing logic or publish. Paste actual output, or `validate=unavailable: <reason>`
after the fallback. Empty or skipped validation is not a pass.
```

## Cross-skill integration

| Need                                  | Delegate to                                          | Reason                                   |
| ------------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| Smoke / batch / safety tests          | `agentforce-test`                                    | This skill authors; that skill verifies  |
| Production session diagnosis          | `agentforce-observe`                                 | STDM / preview reproduction              |
| Invocable / Flow / prompt backing     | `apex-generate` / `flow-generate` / `prompt-builder` | Stubs this skill names, others implement |
| Hosted MCP tool the agent should call | `mcp-tool-builder`                                   | Tool contract                            |
| Capture an Agent Script gotcha        | `sf-compound`                                        | Institutional memory                     |