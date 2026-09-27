# Tool Description Best Practices

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Tool Description Best Practices
### Good Descriptions

```apex
@InvocableMethod(
    label='Search Similar Resolved Cases'
    description='Searches for previously resolved cases similar to the given case using subject and description matching. Returns resolution steps, knowledge articles, and confidence scores.'
)

@InvocableVariable(required=true
    description='Case ID (18-char Salesforce record ID) or Case Number (e.g. 00001024). Accepts either format.')
global String caseId;
```

### Bad Descriptions

```apex
// Too vague — AI doesn't know when to use it
description='Processes case data'

// Missing format info — AI doesn't know what to pass
description='The case identifier'
```

### Rules

1. **Describe what, not how** — "Searches similar resolved cases" not "Runs SOSL query"
2. **Document accepted input formats** — "Case ID or Case Number (e.g. 00001024)"
3. **Explain side effects** — "will be added as an internal comment"
4. **Use action verbs** — "Searches", "Retrieves", "Escalates", "Creates"
5. **Describe output** — "Returns resolution steps, knowledge articles, and confidence scores"
