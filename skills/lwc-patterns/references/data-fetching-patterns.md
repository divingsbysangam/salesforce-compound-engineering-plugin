# Data Fetching Patterns

Read with `lwc-patterns/SKILL.md`. Procedure lives here.

## Data Fetching Patterns
### Choosing Apex vs GraphQL vs uiRecordApi

Before writing any data-access code, pick the right tool. Default to **GraphQL** for read-mostly UI work over standard sObjects; reach for **Apex** when business logic, cross-system access, or elevated-permission reads are needed.

| Need | Recommend | Why |
|---|---|---|
| Read records the user can already see | **GraphQL** (`lightning/graphql` or `lightning/uiGraphQLApi`) | LDS-cached, FLS-enforced, one round trip for nested data, client picks fields |
| Parent + multiple child related lists in one call | **GraphQL** | Single round trip beats 3 SOQL or 3 wires |
| Single-record Create / Update / Delete | **`executeMutation`** (GraphQL) *or* **`uiRecordApi`** | Both participate in LDS cache |
| Bulk DML, complex validation, transformations | **Apex `@AuraEnabled`** | GraphQL mutations are single-record |
| Aggregations, GROUP BY, semi-joins, formulas not in UI API | **Apex (SOQL)** | GraphQL `where` is a tiny subset of SOQL |
| Reading **metadata** (Custom Metadata Types, Custom Settings) for users without that permission | **Apex** | See gotcha below |
| Callouts, async (Queueable/Batch), file manipulation | **Apex** | UI API has no equivalents |

> **⚠️ Metadata access permission gotcha**: Apex *bridges* permissions — an `@AuraEnabled` method can read Custom Metadata Types without the running user having direct permset access. GraphQL **does not bridge** — it runs the user's session against UI API directly. If you migrate Custom Metadata Type or Custom Settings reads to GraphQL, **every end user must be assigned a permission set granting Read on those metadata objects**, otherwise the query returns empty data silently (no error, no toast). Audit FLS and CRUD for every running profile before shipping a GraphQL migration of metadata reads.

For full GraphQL syntax, mutations, refresh patterns, error handling, and the metadata-permission deep-dive, use the **`graphql-patterns`** skill.

### Wire Service

```javascript
import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class WireExample extends LightningElement {
    // Wire to property
    @wire(getAccounts)
    accounts;
    
    // Wire to function for more control
    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accounts = undefined;
        }
    }
}
```

### Imperative Apex

```javascript
import { LightningElement } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class ImperativeExample extends LightningElement {
    accounts;
    isLoading = false;
    error;
    
    async connectedCallback() {
        await this.loadAccounts();
    }
    
    async loadAccounts() {
        this.isLoading = true;
        try {
            this.accounts = await getAccounts();
            this.error = undefined;
        } catch (error) {
            this.error = error;
            this.accounts = undefined;
        } finally {
            this.isLoading = false;
        }
    }
    
    async handleRefresh() {
        await this.loadAccounts();
    }
}
```

