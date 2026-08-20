---
name: hosted-mcp-servers
description: Salesforce Hosted MCP Server setup, configuration, URL patterns, ECA management, security model, complete tool reference, and troubleshooting
scope: HOSTED_MCP
---

# Salesforce Hosted MCP Servers

**SCOPE: HOSTED_MCP** - This skill applies to setting up and configuring Salesforce Hosted MCP Servers.
**Use when:** Enabling MCP servers in an org, creating External Client Apps, connecting AI clients (Claude, Cursor, ChatGPT), or troubleshooting MCP connectivity.

---

Salesforce Hosted MCP Servers are fully managed, cloud-hosted MCP (Model Context Protocol) servers that let AI clients access Salesforce data and logic. All processing is **deterministic** — no LLM runs server-side. Intelligence is entirely on the client side.

**This is different from** the `@salesforce/mcp` CLI-based MCP server used for local development.

---

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Available Servers (Complete Reference)** — read `references/available-servers-complete-reference.md` before acting on this section.
- **Tool Reference by Server** — read `references/tool-reference-by-server.md` before acting on this section.
- **URL Patterns** — read `references/url-patterns.md` before acting on this section.
- **Setup Checklist** — read `references/setup-checklist.md` before acting on this section.
- **External Client App Configuration** — read `references/external-client-app-configuration.md` before acting on this section.
- **Security Model** — read `references/security-model.md` before acting on this section.
- **Client Configuration** — read `references/client-configuration.md` before acting on this section.
- **Troubleshooting** — read `references/troubleshooting.md` before acting on this section.
- **MCP Gateways (Emerging)** — read `references/mcp-gateways-emerging.md` before acting on this section.
- **Hosted MCP vs Salesforce DX MCP** — read `references/hosted-mcp-vs-salesforce-dx-mcp.md` before acting on this section.
- **Incremental Rollout Strategy** — read `references/incremental-rollout-strategy.md` before acting on this section.
