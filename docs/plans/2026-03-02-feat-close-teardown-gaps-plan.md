---
title: Close Teardown Gaps Between SF Plugin and an external plugin
type: feat
date: 2026-03-02
status: deprecated
superseded_by: docs/solutions/integrations/everyinc-v321-vs-sf-v31-gaps.md
---

# <span data-proof="authored" data-by="ai:claude">Close Teardown Gaps — SF Plugin vs Compound Engineering Plugin</span>

> **Deprecated (2026-07-31, wording 2026-08-20).** Historical v2-era gap matrix. Current catalog lives in [`docs/solutions/integrations/everyinc-v321-vs-sf-v31-gaps.md`](../solutions/integrations/everyinc-v321-vs-sf-v31-gaps.md). Do not use this document as the open-gap backlog.

## <span data-proof="authored" data-by="ai:claude">Overview</span>

<span data-proof="authored" data-by="ai:claude">The teardown (sections 31-38) identified</span> **<span data-proof="authored" data-by="ai:claude">31 gaps</span>** <span data-proof="authored" data-by="ai:claude">across 3 categories between the</span> <span data-proof="authored" data-by="ai:claude">original compound-engineering-plugin</span> <span data-proof="authored" data-by="ai:claude">and the</span> [<span data-proof="authored" data-by="ai:claude">SF adaptation</span>](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin)<span data-proof="authored" data-by="ai:claude">. This plan validates each gap against the current codebase state and provides a prioritized implementation roadmap.</span>

## <span data-proof="authored" data-by="ai:claude">Current State Verified</span>

| <span data-proof="authored" data-by="ai:claude">Metric</span>           | <span data-proof="authored" data-by="ai:claude">SF Plugin (Actual)</span>                                                                                                  | <span data-proof="authored" data-by="ai:claude">an external plugin</span>                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Agents</span>           | <span data-proof="authored" data-by="ai:claude">23 (5 categories: apex/architecture/automation/integration/lwc)</span>                                                     | <span data-proof="authored" data-by="ai:claude">29 (5 categories: review/research/design/workflow/docs)</span> |
| <span data-proof="authored" data-by="ai:claude">Commands</span>         | <span data-proof="authored" data-by="ai:claude">4 (sf-plan, sf-work, sf-review, sf-compound)</span>                                                                        | <span data-proof="authored" data-by="ai:claude">22 (5 core + 17 utility)</span>                                |
| <span data-proof="authored" data-by="ai:claude">Skills</span>           | <span data-proof="authored" data-by="ai:claude">7 (apex-patterns, flow-patterns, governor-limits, integration-patterns, lwc-patterns, security-guide, test-factory)</span> | <span data-proof="authored" data-by="ai:claude">20</span>                                                      |
| <span data-proof="authored" data-by="ai:claude">MCP Servers</span>      | <span data-proof="authored" data-by="ai:claude">0</span>                                                                                                                   | <span data-proof="authored" data-by="ai:claude">1 (Context7)</span>                                            |
| <span data-proof="authored" data-by="ai:claude">Hooks</span>            | <span data-proof="authored" data-by="ai:claude">0</span>                                                                                                                   | <span data-proof="authored" data-by="ai:claude">Yes (hooks.json)</span>                                        |
| <span data-proof="authored" data-by="ai:claude">docs/ directory</span>  | **<span data-proof="authored" data-by="ai:claude">MISSING entirely</span>**                                                                                                | <span data-proof="authored" data-by="ai:claude">Full (brainstorms/, plans/, solutions/, specs/)</span>         |
| <span data-proof="authored" data-by="ai:claude">agents/research/</span> | **<span data-proof="authored" data-by="ai:claude">MISSING</span>**                                                                                                         | <span data-proof="authored" data-by="ai:claude">5 research agents</span>                                       |
| <span data-proof="authored" data-by="ai:claude">agents/workflow/</span> | **<span data-proof="authored" data-by="ai:claude">MISSING</span>**                                                                                                         | <span data-proof="authored" data-by="ai:claude">5 workflow agents</span>                                       |
| <span data-proof="authored" data-by="ai:claude">.mcp.json</span>        | **<span data-proof="authored" data-by="ai:claude">MISSING</span>**                                                                                                         | <span data-proof="authored" data-by="ai:claude">Present</span>                                                 |

## <span data-proof="authored" data-by="ai:claude">Gap Analysis Summary (Sections 31-34)</span>

### <span data-proof="authored" data-by="ai:claude">CRITICAL Gaps (4) — Must Fix First</span>

