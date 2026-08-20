# Mutations (Create / Update / Delete)

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Mutations (Create / Update / Delete)
`executeMutation` is **imperative** — not wired. It returns a Promise resolving to `{ data, errors }`.

### Create

```javascript
import { gql, executeMutation } from 'lightning/graphql';

const mutation = gql`
    mutation CreateAccount {
        uiapi {
            AccountCreate(input: { Account: { Name: ${gqlString(name)} } }) {
                Record {
                    Id
                    Name { value }
                }
            }
        }
    }
`;
const result = await executeMutation({ query: mutation });
if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join(', '));
const newId = result.data.uiapi.AccountCreate.Record.Id;
```

### Update

```javascript
const mutation = gql`
    mutation UpdateAccount {
        uiapi {
            AccountUpdate(input: {
                Id: ${gqlString(id)},
                Account: { Name: ${gqlString(newName)} }
            }) {
                Record { Id Name { value } }
            }
        }
    }
`;
```

### Delete

```javascript
const mutation = gql`
    mutation DeleteAccount {
        uiapi {
            AccountDelete(input: { Id: ${gqlString(id)} }) {
                Id
            }
        }
    }
`;
```

### Input shape conventions

| Op | Input shape |
|---|---|
| `<Obj>Create` | `{ <Obj>: { Field1, Field2, ... } }` |
| `<Obj>Update` | `{ Id, <Obj>: { Field1, ... } }` |
| `<Obj>Delete` | `{ Id }` |

Custom objects use `<ApiName>Create` etc. — e.g., `Diving_Trip__cCreate` (yes, the `__c` stays in the operation name).

### Cache behavior after mutation

| Operation | Refresh needed? |
|---|---|
| **Create** | Yes — `await this.refreshGraphQL?.()`. New records won't appear until cache is invalidated. |
| **Update** | Sometimes auto-propagates via LDS field overlap. Call `refreshGraphQL` defensively unless you benchmark otherwise. |
| **Delete** | No — deleted records are auto-pruned from every LDS-aware wire. |

---

