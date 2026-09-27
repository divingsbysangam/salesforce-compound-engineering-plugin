# Troubleshooting

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Troubleshooting
### Common Issues

| Symptom | Cause | Resolution |
|---------|-------|------------|
| **404** on MCP URL | Server not activated | Enable in Setup > API Catalog > MCP Servers; wait 2 minutes |
| **401** Unauthorized | Wrong OAuth scopes | Verify ECA has `mcp_api` + `refresh_token` (not beta scopes) |
| **401** persistent | ECA not propagated | Wait up to 30 minutes after ECA creation |
| **403** Forbidden | Insufficient permissions | Check user's profile, permission sets, and sharing rules |
| Wrong data returned | Environment mismatch | Don't mix Production and Sandbox URLs |
| Connection refused | Edition requirement | Verify Enterprise+ or Developer Edition |
| "Failed to attach prompt" | Flow in templateDataProviders | Remove `templateDataProviders` with `flow://` references for MCP |
| Prompt format ignored | Claude doesn't enforce templates | Pre-format output server-side or embed format in tool description |

### Client-Specific Issues

| Client | Issue | Fix |
|--------|-------|-----|
| **Cursor** | MCP process hangs | Force quit and restart Cursor |
| **Cursor** | Server not responding | Toggle off/on with 1-2 min wait |
| **ChatGPT** | Callback URL invalid | Re-copy from ChatGPT Advanced settings (changes between releases) |
| **ChatGPT** | Salesforce not in chat | Must explicitly select via + button |
| **Claude** | Connector issues | Admin Settings > Connectors to manage |
| **Postman** | STDIO mode selected | Switch to HTTP mode |
| **Tableau Next** | Slow responses in Claude | ~1 min response time; Agentforce is 10-20x faster |

### Known Limitations

| Limitation | Detail |
|------------|--------|
| **Edition requirement** | Enterprise Edition or above (Developer Edition also qualifies) |
| **ECA propagation** | Up to 30 minutes after creation or modification |
| **Server activation** | Up to 2 minutes after toggling on/off |
| **Experience Cloud URLs** | Not supported (planned for future) |
| **API quota** | MCP tool calls consume daily API quota |
| **`mcp-remote` npm** | **Not supported** — only native OAuth/HTTP MCP clients work |
| **No DCR** | Dynamic Client Registration not supported |
| **No undelete** | Deleted records go to Recycle Bin but no MCP undelete tool |
| **Scratch Org ECAs** | Cannot create via Setup UI — must package from DevHub |
| **Connected Apps** | **Not supported** for MCP — must use External Client Apps |
| **Prompt templates** | Only Flex/Global templates. **ChatGPT does NOT support MCP prompts** |
| **ISV packaging** | Managed packages cannot include MCP server configs — expose via annotated Apex/Flows for subscribers to configure |

### Scratch Org Workaround

ECAs cannot be created directly in scratch orgs:
1. Create the ECA in a developer hub org
2. Add it to an unlocked or managed package
3. Install the package in the target scratch org

---