| <span data-proof="authored" data-by="ai:claude">#</span> | <span data-proof="authored" data-by="ai:claude">Gap</span>                              | <span data-proof="authored" data-by="ai:claude">What SF Plugin Has</span>                                                                                                                                                                                                                                                              | <span data-proof="authored" data-by="ai:claude">What an external plugin Has</span>                                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">1</span> | **<span data-proof="authored" data-by="ai:claude">Parallel Agent Dispatch</span>**      | <span data-proof="authored" data-by="ai:claude">Agents are passive markdown checklists read sequentially</span>                                                                                                                                                                                                                        | <span data-proof="authored" data-by="ai:claude">Active subagents dispatched in parallel via</span> <span data-proof="authored" data-by="ai:claude">`Task agent-name(context)`</span>                                                                         |
| <span data-proof="authored" data-by="ai:claude">2</span> | **<span data-proof="authored" data-by="ai:claude">Multi-Agent Parallel Review</span>**  | <span data-proof="authored" data-by="ai:claude">Single-pass checklist review in</span> <span data-proof="authored" data-by="ai:claude">`/sf-review`</span>                                                                                                                                                                             | <span data-proof="authored" data-by="ai:claude">15+ agents in parallel via Task tool</span>                                                                                                                                                                  |
| <span data-proof="authored" data-by="ai:claude">3</span> | **<span data-proof="authored" data-by="ai:claude">Knowledge Compounding System</span>** | <span data-proof="authored" data-by="ai:claude">`/sf-compound`</span> <span data-proof="authored" data-by="ai:claude">described but no</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">directory, no YAML schema, no learnings-researcher agent</span> | <span data-proof="authored" data-by="ai:claude">Full</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">with YAML schema, categorized learnings, fast haiku-based search</span> |
| <span data-proof="authored" data-by="ai:claude">4</span> | **<span data-proof="authored" data-by="ai:claude">Formal Workflows</span>**             | <span data-proof="authored" data-by="ai:claude">Loop described in command prompts only</span>                                                                                                                                                                                                                                          | <span data-proof="authored" data-by="ai:claude">Formal workflow files with enforced sequencing (brainstorm → plan → deepen → work → review → compound)</span>                                                                                                |

### <span data-proof="authored" data-by="ai:claude">HIGH Gaps (10)</span>

| <span data-proof="authored" data-by="ai:claude">#</span>  | <span data-proof="authored" data-by="ai:claude">Gap</span>                          | <span data-proof="authored" data-by="ai:claude">Fix Required</span>                                                                                                                                                                                                       |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">5</span>  | <span data-proof="authored" data-by="ai:claude">No Brainstorm Phase</span>          | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`/sf-brainstorm`</span> <span data-proof="authored" data-by="ai:claude">command (Phase 0-4 structure)</span>                                                |
| <span data-proof="authored" data-by="ai:claude">6</span>  | <span data-proof="authored" data-by="ai:claude">No Hooks</span>                     | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`hooks/hooks.json`</span> <span data-proof="authored" data-by="ai:claude">with SF-specific lifecycle hooks</span>                                           |
| <span data-proof="authored" data-by="ai:claude">7</span>  | <span data-proof="authored" data-by="ai:claude">No MCP Server Integration</span>    | <span data-proof="authored" data-by="ai:claude">Add Context7 to</span> <span data-proof="authored" data-by="ai:claude">`.mcp.json`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`plugin.json`</span> |
| <span data-proof="authored" data-by="ai:claude">8</span>  | <span data-proof="authored" data-by="ai:claude">No Git Worktree Support</span>      | <span data-proof="authored" data-by="ai:claude">Port</span> <span data-proof="authored" data-by="ai:claude">`git-worktree`</span> <span data-proof="authored" data-by="ai:claude">skill with SF auth file handling</span>                                                 |
| <span data-proof="authored" data-by="ai:claude">9</span>  | <span data-proof="authored" data-by="ai:claude">No Learnings Researcher</span>      | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-learnings-researcher`</span> <span data-proof="authored" data-by="ai:claude">agent (model: haiku)</span>                                                |
| <span data-proof="authored" data-by="ai:claude">10</span> | <span data-proof="authored" data-by="ai:claude">No Best Practices Researcher</span> | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-best-practices-researcher`</span> <span data-proof="authored" data-by="ai:claude">agent</span>                                                          |
| <span data-proof="authored" data-by="ai:claude">11</span> | <span data-proof="authored" data-by="ai:claude">No Spec Flow Analyzer</span>        | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-spec-flow-analyzer`</span> <span data-proof="authored" data-by="ai:claude">for trigger contexts/governor limits</span>                                  |
| <span data-proof="authored" data-by="ai:claude">12</span> | <span data-proof="authored" data-by="ai:claude">No Skill Self-Creation</span>       | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`create-agent-skills`</span> <span data-proof="authored" data-by="ai:claude">skill for SF context</span>                                                    |
| <span data-proof="authored" data-by="ai:claude">13</span> | <span data-proof="authored" data-by="ai:claude">No Plan Deepening</span>            | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`/sf-deepen`</span> <span data-proof="authored" data-by="ai:claude">command with parallel research per section</span>                                       |
| <span data-proof="authored" data-by="ai:claude">14</span> | <span data-proof="authored" data-by="ai:claude">No SF CLI Integration</span>        | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-cli`</span> <span data-proof="authored" data-by="ai:claude">skill (deploy, retrieve, test, org commands)</span>                                         |

