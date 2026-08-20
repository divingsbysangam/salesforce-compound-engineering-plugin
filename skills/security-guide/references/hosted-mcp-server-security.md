# Hosted MCP Server Security

Read with `security-guide/SKILL.md`. Procedure lives here.

## Hosted MCP Server Security
Salesforce Hosted MCP Servers enforce security automatically, but configuration choices affect the security posture.

### Key Security Principles

* **`mcp_api`** **scope isolation**: The `mcp_api` OAuth scope is separate from REST API access. An MCP connection cannot access REST APIs — this prevents MCP clients from becoming general-purpose API bridges.

* **PKCE required**: All External Client Apps for MCP must enable Proof Key for Code Exchange (PKCE) to prevent authorization code interception.

* **Automatic CRUD/FLS/Sharing**: Hosted MCP Servers enforce the authenticated user's object, field, and record-level access automatically. No additional code is needed.

* **Named user audit trail**: Every MCP operation is logged with the authenticated user's identity. There is no anonymous or service-account access.

* **One ECA per client**: Create separate External Client Apps for each AI client (Claude, Cursor, ChatGPT) to enable per-client auditing and revocation.

* **JWT tokens**: Enable JWT-based access tokens for self-contained identity verification without per-request validation callouts.

### Production Hardening

* Set refresh token expiry to 30 days or less

* Enable refresh token rotation

* Restrict ECA access via Permission Sets

* Enable Single Logout for shared workstations

* Monitor API quota consumption (MCP calls count against daily limit)

> **Full reference:** See `hosted-mcp-servers` skill for complete setup, URL patterns, and troubleshooting.

***

