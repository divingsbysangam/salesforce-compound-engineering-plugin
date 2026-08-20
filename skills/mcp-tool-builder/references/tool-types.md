# Tool Types

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Tool Types
| Tool Type | Backend | Best For |
|-----------|---------|----------|
| **Apex Invocable Action** | `global` `@InvocableMethod` | Complex logic, orchestration, external callouts |
| **AuraEnabled Method** | `@AuraEnabled` methods | Reusing existing LWC controllers |
| **Apex REST Endpoint** | `@RestResource` classes | Reusing existing custom REST APIs |
| **Flow Action** | Autolaunched Flow | Declarative, admin-maintainable logic |
| **Named Query API** | Admin-defined SOQL | Controlled read-only data access |
| **API Catalog Endpoint** | Cataloged REST APIs | Connect APIs (Billing, CPQ, Field Service, Health Cloud) |

### Decision Guide

```
Is the logic read-only SOQL?
  → Yes → Named Query API
  → No → Does it need code (callouts, complex logic, multi-step)?
    → Yes → Do you have an existing @AuraEnabled or @RestResource class?
      → Yes → Reuse it as an MCP tool
      → No → New Apex @InvocableMethod (global)
    → No → Flow Action (autolaunched only)
```

---

