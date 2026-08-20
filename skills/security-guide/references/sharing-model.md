# Sharing Model

Read with `security-guide/SKILL.md`. Procedure lives here.

## Sharing Model
### Class Sharing Keywords

```apex
// Enforces sharing rules - USE BY DEFAULT
public with sharing class UserFacingController {
    // User can only see records they have access to
}

// Bypasses sharing rules - USE SPARINGLY
public without sharing class SystemService {
    // Only for background processes that need full access
    // Always document why this is needed
}

// Inherits from calling class
public inherited sharing class UtilityClass {
    // Flexible - uses caller's sharing context
}
```

### When to Use Each

| Keyword             | Use Case                                     |
| ------------------- | -------------------------------------------- |
| `with sharing`      | User-facing controllers, AuraEnabled methods |
| `without sharing`   | System processes, data cleanup, reports      |
| `inherited sharing` | Utility classes, shared libraries            |

