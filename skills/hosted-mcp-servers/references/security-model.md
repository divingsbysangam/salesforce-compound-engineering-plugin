# Security Model

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Security Model
### Core Principle

The agent inherits the **authenticated user's full security context**:

- **CRUD**: Object-level access enforced per authenticated user
- **FLS**: Field-level security — invisible fields stay invisible
- **Sharing Rules**: Record-level access follows OWD, sharing rules, manual shares
- **Audit Trail**: Authenticated user's name appears as editor

> **"If you can't do it in the Lightning UI or over the REST API, you can't do it via MCP."**

### Scope Isolation

The `mcp_api` OAuth scope is **separate** from REST API access. An MCP connection cannot access REST APIs. Full REST API access requires the `api` scope on a different ECA.

### Incremental Permission Strategies

1. **Read-Only**: `platform/sobject-reads` — zero data modification risk
2. **Named Queries**: Admin-defined SOQL — agent cannot access anything outside what admin specified
3. **Custom Tools**: Apex Invocable Actions with scoped logic — full business logic control
4. **ECA-Level**: Link ECAs to profiles/permission sets for per-client user control

### Field Labels Matter

> **"Field labels and descriptions are the primary input the LLM uses to understand your org. If your custom fields have cryptic API names and no descriptions, the agent will struggle."**

---

