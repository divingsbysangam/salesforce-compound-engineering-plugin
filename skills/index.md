# Salesforce Skills Index

After the V3 migration, all skills live under `skills/<name>/SKILL.md`. The nine core workflow loop skills, plus `/sf-strategy` for product grounding above the loop, were formerly `commands/`) are now first-class skills with auto-routing trigger phrases.

***

## Core Workflow Skills

These were `commands/` files in v2.x. In V3 they auto-route from natural-language phrases via their `description` frontmatter. Direct invocation via `/sf-<name>` still works.

| Skill            | File                     | Use When                                                                                                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/sf-strategy`   | `sf-strategy/SKILL.md`   | Maintain `STRATEGY.md` grounding — above the loop; read by ideate/brainstorm/plan |
| `/sf-tend`       | `sf-tend/SKILL.md`       | Operate Tend-style Salesforce responsibility feeds with cards, approvals, receipts, and reviewed learning |
| `/sf-ideate`     | `sf-ideate/SKILL.md`     | Decide what's worth building — the front "bread" of the loop                                                                                                                                    |
| `/sf-brainstorm` | `sf-brainstorm/SKILL.md` | Pre-planning exploration of a Salesforce feature idea                                                                                                                                           |
| `/sf-plan`       | `sf-plan/SKILL.md`       | Structured implementation plan for Apex/LWC/Flow/Integration/metadata work                                                                                                                      |
| `/sf-deepen`     | `sf-deepen/SKILL.md`     | Strengthen an existing plan with parallel research personas per section                                                                                                                         |
| `/sf-work`       | `sf-work/SKILL.md`       | Execute a plan or feature description with system-wide test checks                                                                                                                              |
| `/sf-review`     | `sf-review/SKILL.md`     | Multi-persona parallel review of code, PR, or local diff                                                                                                                                        |
| `/sf-polish`     | `sf-polish/SKILL.md`     | Stack-aware UI polish — design, WCAG accessibility, copy (the back "bread")                                                                                                                     |
| `/sf-compound`   | `sf-compound/SKILL.md`   | Capture a learning into `docs/solutions/` for future retrieval                    |
| `/sf-lfg`        | `sf-lfg/SKILL.md`        | Full autonomous ideate → brainstorm → plan → deepen → work → review → polish → test → deploy pipeline                                                                                           |

***

## Domain Knowledge Skills (Salesforce-Specific)

These are content/reference skills loaded by other skills as needed.

| Skill                | File                            | Scope                     | Use When                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Governor Limits      | `governor-limits/SKILL.md`      | UNIVERSAL                 | Always when Apex, Flow, or trigger work touches limit-bearing code                                                                                                                                                                                                                                          |
| Apex Patterns        | `apex-patterns/SKILL.md`        | APEX_ONLY                 | Apex classes, triggers, services. Not for Flows.                                                                                                                                                                                                                                                            |
| Flow Patterns        | `flow-patterns/SKILL.md`        | AUTOMATION_ONLY           | Building any Flow. Not for Apex.                                                                                                                                                                                                                                                                            |
| LWC Patterns         | `lwc-patterns/SKILL.md`         | LWC_ONLY                  | Building Lightning Web Components                                                                                                                                                                                                                                                                           |
| GraphQL Patterns     | `graphql-patterns/SKILL.md`     | LWC_ONLY                  | GraphQL queries + mutations via `lightning/graphql` and `lightning/uiGraphQLApi`; Apex-vs-GraphQL decision; metadata permission gotcha |
| Security Guide       | `security-guide/SKILL.md`       | UNIVERSAL                 | CRUD/FLS, sharing, permissions, AppExchange security                                                                                                                                                                                                                                                        |
| Integration Patterns | `integration-patterns/SKILL.md` | INTEGRATION_ONLY          | Callouts, APIs, Platform Events                                                                                                                                                                                                                                                                             |
| Test Factory         | `test-factory/SKILL.md`         | APEX_ONLY                 | Apex test classes and test data factories                                                                                                                                                                                                                                                                   |
| Agentforce Develop                                                          | `agentforce-develop/SKILL.md`                                                          | AGENTFORCE                                                                       | Build, modify, debug, deploy Agentforce agents — Agent Spec gate, `.agent` authoring, publish/activate                                                                                                                                                                                                                                                             |
| Agentforce Test                                                             | `agentforce-test/SKILL.md`                                                             | AGENTFORCE                                                                       | Smoke + batch testing — `sf agent preview` traces, Testing Center YAML, safety verdict, fix loop                                                                                                                                                                                                                                                                   |
| Agentforce Observe                                                          | `agentforce-observe/SKILL.md`                                                          | AGENTFORCE                                                                       | Production observation — STDM session traces in Data Cloud (with fallback), reproduce-classify-improve loop                                                                                                                                                                                                                                                        |
| Prompt Builder       | `prompt-builder/SKILL.md`       | AGENTFORCE_PROMPT_BUILDER | Prompt templates, Apex/LWC/API integration, metadata XML generation                                                                                                                                                                                                                                         |
| Hosted MCP Servers   | `hosted-mcp-servers/SKILL.md`   | HOSTED_MCP                | Setting up and configuring Salesforce Hosted MCP Servers, ECA, troubleshooting                                                                                                                                                                                                                              |
| MCP Tool Builder     | `mcp-tool-builder/SKILL.md`     | HOSTED_MCP                | Building custom MCP tools — InvocableMethod, Flow, Named Queries                                                                                                                                                                                                                                            |

***

## Generating Skills (action-shaped, ported from forcedotcom/afv-library)

Action-shaped skills that produce metadata, code, and refactors. Pair with the reference skills above (`apex-patterns`, `flow-patterns`, etc.) — generation skills are the action; reference skills describe the shape.

| Skill                    | File                                | Scope            | Use When                                                                                                                                                                 |
| ------------------------ | ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Apex Generate            | `apex-generate/SKILL.md`            | APEX\_ONLY       | Generate an Apex class + matching test class as one unit. Bulkified, CRUD/FLS-enforced, sharing keyword declared, `Assert.*` tests with 251+ records                     |
| Flow Generate            | `flow-generate/SKILL.md`            | AUTOMATION\_ONLY | Generate Flow XML via the strict 3-step MCP `execute_metadata_action` pipeline (fetchGroundedObjectMetadata → flowElementSelection → flowElementGeneration loop)         |
| Validation Rule Generate | `validation-rule-generate/SKILL.md` | AUTOMATION\_ONLY | Generate `.validationRule-meta.xml` with CDATA-wrapped formula when needed; correct picklist / Date / Datetime function usage                                            |
| Apex Trigger Refactor    | `apex-trigger-refactor/SKILL.md`    | APEX\_ONLY       | Modernize a legacy trigger — hoist SOQL/DML out of loops, extract handler class, add recursion guard, generate matching tests                                            |
| SLDS 2 Uplift            | `slds2-uplift/SKILL.md`             | LWC\_ONLY        | Migrate LWC / Aura components from SLDS 1 to SLDS 2 by running `@salesforce-ux/slds-linter` and fixing every violation type with `var(--slds-g-hook, original)` fallback |
| Metadata Generate        | `metadata-generate/SKILL.md`        | METADATA         | Single-skill generator for CustomObject, CustomField, CustomApplication, CustomTab, ListView, CustomLightningType (`--type` dispatched)                                  |
| Lightning Page Generate  | `lightning-page-generate/SKILL.md`  | METADATA         | Generate a FlexiPage (`--type page`) or orchestrate a complete LEX app across multiple metadata types in dependency order (`--type app`)                                 |
| Permission Set Generate  | `permission-set-generate/SKILL.md`  | METADATA         | Generate a PermissionSet with least-privilege defaults — object CRUD, FLS, tab visibility, app visibility, system perms, class / page access                             |

***

## Workflow Support Skills

| Skill               | File                           | Use When                                                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SF CLI              | `sf-cli/SKILL.md`              | Deploy, retrieve, test, org management via the `sf` CLI |
| Compound Docs       | `compound-docs/SKILL.md`       | Writing solution documents with YAML schema                                                                                                                           |
| File Todos          | `file-todos/SKILL.md`          | File-based task tracking with status/priority naming                                                                                                                  |
| Git Worktree        | `git-worktree/SKILL.md`        | Isolated parallel development branches                                                                                                                                |
| Create Agent Skills | `create-agent-skills/SKILL.md` | Creating new agents and skills for the plugin                                                                                                                         |
| Dispatching Parallel Personas                                              | `dispatching-parallel-personas/SKILL.md`                                              | Shared persona-dispatch mechanics (isolated subagents, same-response parallelism, same-file-conflict check) referenced by the workflow skills                                                                                |

***

## V3 Capability Skills

Salesforce-aware skills covering the full V3 capability surface — debugging, doc review, PR description, PR feedback resolution, ideation, optimization, plugin maintenance, session research, git hygiene, commits, agent-native architecture, knowledge refresh, release notes, bug reports, Slack research, Proof HITL, and demo capture.

| Skill                          | Salesforce angle                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `sf-debug`                     | Trigger / Apex test / LWC error / deploy failure root cause analysis               |
| `sf-doc-review`                | Parallel persona review of Salesforce plans and specs                              |
| `sf-pr-description`            | Salesforce-aware PR descriptions (Apex / metadata / LWC scope)                     |
| `sf-resolve-pr-feedback`       | Parallel resolution with metadata-diff awareness                                   |
| `sf-simplify-code`             | Behavior-preserving simplification of Apex/LWC (YAGNI, native-first)               |
| `sf-product-pulse`             | Role-aware org pulse: requirements traceability + adoption (BA) / org health (dev) |
| `sf-optimize`                  | Metric-driven optimization loops (governor-limit thresholds, query plan)           |
| `sf-update`                    | Plugin self-update from the upstream GitHub releases endpoint                      |
| `sf-setup`                     | Salesforce CLI presence check, `sfdx-project.json`, MCP servers                    |
| `sf-sessions`                  | Search past Claude/Codex/Cursor sessions filtered for SF file types                |
| `sf-session-inventory`         | Discover session files for a Salesforce repo                                       |
| `sf-session-extract`           | Extract conversation skeleton from one session file                                |
| `sf-clean-gone-branches`       | Prune local branches whose remote is gone                                          |
| `sf-commit`                    | Conventional commits with Salesforce scope taxonomy                                |
| `sf-commit-push-pr`            | Commit + push + open PR with Salesforce-aware description                          |
| `sf-agent-native-architecture` | Build Salesforce systems where any user action is also agent-accessible            |
| `sf-agent-native-audit`        | Audit human/agent affordance parity on Salesforce surfaces                         |
| `sf-compound-refresh`          | Refresh stale `docs/solutions/` Salesforce knowledge                               |
| `sf-release-notes`             | Generate release notes from PRs / commits                                          |
| `sf-report-bug`                | Structured bug report (incl. Salesforce-specific environment fields)               |
| `sf-slack-research`            | Slack search for Salesforce org-context decisions                                  |
| `sf-proof`                     | Markdown HITL via Proof editor                                                     |
| `sf-demo-reel`                 | Capture demos for PRs (UI / CLI / Setup screen)                                    |

Out of scope for this Salesforce plugin (intentionally not shipped): generic frontend design tooling, Figma sync, image generation, non-Salesforce test runners (xcode, browser), and personality-tied reviewers tied to non-Salesforce stacks.

***

## Notes

* Skills auto-route via their `description` frontmatter. The V3 harness picks a skill when the user types a phrase that matches the description's trigger language.

* Direct slash invocation (`/sf-plan`, `/sf-debug`) always works regardless of phrasing.

* For routing collisions (e.g., "review this" vs. "review this PR"), the more specific phrase wins.

* The nine core workflow skills are the primary entry points; domain skills are loaded by them as needed.
