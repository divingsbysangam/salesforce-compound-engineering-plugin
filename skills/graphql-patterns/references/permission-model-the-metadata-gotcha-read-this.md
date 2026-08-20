# Permission model — the metadata gotcha (READ THIS)

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Permission model — the metadata gotcha (READ THIS)
This is the single most surprising difference between Apex and GraphQL/UI API.

**Apex bridges permissions.** An `@AuraEnabled` method declared `with sharing` still runs with the calling user's sharing, **but** the Apex code itself can read Custom Metadata Types, Custom Settings (Hierarchy), Apex-only describe data, and anything else accessible to Apex — *without* the running user needing direct metadata permissions. Apex is the bridge.

**GraphQL does not bridge permissions.** The GraphQL Wire Adapter runs the user's session against UI API. There is no Apex layer in between. If you query a Custom Metadata Type, a Custom Setting, or any object the running user can't see, **the query returns no rows or errors out**.

### Practical consequence

If you migrate an Apex method like:

```apex
@AuraEnabled(cacheable=true)
public static List<MyConfig__mdt> getConfigs() {
    return [SELECT Id, Label, Threshold__c FROM MyConfig__mdt];
}
```

…to a GraphQL query, **every end user that runs the component must be assigned a permission set granting Read on `MyConfig__mdt`**. Otherwise the GraphQL query returns empty data, silently — no exception, no toast, just an empty list and a confused user.

### What to assign

Create (or reuse) a permission set with:
- **Custom Metadata Type Access** — Read on each `*__mdt` the GraphQL query touches
- **Custom Settings** — Read on each setting object (if reading via UI API)
- **Object Permissions** — Read on each standard/custom object the query traverses
- **Field-Level Security** — Read on each field selected (UI API drops fields silently if FLS denies them — same silent-failure mode)

Assign this permset to **every profile/user group** that uses the GraphQL-backed component.

### Rule of thumb

> If your component reads anything outside `Account`, `Contact`, `Opportunity`, `Case`, or other commonly-permissioned objects — **audit FLS and CRUD for every running profile before shipping a GraphQL migration**. Apex hides this; GraphQL exposes it.

---

