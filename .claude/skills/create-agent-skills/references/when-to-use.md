# When to Use

Read with `create-agent-skills/SKILL.md`. Procedure lives here.

## When to Use
{When the owning skill should dispatch this persona}
```

Read-only is the default for review/research personas. Only personas that genuinely write files (e.g. `sf-bug-reproduction-validator`, `sf-pr-comment-resolver`, `sf-deployment-verification-agent`, `sf-mcp-tool-builder-agent`) should say so in their prose — the dispatching skill grants the corresponding tools.

### Persona ownership — where the file goes

Place the persona in the `references/personas/` directory of its **primary owning skill**. Other skills reference it by relative path (e.g. `../sf-review/references/personas/<name>.md`) — stable because the whole `skills/` tree ships together.

| Concern                                              | Owner skill              | Directory                                            |
| ---------------------------------------------------- | ------------------------ | ---------------------------------------------------- |
| Code review (Apex/LWC/Flow/Integration/Architecture) | `sf-review`              | `skills/sf-review/references/personas/`              |
| Planning-document review                             | `sf-review mode:doc`          | `skills/sf-review/references/doc/references/personas/`          |
| Research (learnings, docs, web, history, spec-flow)  | `sf-plan`                | `skills/sf-plan/references/personas/`                |
| Bug reproduction                                     | `sf-debug`               | `skills/sf-debug/references/personas/`               |
| PR-thread resolution                                 | `sf-ship mode:resolve-feedback` | `skills/sf-ship/references/resolve-feedback/references/personas/` |
| Org pulse (business lens)                            | `sf-product-pulse`       | `skills/sf-product-pulse/references/personas/`       |
| Custom MCP tooling                                   | `sf-generate type:mcp-tool`       | `skills/sf-generate/references/mcp-tool/references/personas/`       |

### How personas get dispatched

The owning workflow skill loads the persona file's contents and runs them as an **isolated subagent**: the Task tool with a general-purpose subagent, persona prompt as instructions. On Claude Code these run in parallel with isolated context; on harnesses without a subagent primitive, the skill applies each persona's prompt inline, in sequence. Never register a persona as a `subagent_type` — that's the agent model V3.1 retired.

***

