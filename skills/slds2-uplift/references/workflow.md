# Workflow

Read with `slds2-uplift/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Workflow</span>

### <span data-proof="authored" data-by="ai:claude">Step 0: Research (Principle 7)</span>

* <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`sf-learnings-researcher("SLDS 2 uplift")`</span> <span data-proof="authored" data-by="ai:claude">— has someone migrated similar components?</span>

* <span data-proof="authored" data-by="ai:claude">Read</span> <span data-proof="authored" data-by="ai:claude">`skills/lwc-patterns/SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">for the project's LWC conventions.</span>

### <span data-proof="authored" data-by="ai:claude">Step 1: Run the linter with auto-fix</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
npx @salesforce-ux/slds-linter@latest lint --fix .
```

<span data-proof="authored" data-by="ai:claude">The linter analyzes</span> <span data-proof="authored" data-by="ai:claude">`.css`,</span> <span data-proof="authored" data-by="ai:claude">`.html`</span> <span data-proof="authored" data-by="ai:claude">(LWC), and</span> <span data-proof="authored" data-by="ai:claude">`.cmp`</span> <span data-proof="authored" data-by="ai:claude">(Aura), auto-fixes simple cases, and reports remaining violations.</span>

### <span data-proof="authored" data-by="ai:claude">Step 2: Read the linter output</span>

<span data-proof="authored" data-by="ai:claude">Linter output format:</span>

```
componentName.css
  15:3   warning   Overriding slds-button isn't supported.            slds/no-slds-class-overrides
  23:5   error     The '--lwc-colorBackground' design token is deprecated. ...
                   1. --slds-g-color-surface-2
                   2. --slds-g-color-surface-container-2              slds/lwc-token-to-slds-hook
  30:8   warning   Consider replacing the #ffffff static value ...    slds/no-hardcoded-values-slds2
  31:15  error     Consider removing t(fontSizeMedium) ...            slds/no-deprecated-tokens-slds1
