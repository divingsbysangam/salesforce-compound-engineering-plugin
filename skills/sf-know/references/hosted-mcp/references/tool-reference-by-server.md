# Tool Reference by Server

Read with `hosted-mcp-servers/SKILL.md`. Procedure lives here.

## Tool Reference by Server
### platform/sobject-reads Tools

| Tool | Parameters | Description |
|------|-----------|-------------|
| `getSchema` | `object-name` (optional) | No param: compact object catalog. With param: full field schema with types, required flags, picklist values |
| `soqlQuery` | `query` (required) | Execute SOQL queries. Always include WHERE and LIMIT |
| `soslSearch` | `search` (required) | Text search across multiple objects via SOSL |
| `getAuthenticatedUser` | none | User identity: ID, name, email, role, profile, manager, timezone |
| `getRecentlyViewed` | `sobject-name` (required) | Recently viewed/modified records |
| `getRelatedRecords` | `sobject-name`, `id`, `relationship-path` (all required) | Traverse relationships for child records |

### platform/sobject-all Tools (adds to reads)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `createSobjectRecord` | `sobject-name`, `body` (required) | Create new records |
| `updateSobjectRecord` | `sobject-name`, `id`, `body` (required) | Update records by ID |
| `updateChildRecord` | `sobject-name`, `id`, `relationship-path`, `body` (required) | Update child via relationship |
| `deleteSobjectRecord` | `sobject-name`, `id` (required) | Delete record (15-day Recycle Bin recovery) |
| `deleteChildRecord` | `sobject-name`, `id`, `relationship-path` (required) | Delete child via relationship |

### Tableau Next Tools

| Category | Tools |
|----------|-------|
| Analytics | `analyze_data`, `list_dashboards`, `get_dashboard`, `list_visualizations`, `get_visualization` |
| Schema | `list_semantic_models`, `get_semantic_model`, `list_data_objects`, `list_relationships` |
| Metrics | `list_measures`, `list_dimensions`, `list_semantic_model_metrics`, `get_metric` |
| Navigation | `list_workspaces`, `list_workspace_assets`, `search_assets` |

**Tableau Next endpoints:**
- Production: `https://api.salesforce.com/platform/mcp/v1/analytics/tableau-next`
- Sandbox: `https://api.salesforce.com/platform/mcp/v1/sandbox/analytics/tableau-next`

---

