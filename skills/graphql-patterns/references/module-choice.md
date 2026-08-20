# Module choice

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Module choice
| Module | Use for | Status |
|---|---|---|
| `lightning/uiGraphQLApi` | Queries only (legacy) | Still works; queries-only |
| `lightning/graphql` | Queries **and** mutations | Canonical going forward — use for new components |

```javascript
// New components — single import surface
import { gql, graphql, executeMutation } from 'lightning/graphql';

// Legacy / queries-only — still supported
import { gql, graphql, refreshGraphQL } from 'lightning/uiGraphQLApi';
```

---

