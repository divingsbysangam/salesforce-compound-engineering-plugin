# Error handling

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Error handling
UI API returns errors in two shapes depending on entry point. Normalize once:

```javascript
readError(e) {
    const body = e?.body;
    if (Array.isArray(body)) {
        return body.map(b => b.message).join(', ');
    }
    if (body?.output?.errors?.length) {
        return body.output.errors.map(x => x.message).join(', ');
    }
    if (body?.output?.fieldErrors) {
        const f = body.output.fieldErrors;
        return Object.keys(f)
            .flatMap(k => f[k].map(x => `${k}: ${x.message}`))
            .join(', ');
    }
    return body?.message || e?.message || 'Unknown error';
}
```

For mutation results, also check the result body:

```javascript
if (result?.errors?.length) {
    throw new Error(result.errors.map(e => e.message).join(', '));
}
```

The generic *"An error occurred while trying to update the record. Please try again"* almost always means the body parser missed the actual error shape — fix the parser, don't guess at the underlying issue.

---

