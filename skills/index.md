# Salesforce Skills Index

Ten skills. Each has modes; a mode's guide loads only when that mode runs. Invoke `/sf-<skill> mode:<mode>` (or `type:` for `sf-generate`, `topic:` for `sf-know`), or just describe the task and let the skill route.

## Workflow

| Skill | Modes | Use when |
|---|---|---|
| [`/sf-plan`](sf-plan/SKILL.md) | ideate · brainstorm · strategy · deepen | Deciding what to build and how; writes `docs/plans/`, `docs/brainstorms/`, `STRATEGY.md` |
| [`/sf-work`](sf-work/SKILL.md) | simplify · optimize · worktree · todos · handoff · dispatch | Implementing a plan or prompt, test-first |
| [`/sf-generate`](sf-generate/SKILL.md) | apex · trigger-refactor · flow · metadata · permission-set · validation-rule · lightning-page · test-data · prompt-template · mcp-tool · agent · agent-test | Creating Salesforce source or metadata |
| [`/sf-review`](sf-review/SKILL.md) | doc · polish · slds2 · browser | Reviewing code, plans, or UI |
| [`/sf-debug`](sf-debug/SKILL.md) | explain · agent-observe | Root-causing failures; explaining code; Agentforce traces |
| [`/sf-deploy`](sf-deploy/SKILL.md) | validate · deploy · quick · retrieve · destructive · manifest · test · data · org · setup · cli | Anything that touches an org |
| [`/sf-ship`](sf-ship/SKILL.md) | commit · pr · pr-description · resolve-feedback · babysit · release-notes · clean-branches | Git and PR work |
| [`/sf-compound`](sf-compound/SKILL.md) | refresh · doc-format | Capturing learnings in `docs/solutions/` |
| [`/sf-lfg`](sf-lfg/SKILL.md) | — | The full pipeline: plan → work → review → resolve → polish → test → deploy → compound |

## Knowledge (`/sf-know`)

[`/sf-know`](sf-know/SKILL.md) is loaded by the workflow skills on demand. Scope tells a skill whether to load a topic for the files it is touching.

| Topic | File | Scope |
|---|---|---|
| limits | `sf-know/references/limits/guide.md` | Apex, Flow, triggers |
| apex | `sf-know/references/apex/guide.md` | Apex only |
| lwc | `sf-know/references/lwc/guide.md` | LWC only |
| graphql | `sf-know/references/graphql/guide.md` | LWC data access |
| flow | `sf-know/references/flow/guide.md` | Flows only |
| security | `sf-know/references/security/guide.md` | Everything touching data |
| integration | `sf-know/references/integration/guide.md` | Callouts, APIs, events |
| hosted-mcp | `sf-know/references/hosted-mcp/guide.md` | Salesforce Hosted MCP servers |
| agent-native | `sf-know/references/agent-native/guide.md` | Features agents must also operate |
| org-context | `sf-know/references/org-context/guide.md` | Before naming any object, field, or metadata type |

## Which skill owns which metadata

The metadata gate (`hooks/metadata-path-routing.txt`) sends edits to these owners:

| Files | Owner |
|---|---|
| `*.cls`, `*.trigger`, `*.flow-meta.xml`, validation rules, permission sets, FlexiPages, Agentforce metadata, other `*-meta.xml` | `/sf-generate` (routes by file type) |
| LWC, Aura | `/sf-work` |

## Reviewers

Review lenses live under `sf-review/references/`; research personas under `sf-plan/references/personas/`. They are prompt assets dispatched as subagents, not registered agents.