### <span data-proof="authored" data-by="ai:claude">MEDIUM Gaps (12)</span>

| <span data-proof="authored" data-by="ai:claude">#</span>  | <span data-proof="authored" data-by="ai:claude">Gap</span>                         | <span data-proof="authored" data-by="ai:claude">Fix Required</span>                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">15</span> | <span data-proof="authored" data-by="ai:claude">No CLAUDE.md Template</span>       | <span data-proof="authored" data-by="ai:claude">Ship a starter CLAUDE.md template for SF projects</span>                                                                                                                                                                                                                                     |
| <span data-proof="authored" data-by="ai:claude">16</span> | <span data-proof="authored" data-by="ai:claude">No Browser Automation</span>       | <span data-proof="authored" data-by="ai:claude">Port</span> <span data-proof="authored" data-by="ai:claude">`agent-browser`</span> <span data-proof="authored" data-by="ai:claude">skill (useful for LWC testing)</span>                                                                                                                     |
| <span data-proof="authored" data-by="ai:claude">17</span> | <span data-proof="authored" data-by="ai:claude">No Document Review</span>          | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`document-review`</span> <span data-proof="authored" data-by="ai:claude">skill</span>                                                                                                                                          |
| <span data-proof="authored" data-by="ai:claude">18</span> | <span data-proof="authored" data-by="ai:claude">No Git History Analyzer</span>     | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-git-history-analyzer`</span> <span data-proof="authored" data-by="ai:claude">agent</span>                                                                                                                                  |
| <span data-proof="authored" data-by="ai:claude">19</span> | <span data-proof="authored" data-by="ai:claude">No Deployment Verification</span>  | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-deployment-verification-agent`</span>                                                                                                                                                                                      |
| <span data-proof="authored" data-by="ai:claude">20</span> | <span data-proof="authored" data-by="ai:claude">No PR Comment Resolution</span>    | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-pr-comment-resolver`</span> <span data-proof="authored" data-by="ai:claude">agent</span>                                                                                                                                   |
| <span data-proof="authored" data-by="ai:claude">21</span> | <span data-proof="authored" data-by="ai:claude">No Bug Reproduction</span>         | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-bug-reproduction-validator`</span> <span data-proof="authored" data-by="ai:claude">agent</span>                                                                                                                            |
| <span data-proof="authored" data-by="ai:claude">22</span> | <span data-proof="authored" data-by="ai:claude">No Code Simplicity Review</span>   | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`sf-code-simplicity-reviewer`</span> <span data-proof="authored" data-by="ai:claude">agent</span>                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">23</span> | <span data-proof="authored" data-by="ai:claude">No Parallel Todo Resolution</span> | <span data-proof="authored" data-by="ai:claude">Create concurrent task processing capability</span>                                                                                                                                                                                                                                          |
| <span data-proof="authored" data-by="ai:claude">24</span> | <span data-proof="authored" data-by="ai:claude">No File-Based Todos</span>         | <span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`file-todos`</span> <span data-proof="authored" data-by="ai:claude">skill with</span> <span data-proof="authored" data-by="ai:claude">`todos/`</span> <span data-proof="authored" data-by="ai:claude">directory</span>         |
| <span data-proof="authored" data-by="ai:claude">25</span> | <span data-proof="authored" data-by="ai:claude">No Protected Artifacts</span>      | <span data-proof="authored" data-by="ai:claude">Protect</span> <span data-proof="authored" data-by="ai:claude">`docs/plans/`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">from deletion</span> |
| <span data-proof="authored" data-by="ai:claude">26</span> | <span data-proof="authored" data-by="ai:claude">No Review Depth Levels</span>      | <span data-proof="authored" data-by="ai:claude">Add Fast/Thorough/Comprehensive levels to</span> <span data-proof="authored" data-by="ai:claude">`/sf-review`</span>                                                                                                                                                                         |

### <span data-proof="authored" data-by="ai:claude">LOW Gaps (5) — Nice to Have</span>

| <span data-proof="authored" data-by="ai:claude">#</span>  | <span data-proof="authored" data-by="ai:claude">Gap</span>                       | <span data-proof="authored" data-by="ai:claude">Notes</span>                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">27</span> | <span data-proof="authored" data-by="ai:claude">No Multi-Platform Support</span> | <span data-proof="authored" data-by="ai:claude">Every has 10 AI tool targets via CLI converter — not relevant for SF-focused plugin</span> |
| <span data-proof="authored" data-by="ai:claude">28</span> | <span data-proof="authored" data-by="ai:claude">No Design Agents</span>          | <span data-proof="authored" data-by="ai:claude">Figma sync/iteration/review — low relevance in SF context</span>                           |
| <span data-proof="authored" data-by="ai:claude">29</span> | <span data-proof="authored" data-by="ai:claude">No Agent-Native Review</span>    | <span data-proof="authored" data-by="ai:claude">Action/context parity — low relevance in SF context</span>                                 |
| <span data-proof="authored" data-by="ai:claude">30</span> | <span data-proof="authored" data-by="ai:claude">No Video Recording</span>        | <span data-proof="authored" data-by="ai:claude">Feature videos for PRs — nice but not core</span>                                          |
| <span data-proof="authored" data-by="ai:claude">31</span> | <span data-proof="authored" data-by="ai:claude">No Image Generation</span>       | <span data-proof="authored" data-by="ai:claude">Gemini image gen — not relevant</span>                                                     |

