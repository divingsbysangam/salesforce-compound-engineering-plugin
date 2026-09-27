# ⚠️ Deprecated Syntax — Use `subagent` not `topic` (April 2026)

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## ⚠️ Deprecated Syntax — Use `subagent` not `topic` (April 2026)
As of April 2026, the `topic` keyword in Agent Script is **deprecated**. Always use the `subagent` equivalents. Using `topic` will produce deprecation warnings and may break in future API versions.

| Deprecated (before April 2026) | Current (April 2026+) |
|---|---|
| `topic name:` | `subagent name:` |
| `start_agent topic_selector:` | `start_agent agent_router:` |
| `@topic.name` | `@subagent.name` |
| `go_to_x: @utils.transition to @topic.x` | `go_to_x: @utils.transition to @subagent.x` |

If you see a `.agent` file using the old `topic` syntax, rewrite all occurrences before building on top of it. Mix-and-match is not supported — the entire file must be consistently on one convention.

***

