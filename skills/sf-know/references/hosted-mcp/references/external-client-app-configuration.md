# External Client App Configuration

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## External Client App Configuration
### OAuth Scopes

| Scope | Purpose | Required |
|-------|---------|----------|
| `mcp_api` | Access Salesforce hosted MCP servers | Yes |
| `refresh_token` | Maintain persistent sessions | Yes |

> **Beta scopes are retired.** Do not use `api`, `sfap_api`, or `einstein_gpt_api` — these were beta-only and will cause 401 errors.

### Beta to GA Migration

| Change | Beta | GA |
|--------|------|-----|
| URL version | `v1-beta.2` | `v1` |
| Scopes | `api`, `sfap_api`, `refresh_token`, `einstein_gpt_api` | `mcp_api`, `refresh_token` |
| Activation | Org-wide toggle | Per-server in Setup (disabled by default) |
| Tokens | Beta tokens invalid | Must reauthorize |

### Callback URLs by Client

| Client | Callback URL |
|--------|-------------|
| **Claude** | `https://claude.ai/api/mcp/auth_callback` |
| **Cursor** | `cursor://anysphere.cursor-mcp/oauth/callback` |
| **Postman (Desktop)** | `https://oauth.pstmn.io/v1/callback` |
| **Postman (Web)** | `https://oauth.pstmn.io/v1/browser-callback` |
| **ChatGPT** | Copy from ChatGPT Advanced settings — **changes between releases** |

### One ECA Per Client

Create separate ECAs for each MCP client for per-client auditing and revocation.

### Production Hardening

| Setting | Purpose | When |
|---------|---------|------|
| Require Client Secret | Prevent unauthorized token requests | Web server apps (Claude, ChatGPT) |
| Permission Set Restriction | Limit to specific user groups | Production orgs |
| IP Restrictions | Restrict to known IP ranges | Fixed-IP clients |
| Token Rotation | Rotate refresh tokens on use | All production |
| Refresh Token Expiry | Expire tokens after 30 days | All production |
| Single Logout | End MCP when SF session ends | Shared workstations |

### Authentication Details

- **OAuth Authorization Code flow ONLY** — human authenticates in browser
- **No service accounts** — no machine-to-machine (M2M) flows planned
- **No Dynamic Client Registration (DCR)** — clients supporting only DCR are incompatible
- **Connected Apps are NOT supported** — must use External Client Apps
- **`.well-known` discovery**: MCP client receives 401 pointing to `.well-known` endpoint with OAuth metadata

---

