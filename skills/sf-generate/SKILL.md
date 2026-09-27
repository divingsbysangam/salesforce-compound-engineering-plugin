---
name: sf-generate
description: "Generate Salesforce source: Apex, triggers, Flows, objects/fields/tabs/apps, permission sets, validation rules, FlexiPages, test data, prompt templates, MCP tools, Agentforce agents and tests."
argument-hint: "type:<apex|trigger-refactor|flow|metadata|permission-set|validation-rule|lightning-page|test-data|prompt-template|mcp-tool|agent|agent-test> [what to build]"
---

# /sf-generate

> **Principles enforced:** 1 (quality ceiling), 2 (verifiability). See `PRINCIPLES.md`.

## Route

First argument `type:<name>` (or `mode:<name>`) picks the generator. If absent, infer it from the request or the target file (`*.cls` → apex, `*.trigger` → trigger-refactor, `*.flow-meta.xml` → flow, other `*-meta.xml` → metadata). Load **only** that generator's guide.

| Type | Builds | Guide |
|---|---|---|
| `apex` | Service, selector, domain, batch, queueable, invocable classes + tests | `references/apex/guide.md` |
| `trigger-refactor` | Move logic out of legacy triggers into a handler | `references/trigger-refactor/guide.md` |
| `flow` | Screen, autolaunched, record-triggered, scheduled Flows | `references/flow/guide.md` |
| `metadata` | Custom objects, fields, apps, tabs, list views, Lightning types | `references/metadata/guide.md` |
| `permission-set` | Permission sets with object, FLS, Apex, tab access | `references/permission-set/guide.md` |
| `validation-rule` | Validation rules with correct formula XML | `references/validation-rule/guide.md` |
| `lightning-page` | FlexiPages (record, app, home) and Lightning apps | `references/lightning-page/guide.md` |
| `test-data` | Apex test data factory | `references/test-data/guide.md` |
| `prompt-template` | Prompt Builder templates and their invocation | `references/prompt-template/guide.md` |
| `mcp-tool` | Apex/Flow tools exposed through MCP | `references/mcp-tool/guide.md` |
| `agent` | Agentforce agents in Agent Script (`.agent`) | `references/agent/guide.md` |
| `agent-test` | Agentforce test specs and runs | `references/agent-test/guide.md` |

## Rules for every type

1. **Read the org's shape before writing.** Use the project's existing source (`force-app/`) as the pattern, and query the org (describe, SOQL, retrieve) when a field or object name is uncertain. Never invent API names.
2. **Follow the project's framework.** Reuse the existing trigger framework, selector layer, and test factory if present.
3. **Generate the test with the code.** Apex without a test class is incomplete.
4. **Verify before handing back.** Run `sf project deploy validate --dry-run` (or `/sf-deploy mode:validate`) on the generated files and fix every error.
5. **Knowledge on demand.** For patterns and limits, load the matching `../sf-know/references/<topic>/guide.md` only when needed.
