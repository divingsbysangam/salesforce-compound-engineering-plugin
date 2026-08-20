# Output Format

Read with `sf-review/SKILL.md`.

## Output Format

```
## Review: {target}
**Depth:** {fast|thorough|comprehensive}
**Agents dispatched:** {count}

### Critical ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### High ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### Medium ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### Low ({count})
- [{file}:{line}] {issue} — {fix suggestion}

### Summary
{overall assessment}

Next: Fix issues and run /sf-review again
```