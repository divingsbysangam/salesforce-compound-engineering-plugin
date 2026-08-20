# Output report

Read with `slds2-uplift/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Output report</span>
```
SLDS 2 uplift: <component or directory>

Linter pre-fix:    {warnings} warnings, {errors} errors
After --fix:       {warnings} warnings, {errors} errors  (auto-fixed: {count})

Manual fixes by rule:
- slds/no-hardcoded-values-slds2:  {count}
- slds/lwc-token-to-slds-hook:      {count}
- slds/no-slds-class-overrides:     {count} (CSS+markup pairs)
- slds/no-deprecated-tokens-slds1:  {count}

Skipped (layout values): {count}

Linter final:      0 errors

Files changed:
- .css files: {list}
- .html / .cmp files: {list}

Tests:             {pass=N, fail=0}
```

<span data-proof="authored" data-by="ai:claude">Zero errors is the gate (Principle 1). If errors remain after fixes, do not declare done.</span>

***

