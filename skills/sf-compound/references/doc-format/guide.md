# <span data-proof="authored" data-by="ai:claude">Compound Docs Skill</span>

<span data-proof="authored" data-by="ai:claude">Guide for writing solution documents that feed the institutional knowledge system.</span>

## <span data-proof="authored" data-by="ai:claude">Solution Document Template</span>

<span data-proof="authored" data-by="ai:claude">Every solution in</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`</span> <span data-proof="authored" data-by="ai:claude">follows this structure:</span>

```markdown proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NDE0LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
---
title: "{Short descriptive title}"
date: YYYY-MM-DD
category: {category}
severity: {critical|high|medium|low}
tags: ["{tag1}", "{tag2}"]
---

## Symptoms
{What went wrong — error messages, unexpected behavior}

## Root Cause
{Why it happened — technical explanation}

## Resolution
{How it was fixed — specific changes}

## Prevention
{How to avoid this in future}

## Related Files
- {file_path}:{line_number}
```

## <span data-proof="authored" data-by="ai:claude">Categories</span>

| <span data-proof="authored" data-by="ai:claude">Category</span>        | <span data-proof="authored" data-by="ai:claude">Directory</span>                | <span data-proof="authored" data-by="ai:claude">Use For</span>                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">governor-limits</span> | <span data-proof="authored" data-by="ai:claude">`governor-limit-issues/`</span> | <span data-proof="authored" data-by="ai:claude">SOQL 101, DML 150, CPU timeout, heap size</span>           |
| <span data-proof="authored" data-by="ai:claude">deployment</span>      | <span data-proof="authored" data-by="ai:claude">`deployment-issues/`</span>     | <span data-proof="authored" data-by="ai:claude">Deploy failures, metadata conflicts, version issues</span> |
| <span data-proof="authored" data-by="ai:claude">test-failure</span>    | <span data-proof="authored" data-by="ai:claude">`test-failures/`</span>         | <span data-proof="authored" data-by="ai:claude">Flaky tests, coverage gaps, assertion errors</span>        |
| <span data-proof="authored" data-by="ai:claude">security</span>        | <span data-proof="authored" data-by="ai:claude">`security-issues/`</span>       | <span data-proof="authored" data-by="ai:claude">CRUD/FLS, injection, sharing, encryption</span>            |
| <span data-proof="authored" data-by="ai:claude">integration</span>     | <span data-proof="authored" data-by="ai:claude">`integration-issues/`</span>    | <span data-proof="authored" data-by="ai:claude">Callout failures, auth, Named Credentials</span>           |
| <span data-proof="authored" data-by="ai:claude">flow</span>            | <span data-proof="authored" data-by="ai:claude">`flow-issues/`</span>           | <span data-proof="authored" data-by="ai:claude">Flow errors, recursion, limits, versioning</span>          |
| <span data-proof="authored" data-by="ai:claude">lwc</span>             | <span data-proof="authored" data-by="ai:claude">`lwc-issues/`</span>            | <span data-proof="authored" data-by="ai:claude">Rendering, wire service, events, lifecycle</span>          |
| <span data-proof="authored" data-by="ai:claude">data-model</span>      | <span data-proof="authored" data-by="ai:claude">`data-model-issues/`</span>     | <span data-proof="authored" data-by="ai:claude">Relationships, indexes, skew, limits</span>                |
| <span data-proof="authored" data-by="ai:claude">best-practice</span>   | <span data-proof="authored" data-by="ai:claude">`best-practices/`</span>        | <span data-proof="authored" data-by="ai:claude">Proven patterns, recommended approaches</span>             |
| <span data-proof="authored" data-by="ai:claude">pattern</span>         | <span data-proof="authored" data-by="ai:claude">`patterns/`</span>              | <span data-proof="authored" data-by="ai:claude">Reusable design patterns, architectural decisions</span>   |

## <span data-proof="authored" data-by="ai:claude">Naming Convention</span>

<span data-proof="authored" data-by="ai:claude">Files:</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/{category}/YYYY-MM-DD-{slug}.md`</span>

<span data-proof="authored" data-by="ai:claude">Examples:</span>

* <span data-proof="authored" data-by="ai:claude">`docs/solutions/governor-limit-issues/2026-03-02-soql-101-account-trigger.md`</span>

* <span data-proof="authored" data-by="ai:claude">`docs/solutions/best-practices/2026-03-02-wire-service-caching-pattern.md`</span>

## <span data-proof="authored" data-by="ai:claude">YAML Frontmatter Validation</span>

<span data-proof="authored" data-by="ai:claude">Validate against</span> <span data-proof="authored" data-by="ai:claude">`schema.yaml`</span> <span data-proof="authored" data-by="ai:claude">in the project root. Required fields:</span>

* <span data-proof="authored" data-by="ai:claude">`title`</span> <span data-proof="authored" data-by="ai:claude">(string)</span>

* <span data-proof="authored" data-by="ai:claude">`date`</span> <span data-proof="authored" data-by="ai:claude">(YYYY-MM-DD)</span>

* <span data-proof="authored" data-by="ai:claude">`category`</span> <span data-proof="authored" data-by="ai:claude">(enum — must match a category above)</span>

* <span data-proof="authored" data-by="ai:claude">`severity`</span> <span data-proof="authored" data-by="ai:claude">(enum — critical/high/medium/low)</span>

* <span data-proof="authored" data-by="ai:claude">`tags`</span> <span data-proof="authored" data-by="ai:claude">(list of strings)</span>

## <span data-proof="authored" data-by="ai:claude">Writing Tips</span>

1. **<span data-proof="authored" data-by="ai:claude">Be specific</span>**<span data-proof="authored" data-by="ai:claude">: Include exact error messages, not paraphrases</span>
2. **<span data-proof="authored" data-by="ai:claude">Include context</span>**<span data-proof="authored" data-by="ai:claude">: API version, org type, user profile</span>
3. **<span data-proof="authored" data-by="ai:claude">Link to code</span>**<span data-proof="authored" data-by="ai:claude">: Reference file paths and line numbers</span>
4. **<span data-proof="authored" data-by="ai:claude">Make it searchable</span>**<span data-proof="authored" data-by="ai:claude">: Use tags that others would search for</span>
5. **<span data-proof="authored" data-by="ai:claude">Focus on prevention</span>**<span data-proof="authored" data-by="ai:claude">: The most valuable part is how to avoid the issue</span>