## <span data-proof="authored" data-by="ai:claude">Proposed Solution — Phased Implementation</span>

### <span data-proof="authored" data-by="ai:claude">Phase 1: Foundation (P0 — Critical)</span>

**<span data-proof="authored" data-by="ai:claude">Goal:</span>** <span data-proof="authored" data-by="ai:claude">Transform the plugin from passive checklists to active parallel orchestration + institutional memory.</span>

#### <span data-proof="authored" data-by="ai:claude">1.1 Restructure Commands for Parallel Agent Dispatch</span>

<span data-proof="authored" data-by="ai:claude">Update all 4 commands to use Claude Code's</span> <span data-proof="authored" data-by="ai:claude">`Task`</span> <span data-proof="authored" data-by="ai:claude">tool for parallel subagent dispatch:</span>

```markdown proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MjYwLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<!-- BEFORE (passive) -->
Read agents/apex/apex-governor-guardian.md and check for issues

<!-- AFTER (active parallel) -->
- Task apex-governor-guardian(code_context)
- Task apex-security-sentinel(code_context)
- Task apex-bulkification-reviewer(code_context)
```

**<span data-proof="authored" data-by="ai:claude">Files to modify:</span>**

* <span data-proof="authored" data-by="ai:claude">`commands/sf-review.md`</span> <span data-proof="authored" data-by="ai:claude">— Parallel dispatch of all applicable review agents</span>

* <span data-proof="authored" data-by="ai:claude">`commands/sf-plan.md`</span> <span data-proof="authored" data-by="ai:claude">— Parallel dispatch of research agents</span>

* <span data-proof="authored" data-by="ai:claude">`commands/sf-work.md`</span> <span data-proof="authored" data-by="ai:claude">— Add system-wide test check</span>

* <span data-proof="authored" data-by="ai:claude">`commands/sf-compound.md`</span> <span data-proof="authored" data-by="ai:claude">— Write to actual</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">with YAML frontmatter</span>

**<span data-proof="authored" data-by="ai:claude">Agent file changes:</span>**

* <span data-proof="authored" data-by="ai:claude">Add</span> <span data-proof="authored" data-by="ai:claude">`model`</span> <span data-proof="authored" data-by="ai:claude">field to agent frontmatter (haiku for fast agents, sonnet for deep analysis)</span>

* <span data-proof="authored" data-by="ai:claude">Restructure agent content to be active prompts, not passive checklists</span>

#### <span data-proof="authored" data-by="ai:claude">1.2 Build Knowledge Compounding System</span>

<span data-proof="authored" data-by="ai:claude">Create the entire</span> <span data-proof="authored" data-by="ai:claude">`docs/`</span> <span data-proof="authored" data-by="ai:claude">directory tree:</span>

```
docs/
├── brainstorms/          # Pre-planning exploration outputs
├── plans/                # Structured plan documents
└── solutions/            # Institutional knowledge base
    ├── governor-limit-issues/
    ├── deployment-issues/
    ├── test-failures/
    ├── security-issues/
    ├── integration-issues/
    ├── flow-issues/
    ├── lwc-issues/
    ├── data-model-issues/
    ├── best-practices/
    └── patterns/
```

<span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`schema.yaml`</span> <span data-proof="authored" data-by="ai:claude">for solution YAML frontmatter validation:</span>

```yaml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTI2LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Required fields for docs/solutions/ entries
title: string          # Short descriptive title
date: YYYY-MM-DD       # When discovered
category: enum         # governor-limits|deployment|test-failure|security|integration|flow|lwc|data-model|best-practice|pattern
severity: enum         # critical|high|medium|low
tags: list[string]     # Searchable tags
symptoms: string       # What went wrong
root_cause: string     # Why it happened
resolution: string     # How it was fixed
prevention: string     # How to avoid in future
```

#### <span data-proof="authored" data-by="ai:claude">1.3 Add MCP Server Integration</span>

<span data-proof="authored" data-by="ai:claude">Create</span> <span data-proof="authored" data-by="ai:claude">`.mcp.json`:</span>

