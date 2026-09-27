# Query basics

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Query basics
```javascript
import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/graphql';

export default class AccountList extends LightningElement {
    accounts = [];
    refreshGraphQL;

    @wire(graphql, {
        query: gql`
            query AccountList {
                uiapi {
                    query {
                        Account(
                            first: 10
                            orderBy: { Name: { order: ASC } }
                        ) {
                            edges {
                                node {
                                    Id
                                    Name { value }
                                    Industry { value }
                                    AnnualRevenue { value displayValue }
                                }
                            }
                        }
                    }
                }
            }
        `
    })
    handleResult(result) {
        const { data, errors, refresh } = result;
        if (refresh) this.refreshGraphQL = refresh; // capture once for later use
        if (data) {
            this.accounts = data.uiapi.query.Account.edges.map((e) => ({
                Id: e.node.Id,
                Name: e.node.Name.value,
                Industry: e.node.Industry?.value,
                Revenue: e.node.AnnualRevenue?.displayValue // formatted currency
            }));
        }
    }
}
```

**Key shape rules:**
- Every field is an object: `Name { value }` or `Name { value displayValue }`
- `value` = raw; `displayValue` = locale-formatted (currency, date, picklist label)
- `edges/node` = Relay connection wrapper — supports pagination via `pageInfo`
- `first: N` caps at 100 per connection

---