```

<span data-proof="authored" data-by="ai:claude">Four violation types. Each has a different fix strategy.</span>

### <span data-proof="authored" data-by="ai:claude">Step 3: Fix by violation type</span>

| <span data-proof="authored" data-by="ai:claude">Rule</span>                              | <span data-proof="authored" data-by="ai:claude">Fix</span>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`slds/no-hardcoded-values-slds2`</span>  | <span data-proof="authored" data-by="ai:claude">Replace the hardcoded value with an SLDS hook + the original as fallback:</span> <span data-proof="authored" data-by="ai:claude">`var(--slds-g-color-surface-1, #ffffff)`</span>                                                                                                                                                                                                                                                                                                                                                                                |
| <span data-proof="authored" data-by="ai:claude">`slds/lwc-token-to-slds-hook`</span>     | <span data-proof="authored" data-by="ai:claude">Replace</span> <span data-proof="authored" data-by="ai:claude">`--lwc-*`</span> <span data-proof="authored" data-by="ai:claude">with the recommended SLDS hook, keeping the LWC token as fallback:</span> <span data-proof="authored" data-by="ai:claude">`var(--slds-g-color-surface-2, var(--lwc-colorBackground, #fff))`</span>                                                                                                                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`slds/no-slds-class-overrides`</span>    | <span data-proof="authored" data-by="ai:claude">Create a component-prefixed CSS class (e.g.,</span> <span data-proof="authored" data-by="ai:claude">`.myapp-button`), add it to the markup</span> **<span data-proof="authored" data-by="ai:claude">alongside</span>** <span data-proof="authored" data-by="ai:claude">the SLDS class. Both</span> <span data-proof="authored" data-by="ai:claude">`.css`</span> <span data-proof="authored" data-by="ai:claude">AND</span> <span data-proof="authored" data-by="ai:claude">`.html`/`.cmp`</span> <span data-proof="authored" data-by="ai:claude">change</span> |
| <span data-proof="authored" data-by="ai:claude">`slds/no-deprecated-tokens-slds1`</span> | <span data-proof="authored" data-by="ai:claude">Replace</span> <span data-proof="authored" data-by="ai:claude">`t(fontSizeMedium)`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`var(--slds-g-font-size-base, var(--lwc-fontSizeMedium, 0.8125rem))`</span> <span data-proof="authored" data-by="ai:claude">— chain SLDS → LWC → literal</span>                                                                                                                                                                                           |

### <span data-proof="authored" data-by="ai:claude">Step 4: Skip layout values (don't fix what isn't broken)</span>

<span data-proof="authored" data-by="ai:claude">The linter flags</span> **<span data-proof="authored" data-by="ai:claude">all</span>** <span data-proof="authored" data-by="ai:claude">hardcoded values, including layout. Skip these — they have no SLDS hook equivalent:</span>

| <span data-proof="authored" data-by="ai:claude">Value</span>                                                                                                                                   | <span data-proof="authored" data-by="ai:claude">Why skipped</span>                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`100%`,</span> <span data-proof="authored" data-by="ai:claude">`50%`</span> <span data-proof="authored" data-by="ai:claude">etc.</span>        | <span data-proof="authored" data-by="ai:claude">Layout percentages</span>             |
| <span data-proof="authored" data-by="ai:claude">`auto`,</span> <span data-proof="authored" data-by="ai:claude">`inherit`,</span> <span data-proof="authored" data-by="ai:claude">`none`</span> | <span data-proof="authored" data-by="ai:claude">Layout keywords</span>                |
| <span data-proof="authored" data-by="ai:claude">`0`</span>                                                                                                                                     | <span data-proof="authored" data-by="ai:claude">Zero baseline (no hook needed)</span> |

<span data-proof="authored" data-by="ai:claude">Never replace layout values with arbitrary hooks — that's making the warning go away by introducing a bug.</span>

### <span data-proof="authored" data-by="ai:claude">Step 5: Always include a fallback</span>

<span data-proof="authored" data-by="ai:claude">Every replacement uses</span> <span data-proof="authored" data-by="ai:claude">`var(--slds-g-hook, originalValue)`. The fallback</span> **<span data-proof="authored" data-by="ai:claude">must be the exact original value</span>** <span data-proof="authored" data-by="ai:claude">from the source CSS — not a guess, not a different fallback.</span>

```css proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTA5LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
/* WRONG */
color: var(--slds-g-color-surface-1);

/* RIGHT */
color: var(--slds-g-color-surface-1, #ffffff);
```

<span data-proof="authored" data-by="ai:claude">This preserves rendering on legacy contexts that don't resolve SLDS 2 hooks.</span>

### <span data-proof="authored" data-by="ai:claude">Step 6: Class override pattern (the high-frequency miss)</span>

<span data-proof="authored" data-by="ai:claude">Class overrides are the rule devs forget the markup change for. Both files change:</span>

**<span data-proof="authored" data-by="ai:claude">CSS</span>** <span data-proof="authored" data-by="ai:claude">— rename</span> <span data-proof="authored" data-by="ai:claude">`.slds-*`</span> <span data-proof="authored" data-by="ai:claude">selector to</span> <span data-proof="authored" data-by="ai:claude">`{componentName}-{element}`</span> <span data-proof="authored" data-by="ai:claude">(camelCase):</span>

```css proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTMwLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
/* before */
.slds-button {
  background: blue;
}

/* after */
.myapp-button {
  background: var(--slds-g-color-accent-1, blue);
}
```

**<span data-proof="authored" data-by="ai:claude">Markup (`.html`</span>** **<span data-proof="authored" data-by="ai:claude">or</span>** **<span data-proof="authored" data-by="ai:claude">`.cmp`)</span>** <span data-proof="authored" data-by="ai:claude">— add the new class alongside the existing SLDS class:</span>

```html proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTAyLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<!-- before -->
<button class="slds-button">

<!-- after -->
<button class="slds-button myapp-button">
```

<span data-proof="authored" data-by="ai:claude">Forgetting the markup change leaves the component looking unstyled. This is the #1 SLDS-2 uplift bug.</span>

### <span data-proof="authored" data-by="ai:claude">Step 7: Validate (Principle 2)</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6ODYsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
# Re-run linter — must return zero errors
npx @salesforce-ux/slds-linter@latest lint .
```

<span data-proof="authored" data-by="ai:claude">Then run any existing Jest tests to confirm rendering didn't regress visually:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NDQsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
npm test --prefix force-app/main/default/lwc
```

### Fail-closed contract

Each named check requires a tool invocation. Do not report the check as passing because the tool was skipped, timed out, returned empty/uncertain output, or is not installed. Attempt preferred, then fallback, then record `<check>=unavailable: <reason>`. An empty success payload is not a pass.

| Check  | Preferred                                      | Fallback                                              | Report line                                          |
| ------ | ---------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Linter | `npx @salesforce-ux/slds-linter@latest lint .` | `npx @salesforce-ux/slds-linter lint <component-dir>` | `Linter: 0 errors` or `linter=unavailable: <reason>` |
| Tests  | `npm test --prefix force-app/main/default/lwc` | `npm test` at repo root if LWC prefix missing         | `Tests: ...` or `tests=unavailable: <reason>`        |

Zero linter errors is the gate. Missing Jest is `tests=unavailable`, not a visual pass.

***