```json proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTI2LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

<span data-proof="authored" data-by="ai:claude">Update</span> <span data-proof="authored" data-by="ai:claude">`plugin.json`</span> <span data-proof="authored" data-by="ai:claude">to declare MCP server dependency.</span>

### <span data-proof="authored" data-by="ai:claude">Phase 2: Workflow Expansion (P1 — High)</span>

#### <span data-proof="authored" data-by="ai:claude">2.1 Create</span> <span data-proof="authored" data-by="ai:claude">`/sf-brainstorm`</span> <span data-proof="authored" data-by="ai:claude">Command</span>

<span data-proof="authored" data-by="ai:claude">New file:</span> <span data-proof="authored" data-by="ai:claude">`commands/sf-brainstorm.md`</span>

<span data-proof="authored" data-by="ai:claude">Structure:</span>

* <span data-proof="authored" data-by="ai:claude">Phase 0: Assess clarity of the idea</span>

* <span data-proof="authored" data-by="ai:claude">Phase 1: Understand (one question at a time, AskUserQuestion)</span>

* <span data-proof="authored" data-by="ai:claude">Phase 2: Explore approaches with SF-specific trade-offs (declarative vs code, governor limits, sharing model)</span>

* <span data-proof="authored" data-by="ai:claude">Phase 3: Capture in</span> <span data-proof="authored" data-by="ai:claude">`docs/brainstorms/YYYY-MM-DD-topic.md`</span>

* <span data-proof="authored" data-by="ai:claude">Phase 4: Handoff to</span> <span data-proof="authored" data-by="ai:claude">`/sf-plan`</span>

#### <span data-proof="authored" data-by="ai:claude">2.2 Create Research Agents (5 new)</span>

<span data-proof="authored" data-by="ai:claude">New directory:</span> <span data-proof="authored" data-by="ai:claude">`agents/research/`</span>

| <span data-proof="authored" data-by="ai:claude">Agent</span>                             | <span data-proof="authored" data-by="ai:claude">Model</span>  | <span data-proof="authored" data-by="ai:claude">Purpose</span>                                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`sf-learnings-researcher.md`</span>      | <span data-proof="authored" data-by="ai:claude">haiku</span>  | <span data-proof="authored" data-by="ai:claude">Fast search of</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">by YAML frontmatter</span> |
| <span data-proof="authored" data-by="ai:claude">`sf-best-practices-researcher.md`</span> | <span data-proof="authored" data-by="ai:claude">sonnet</span> | <span data-proof="authored" data-by="ai:claude">3-phase: curated skills → Context7 → web search</span>                                                                                                                    |
| <span data-proof="authored" data-by="ai:claude">`sf-git-history-analyzer.md`</span>      | <span data-proof="authored" data-by="ai:claude">haiku</span>  | <span data-proof="authored" data-by="ai:claude">`git blame`,</span> <span data-proof="authored" data-by="ai:claude">`git log -S`, archaeological analysis for SF metadata</span>                                          |
| <span data-proof="authored" data-by="ai:claude">`sf-repo-research-analyst.md`</span>     | <span data-proof="authored" data-by="ai:claude">haiku</span>  | <span data-proof="authored" data-by="ai:claude">Understand project structure, CLAUDE.md, conventions</span>                                                                                                               |
| <span data-proof="authored" data-by="ai:claude">`sf-framework-docs-researcher.md`</span> | <span data-proof="authored" data-by="ai:claude">sonnet</span> | <span data-proof="authored" data-by="ai:claude">Salesforce platform docs via Context7 + web</span>                                                                                                                        |

#### <span data-proof="authored" data-by="ai:claude">2.3 Create Workflow Agents (5 new)</span>

<span data-proof="authored" data-by="ai:claude">New directory:</span> <span data-proof="authored" data-by="ai:claude">`agents/workflow/`</span>

| <span data-proof="authored" data-by="ai:claude">Agent</span>                                 | <span data-proof="authored" data-by="ai:claude">Model</span>  | <span data-proof="authored" data-by="ai:claude">Purpose</span>                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`sf-spec-flow-analyzer.md`</span>            | <span data-proof="authored" data-by="ai:claude">sonnet</span> | <span data-proof="authored" data-by="ai:claude">Trigger context permutations, governor limit scenarios, sharing gaps</span> |
| <span data-proof="authored" data-by="ai:claude">`sf-bug-reproduction-validator.md`</span>    | <span data-proof="authored" data-by="ai:claude">sonnet</span> | <span data-proof="authored" data-by="ai:claude">Systematic 6-step reproduction for SF bugs</span>                           |
| <span data-proof="authored" data-by="ai:claude">`sf-pr-comment-resolver.md`</span>           | <span data-proof="authored" data-by="ai:claude">haiku</span>  | <span data-proof="authored" data-by="ai:claude">Parallel resolution of PR review comments</span>                            |
| <span data-proof="authored" data-by="ai:claude">`sf-code-simplicity-reviewer.md`</span>      | <span data-proof="authored" data-by="ai:claude">haiku</span>  | <span data-proof="authored" data-by="ai:claude">YAGNI enforcement with LOC reduction estimates</span>                       |
| <span data-proof="authored" data-by="ai:claude">`sf-deployment-verification-agent.md`</span> | <span data-proof="authored" data-by="ai:claude">sonnet</span> | <span data-proof="authored" data-by="ai:claude">Go/No-Go checklist with validation queries</span>                           |

#### <span data-proof="authored" data-by="ai:claude">2.4 Add Git Worktree Support</span>

<span data-proof="authored" data-by="ai:claude">New skill:</span> <span data-proof="authored" data-by="ai:claude">`skills/git-worktree/SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`scripts/worktree-manager.sh`</span>

