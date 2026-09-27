# Setup Checklist

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Setup Checklist
### Step 1: Verify Eligibility

- [ ] Org edition: Enterprise, Unlimited, Performance, or Developer Edition
- [ ] Admin access to Setup
- [ ] `MCPService` permission enabled (auto-enabled for eligible orgs; contact Support if missing)

### Step 2: Enable MCP Server

1. Navigate to **Setup > API Catalog > MCP Servers**
2. Toggle on the desired server (e.g., `platform/sobject-reads`)
3. Wait up to **2 minutes** for activation to propagate

> At GA, all MCP servers are **disabled by default**. Each must be individually enabled.

### Step 3: Create External Client App (ECA)

1. Navigate to **Setup > External Client App Manager**
2. Create a new External Client App
3. Enable OAuth and configure:
   - **Callback URL**: See Client Configuration section below
   - **OAuth Scopes**: `mcp_api` + `refresh_token`
4. Security settings:
   - **Enable** "Require Proof Key for Code Exchange (PKCE)"
   - **Enable** "Issue JWT-based access tokens for named users"
   - **Disable** all Flow Enablement checkboxes — deselect everything else
5. Save and note the **Consumer Key** (Client ID)

> **Important:** ECAs may take **up to 30 minutes** to propagate worldwide. Try after 1-2 minutes first.

### Step 4: Connect Client

Every MCP client needs three values:
1. **MCP Server URL** — from URL Patterns above
2. **OAuth Client ID** — Consumer Key from the ECA
3. **OAuth Client Secret** — from the ECA (if required)

### Step 5: Test with Postman First

Always test with Postman before connecting AI clients — it returns raw JSON without LLM interpretation.

---

