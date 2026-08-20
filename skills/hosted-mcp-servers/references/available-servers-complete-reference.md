# Available Servers (Complete Reference)

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Available Servers (Complete Reference)
### SObject Servers

| Server | API Name | Capabilities | Risk Level |
|--------|----------|-------------|------------|
| **SObject Reads** | `platform/sobject-reads` | Query, search, schema, relationships (read-only) | Lowest |
| **SObject Mutations** | `platform/sobject-mutations` | Create + update + query/search (no delete) | Medium |
| **SObject All** | `platform/sobject-all` | Full CRUD + query + search + prompt templates | Highest |
| **SObject Deletes** | `platform/sobject-deletes` | Delete + query/search for targeting | High |

### Integration & Automation Servers

| Server | Purpose |
|--------|---------|
| **API Catalog** | REST API endpoints from Salesforce's API library as tools |
| **Custom Servers** | User-defined servers with curated tool sets |
| **Data 360** | Querying unified customer data |
| **Flows** | Autolaunched Flows exposed as MCP tools |
| **Invocable Actions** | `@InvocableMethod` Apex classes as tools |
| **Prompt Builder** | Prompt Builder templates as MCP prompts |
| **Tableau Next** | Semantic model discovery, KPI querying, analytics |

### Choosing a Server

- **Start with `platform/sobject-reads`** for evaluation — zero data modification risk
- **Use `platform/sobject-mutations`** for create/update without delete capability
- **Use `platform/sobject-all`** for production — includes prompt templates
- **Build custom servers** for domain-specific tool sets (see `mcp-tool-builder` skill)

---

