# URL Patterns

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## URL Patterns
Everything is encoded in the URL path (no query parameters or headers during discovery).

### Standard Patterns

| Org Type | URL Pattern |
|----------|------------|
| **Production** | `https://api.salesforce.com/platform/mcp/v1/{servername}` |
| **Sandbox** | `https://api.salesforce.com/platform/mcp/v1/sandbox/{servername}` |
| **Scratch Org** | `https://api.salesforce.com/platform/mcp/v1/sandbox/{servername}` |
| **Developer Edition** | `https://api.salesforce.com/platform/mcp/v1/{servername}` |

### My Domain Patterns (Recommended)

Required for orgs that disabled login from standard endpoints.

| Org Type | URL Pattern |
|----------|------------|
| **Production** | `https://api.salesforce.com/platform/mcp/v1/d/{mydomainname}/{servername}` |
| **Sandbox** | `https://api.salesforce.com/platform/mcp/v1/d/{mydomainname}--{sandboxname}/sandbox/{servername}` |
| **Scratch Org** | `https://api.salesforce.com/platform/mcp/v1/d/{mydomainname}/scratch/{servername}` |
| **Developer Edition** | `https://api.salesforce.com/platform/mcp/v1/d/{mydomainname}/develop/{servername}` |

---