* <span data-proof="authored" data-by="ai:claude">Port from an external plugin</span>

* <span data-proof="authored" data-by="ai:claude">Add SF-specific auth file handling (`.env`,</span> <span data-proof="authored" data-by="ai:claude">`sfdx-project.json`,</span> <span data-proof="authored" data-by="ai:claude">`.sfdx/`)</span>

#### <span data-proof="authored" data-by="ai:claude">2.5 Add Hooks</span>

<span data-proof="authored" data-by="ai:claude">New file:</span> <span data-proof="authored" data-by="ai:claude">`hooks/hooks.json`</span>

```json proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mjg3LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
{
  "hooks": [
    {
      "event": "pre-commit",
      "command": "sf apex lint",
      "description": "Lint Apex code before commit"
    },
    {
      "event": "pre-push",
      "command": "sf apex run test --synchronous",
      "description": "Run Apex tests before push"
    }
  ]
}
```

#### <span data-proof="authored" data-by="ai:claude">2.6 Create SF CLI Skill</span>

<span data-proof="authored" data-by="ai:claude">New skill:</span> <span data-proof="authored" data-by="ai:claude">`skills/sf-cli/SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">with scripts:</span>

* <span data-proof="authored" data-by="ai:claude">`scripts/deploy.sh`</span> <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`sf project deploy start`</span>

* <span data-proof="authored" data-by="ai:claude">`scripts/retrieve.sh`</span> <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`sf project retrieve start`</span>

* <span data-proof="authored" data-by="ai:claude">`scripts/run-tests.sh`</span> <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`sf apex run test`</span>

* <span data-proof="authored" data-by="ai:claude">`scripts/org-info.sh`</span> <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`sf org display`</span>

### <span data-proof="authored" data-by="ai:claude">Phase 3: Enhancement (P2)</span>

#### <span data-proof="authored" data-by="ai:claude">3.1 Create</span> <span data-proof="authored" data-by="ai:claude">`/sf-deepen`</span> <span data-proof="authored" data-by="ai:claude">Command</span>

<span data-proof="authored" data-by="ai:claude">New file:</span> <span data-proof="authored" data-by="ai:claude">`commands/sf-deepen.md`</span>

* <span data-proof="authored" data-by="ai:claude">Parse plan sections</span>

* <span data-proof="authored" data-by="ai:claude">Launch parallel research agents per section (governor limits, sharing model, security, performance)</span>

* <span data-proof="authored" data-by="ai:claude">Merge results back into plan</span>

#### <span data-proof="authored" data-by="ai:claude">3.2 Add System-Wide Test Check to</span> <span data-proof="authored" data-by="ai:claude">`/sf-work`</span>

<span data-proof="authored" data-by="ai:claude">Add 5 Salesforce-specific validation questions:</span>

1. <span data-proof="authored" data-by="ai:claude">What triggers fire? Are all contexts handled?</span>
2. <span data-proof="authored" data-by="ai:claude">Are bulk tests included (200+ records)?</span>
3. <span data-proof="authored" data-by="ai:claude">Are governor limits tested (SOQL 101, DML 150)?</span>
4. <span data-proof="authored" data-by="ai:claude">Are sharing scenarios covered (with/without sharing)?</span>
5. <span data-proof="authored" data-by="ai:claude">Are integration points mocked?</span>

#### <span data-proof="authored" data-by="ai:claude">3.3 Review Depth Levels in</span> <span data-proof="authored" data-by="ai:claude">`/sf-review`</span>

| <span data-proof="authored" data-by="ai:claude">Level</span>         | <span data-proof="authored" data-by="ai:claude">Agents Dispatched</span>                                      | <span data-proof="authored" data-by="ai:claude">When to Use</span>     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Fast</span>          | <span data-proof="authored" data-by="ai:claude">Stack-specific only (e.g., Apex agents for .cls files)</span> | <span data-proof="authored" data-by="ai:claude">Quick checks</span>    |
| <span data-proof="authored" data-by="ai:claude">Thorough</span>      | <span data-proof="authored" data-by="ai:claude">All applicable agents</span>                                  | <span data-proof="authored" data-by="ai:claude">Standard review</span> |
| <span data-proof="authored" data-by="ai:claude">Comprehensive</span> | <span data-proof="authored" data-by="ai:claude">All + git history + deployment verification</span>            | <span data-proof="authored" data-by="ai:claude">Pre-production</span>  |

#### <span data-proof="authored" data-by="ai:claude">3.4 Create Skill Self-Creation Skill</span>

<span data-proof="authored" data-by="ai:claude">New skill:</span> <span data-proof="authored" data-by="ai:claude">`skills/create-agent-skills/SKILL.md`</span>

* <span data-proof="authored" data-by="ai:claude">10 workflows for creating new agents and skills</span>

* <span data-proof="authored" data-by="ai:claude">Templates for agent frontmatter, skill structure</span>

* <span data-proof="authored" data-by="ai:claude">Validation of naming conventions</span>

### <span data-proof="authored" data-by="ai:claude">Phase 4: Advanced (P3)</span>

#### <span data-proof="authored" data-by="ai:claude">4.1</span> <span data-proof="authored" data-by="ai:claude">`/sf-lfg`</span> <span data-proof="authored" data-by="ai:claude">Pipeline</span>

<span data-proof="authored" data-by="ai:claude">Full autonomous: plan → deepen → work → review → resolve → test → deploy</span>

#### <span data-proof="authored" data-by="ai:claude">4.2 File-Based Todos</span>

<span data-proof="authored" data-by="ai:claude">`skills/file-todos/SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`todos/`</span> <span data-proof="authored" data-by="ai:claude">directory</span>

