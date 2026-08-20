# Refresh patterns

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Refresh patterns
### Modern (lightning/graphql)
The `refresh` function is on the wire result.

```javascript
handleResult(result) {
    const { data, errors, refresh } = result;
    if (refresh) this.refreshGraphQL = refresh; // capture once
    // ...
}

async someAction() {
    await mutate(...);
    await this.refreshGraphQL?.();
}
```

### Legacy (lightning/uiGraphQLApi)
Import a function, store the whole wire result.

```javascript
import { refreshGraphQL } from 'lightning/uiGraphQLApi';

handleResult(result) {
    this.wiredResult = result;
    // ...
}

async someAction() {
    await mutate(...);
    await refreshGraphQL(this.wiredResult);
}
```

---

