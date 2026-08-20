# Client Configuration

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Client Configuration
### Postman (Test First — Recommended)

1. Create MCP request, switch from STDIO to **HTTP**
2. Paste server URL
3. Auth tab: OAuth 2.0
   - Grant Type: **Authorization Code (With PKCE)**
   - Code Challenge Method: **SHA-256**
   - Client Authentication: **Send client credentials in body**
   - Scope: `mcp_api refresh_token`
   - Check **"Authorize using browser"**
4. Auth URLs:
   - Production Auth: `https://login.salesforce.com/services/oauth2/authorize`
   - Production Token: `https://login.salesforce.com/services/oauth2/token`
   - Sandbox Auth: `https://test.salesforce.com/services/oauth2/authorize`
   - Sandbox Token: `https://test.salesforce.com/services/oauth2/token`

**Test with JSON calls:**
```json
// Test authentication
{"method": "tools/call", "params": {"name": "getUserInfo", "arguments": {}}}

// Test SOQL
{"method": "tools/call", "params": {"name": "soqlQuery", "arguments": {"query": "SELECT Id, Name FROM Account LIMIT 5"}}}
```

### Claude

1. Left sidebar > **Customize** > Connectors > + icon
2. Enter name, optional description
3. Enter server URL
4. Advanced settings: input OAuth Client ID (consumer key)
5. Click Connect, authenticate in browser
6. Use **Configure** to manage tool permissions (enable/disable individual tools)

### Cursor

1. Settings > Cursor Settings > Tools & MCP > New MCP Server
2. Edit `mcp.json` with server URL and consumer key
3. Supports prompt templates
4. **Restart frequently** — force quit if MCP process hangs
5. Toggle server off/on with 1-2 minute wait between

### ChatGPT

1. Settings > Apps > Create App (developer mode required)
2. Enter connector name and server URL
3. Authentication: "User-defined OAuth client"
4. Input OAuth Client ID
5. **Copy callback URL from ChatGPT Advanced settings** into your ECA
6. Must explicitly select Salesforce via + button when prompting
7. **Does NOT support MCP prompt templates**

---

