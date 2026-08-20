# Hosted MCP Servers

Read with `integration-patterns/SKILL.md`. Procedure lives here.

## Hosted MCP Servers
Salesforce now offers cloud-hosted MCP servers that let AI clients (Claude, ChatGPT, Cursor) access Salesforce data and logic directly. This is a different integration paradigm from traditional REST/SOAP — instead of writing integration code, you configure servers and expose existing Apex actions, Flows, and queries as MCP tools.

- **Setup and configuration**: See `hosted-mcp-servers` skill
- **Building custom MCP tools**: See `mcp-tool-builder` skill (Apex `@InvocableMethod` patterns, Flow tools, Named Query APIs)
- **This is NOT the same** as the `@salesforce/mcp` CLI server in `.mcp.json` — that is a local dev tool, not a cloud-hosted production server
