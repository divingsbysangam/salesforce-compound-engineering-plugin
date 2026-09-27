# MCP vs Agentforce Architecture

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## MCP vs Agentforce Architecture
**This is the most important section.** These use fundamentally different orchestration:

### Agentforce (Inside Salesforce)

```
User → Agentforce Agent → Topic/Action → @InvocableMethod
                       → Prompt Template → Flow data provider → Apex → LLM
```

- Platform orchestrates everything server-side
- Flow data providers work (platform executes them)
- Prompt templates control output format (platform applies them)
- `public` access modifier is sufficient
- SObject inputs are fine (platform constructs them)

### MCP (External AI Clients)

```
User → Claude/Cursor → MCP Server → @InvocableMethod (tool call)
                     → Prompt Template (passive resource — may be ignored)
```

- AI client orchestrates — decides which tools to call and when
- **Flow data providers DON'T work** (MCP can't execute Flows)
- **Prompt templates are passive** — NOT enforced
- `global` access modifier required
- Human-readable inputs preferred (Names, Numbers, not just IDs)

### Dual Architecture Pattern

Design for both paths from the start:

```
                    ┌── Agentforce Path ──┐
                    │  Prompt Template     │
                    │  → Flow             │
                    │  → ContextProvider   │
                    │  → SearchService     │
                    └─────────────────────┘
                              │
Shared: SearchService ←───────┤
(core SOSL + SOQL logic)      │
                              │
                    ┌── MCP Path ─────────┐
                    │  SearchTool (global) │
                    │  → SearchService     │
                    │  → Returns formatted │
                    │    text, not JSON    │
                    └─────────────────────┘
```

| Aspect | MCP Tool | Agentforce Tool |
|--------|----------|-----------------|
| Access modifier | `global` | `public` is fine |
| Output format | Pre-formatted text | Raw data (template formats it) |
| Input types | String IDs + human-readable | SObject records |
| Flow dependencies | None | Flow data providers work |
| Template role | Passive (best-effort) | Enforced by platform |

---

