# Flow-Based MCP Tools

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Flow-Based MCP Tools
Autolaunched Flows can be exposed as MCP tools. **Screen flows and scheduled flows are NOT supported.**

### Design Rules

- Flow type: **Autolaunched** (no screen elements)
- Input variables: Mark "Available for Input" — become MCP tool parameters
- Output variables: Mark "Available for Output" — become tool response
- Variable API names should be descriptive — AI clients see them
- Variable descriptions should be written for AI consumption

> **Important distinction:** Flows exposed as their own MCP server tools (via the Flows server) work fine. What does NOT work is using `flow://` references in `templateDataProviders` within prompt templates.

---

