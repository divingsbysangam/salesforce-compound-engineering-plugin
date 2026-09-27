# Named Query API Tools

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Named Query API Tools
Admin-defined SOQL queries exposed as read-only MCP tools. Simplest tool type.

```sql
-- Good: Parameterized with clear purpose
SELECT Id, Name, Amount, StageName, CloseDate
FROM Opportunity
WHERE AccountId = :accountId AND IsClosed = false
ORDER BY CloseDate ASC
```

Security: Named Queries inherit the authenticated user's CRUD/FLS/sharing automatically.

---

