---
name: mcp-tool-builder
description: Building custom MCP server tools — Apex InvocableMethod, Flow tools, prompt templates (with real-world gotchas), dual architecture patterns, and testing
scope: HOSTED_MCP
---

# MCP Tool Builder

**SCOPE: HOSTED_MCP** - This skill applies to building custom tools for Salesforce Hosted MCP Servers.
**Use when:** Creating Apex `@InvocableMethod` actions, Flow-based tools, Named Query APIs, or prompt templates for MCP exposure.

---

Custom MCP servers expose backend logic as tools that AI clients (Claude, ChatGPT, Cursor) can invoke.

**CRITICAL WARNING:** MCP and Agentforce use fundamentally different orchestration models. Code designed for Agentforce will break on MCP unless adapted. See "MCP vs Agentforce Architecture" section.

---

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Tool Types** — read `references/tool-types.md` before acting on this section.
- **Apex Invocable Action Tools** — read `references/apex-invocable-action-tools.md` before acting on this section.
- **MCP vs Agentforce Architecture** — read `references/mcp-vs-agentforce-architecture.md` before acting on this section.
- **Flow-Based MCP Tools** — read `references/flow-based-mcp-tools.md` before acting on this section.
- **Named Query API Tools** — read `references/named-query-api-tools.md` before acting on this section.
- **Prompt Templates for MCP** — read `references/prompt-templates-for-mcp.md` before acting on this section.
- **Recommended Resolution** — read `references/recommended-resolution.md` before acting on this section.
- **Similar Resolved Cases** — read `references/similar-resolved-cases.md` before acting on this section.
- **Confidence: High** — read `references/confidence-high.md` before acting on this section.
- **Retrieved Data (merge fields here)** — read `references/retrieved-data-merge-fields-here.md` before acting on this section.
- **Your Task** — read `references/task.md` before acting on this section.
- **Custom Server Registration** — read `references/custom-server-registration.md` before acting on this section.
- **Testing MCP Tools** — read `references/testing-mcp-tools.md` before acting on this section.
- **Tool Description Best Practices** — read `references/tool-description-best-practices.md` before acting on this section.