#### <span data-proof="authored" data-by="ai:claude">4.3 Protected Artifacts</span>

<span data-proof="authored" data-by="ai:claude">CLAUDE.md rules preventing deletion of</span> <span data-proof="authored" data-by="ai:claude">`docs/plans/`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span>

## <span data-proof="authored" data-by="ai:claude">Files to Create (Total: ~25 new files)</span>

```
sf-compound-engineering-plugin/
├── .mcp.json                                    # NEW - Context7 MCP config
├── hooks/
│   └── hooks.json                               # NEW - Lifecycle hooks
├── docs/
│   ├── brainstorms/                             # NEW - Brainstorm outputs
│   ├── plans/                                   # NEW - Plan documents (this file lives here)
│   └── solutions/                               # NEW - Knowledge base
│       ├── governor-limit-issues/
│       ├── deployment-issues/
│       ├── test-failures/
│       ├── security-issues/
│       ├── integration-issues/
│       ├── flow-issues/
│       ├── lwc-issues/
│       ├── data-model-issues/
│       ├── best-practices/
│       └── patterns/
├── agents/
│   ├── research/                                # NEW category (5 agents)
│   │   ├── sf-learnings-researcher.md
│   │   ├── sf-best-practices-researcher.md
│   │   ├── sf-git-history-analyzer.md
│   │   ├── sf-repo-research-analyst.md
│   │   └── sf-framework-docs-researcher.md
│   └── workflow/                                # NEW category (5 agents)
│       ├── sf-spec-flow-analyzer.md
│       ├── sf-bug-reproduction-validator.md
│       ├── sf-pr-comment-resolver.md
│       ├── sf-code-simplicity-reviewer.md
│       └── sf-deployment-verification-agent.md
├── commands/
│   ├── sf-brainstorm.md                         # NEW
│   ├── sf-deepen.md                             # NEW
│   └── sf-lfg.md                                # NEW (Phase 4)
├── skills/
│   ├── sf-cli/SKILL.md                          # NEW
│   ├── git-worktree/SKILL.md                    # NEW
│   ├── compound-docs/SKILL.md                   # NEW
│   ├── create-agent-skills/SKILL.md             # NEW
│   └── file-todos/SKILL.md                      # NEW (Phase 4)
└── schema.yaml                                  # NEW - Solution YAML schema
```

## <span data-proof="authored" data-by="ai:claude">Files to Modify (7 existing files)</span>

| <span data-proof="authored" data-by="ai:claude">File</span>                         | <span data-proof="authored" data-by="ai:claude">Changes</span>                                                                                                                                                                             |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">`.claude-plugin/plugin.json`</span> | <span data-proof="authored" data-by="ai:claude">Add mcpServers, update agent count to 33, command count to 7, skill count to 12</span>                                                                                                     |
| <span data-proof="authored" data-by="ai:claude">`agents/index.md`</span>            | <span data-proof="authored" data-by="ai:claude">Add RESEARCH and WORKFLOW categories, update routing table</span>                                                                                                                          |
| <span data-proof="authored" data-by="ai:claude">`skills/index.md`</span>            | <span data-proof="authored" data-by="ai:claude">Add new skills (sf-cli, git-worktree, compound-docs, create-agent-skills), update routing</span>                                                                                           |
| <span data-proof="authored" data-by="ai:claude">`commands/sf-plan.md`</span>        | <span data-proof="authored" data-by="ai:claude">Add brainstorm check, parallel research agents, Context7 integration</span>                                                                                                                |
| <span data-proof="authored" data-by="ai:claude">`commands/sf-work.md`</span>        | <span data-proof="authored" data-by="ai:claude">Add worktree support, system-wide test check, incremental commits</span>                                                                                                                   |
| <span data-proof="authored" data-by="ai:claude">`commands/sf-review.md`</span>      | <span data-proof="authored" data-by="ai:claude">Parallel agent dispatch via Task, depth levels (fast/thorough/comprehensive)</span>                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">`commands/sf-compound.md`</span>    | <span data-proof="authored" data-by="ai:claude">Real</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">writing with YAML validation, learnings search</span> |

