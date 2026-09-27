# Hosted MCP vs Salesforce DX MCP

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Hosted MCP vs Salesforce DX MCP
| Aspect | Hosted MCP Servers | Salesforce DX MCP (`@salesforce/mcp`) |
|--------|-------------------|--------------------------------------|
| **Hosting** | Cloud-managed by Salesforce | Local CLI on developer machine |
| **Audience** | End users, AI agents, production workflows | Developers during local development |
| **Transport** | Streamable HTTP via `api.salesforce.com` | STDIO via `npx` CLI |
| **Auth** | OAuth 2.0 + PKCE via External Client Apps | SF CLI authentication (`sf org login`) |
| **Tools** | SObject CRUD, prompt templates, custom actions | 60+ dev tools: deploy, retrieve, test, analyze |
| **Use Case** | AI clients querying CRM data in production | Claude Code building/deploying Salesforce code |
| **Configuration** | Per-org in Setup > API Catalog | Per-project in `.mcp.json` |

### When to Use Each

- **Hosted MCP**: AI clients need to **access Salesforce data** (query accounts, update records, run reports)
- **DX MCP**: Developers need to **build Salesforce code** (deploy metadata, run tests, analyze code)
- **Both**: An AI assistant that both builds code (DX MCP) and queries org data (Hosted MCP)

---