## <span data-proof="authored" data-by="ai:claude">Acceptance Criteria</span>

### <span data-proof="authored" data-by="ai:claude">Phase 1 (Critical)</span>

* [ ] <span data-proof="authored" data-by="ai:claude">All 4 commands use</span> <span data-proof="authored" data-by="ai:claude">`Task`</span> <span data-proof="authored" data-by="ai:claude">tool for parallel agent dispatch</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">directory exists with 10 subcategories</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`schema.yaml`</span> <span data-proof="authored" data-by="ai:claude">validates solution frontmatter</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`.mcp.json`</span> <span data-proof="authored" data-by="ai:claude">configured with Context7</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`/sf-compound`</span> <span data-proof="authored" data-by="ai:claude">actually writes categorized documentation to</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span>

### <span data-proof="authored" data-by="ai:claude">Phase 2 (High)</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`/sf-brainstorm`</span> <span data-proof="authored" data-by="ai:claude">command creates brainstorm docs in</span> <span data-proof="authored" data-by="ai:claude">`docs/brainstorms/`</span>

* [ ] <span data-proof="authored" data-by="ai:claude">5 research agents exist in</span> <span data-proof="authored" data-by="ai:claude">`agents/research/`</span>

* [ ] <span data-proof="authored" data-by="ai:claude">5 workflow agents exist in</span> <span data-proof="authored" data-by="ai:claude">`agents/workflow/`</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`hooks/hooks.json`</span> <span data-proof="authored" data-by="ai:claude">contains SF-specific hooks</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`skills/sf-cli/`</span> <span data-proof="authored" data-by="ai:claude">provides deploy/retrieve/test/org commands</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`skills/git-worktree/`</span> <span data-proof="authored" data-by="ai:claude">enables isolated parallel development</span>

### <span data-proof="authored" data-by="ai:claude">Phase 3 (Enhancement)</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`/sf-deepen`</span> <span data-proof="authored" data-by="ai:claude">enhances plans with parallel research</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`/sf-work`</span> <span data-proof="authored" data-by="ai:claude">includes 5-question SF test check</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`/sf-review`</span> <span data-proof="authored" data-by="ai:claude">supports fast/thorough/comprehensive depth levels</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`skills/create-agent-skills/`</span> <span data-proof="authored" data-by="ai:claude">enables self-extending the plugin</span>

### <span data-proof="authored" data-by="ai:claude">Phase 4 (Advanced)</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`/sf-lfg`</span> <span data-proof="authored" data-by="ai:claude">provides full autonomous pipeline</span>

* [ ] <span data-proof="authored" data-by="ai:claude">File-based todos in</span> <span data-proof="authored" data-by="ai:claude">`todos/`</span> <span data-proof="authored" data-by="ai:claude">directory</span>

* [ ] <span data-proof="authored" data-by="ai:claude">`docs/plans/`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">protected from deletion</span>

## <span data-proof="authored" data-by="ai:claude">Success Metrics</span>

* <span data-proof="authored" data-by="ai:claude">Agent count: 23 → 33 (+10)</span>

* <span data-proof="authored" data-by="ai:claude">Command count: 4 → 7 (+3)</span>

* <span data-proof="authored" data-by="ai:claude">Skill count: 7 → 12 (+5)</span>

* <span data-proof="authored" data-by="ai:claude">MCP servers: 0 → 1</span>

* <span data-proof="authored" data-by="ai:claude">Hooks: 0 → 1 config file</span>

* <span data-proof="authored" data-by="ai:claude">Knowledge system: None → Full (docs/solutions/ + learnings-researcher)</span>

* <span data-proof="authored" data-by="ai:claude">Review speed: Sequential → Parallel (estimated 5-10x improvement)</span>

## <span data-proof="authored" data-by="ai:claude">References</span>

* <span data-proof="authored" data-by="ai:claude">Teardown document:</span> <span data-proof="authored" data-by="ai:claude">`Compound-Engineering-Plugin-Teardown.md`</span> <span data-proof="authored" data-by="ai:claude">(sections 31-38)</span>

* <span data-proof="authored" data-by="ai:claude">Original plugin:</span> <span data-proof="authored" data-by="ai:claude">>

* <span data-proof="authored" data-by="ai:claude">SF plugin:</span> [<span data-proof="authored" data-by="ai:claude">https://github.com/divingsbysangam/salesforce-compound-engineering-plugin</span>](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin)