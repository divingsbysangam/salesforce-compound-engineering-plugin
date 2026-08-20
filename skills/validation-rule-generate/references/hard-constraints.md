# Hard constraints

Read with `validation-rule-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Hard constraints</span>
<span data-proof="authored" data-by="ai:claude">These are the most-common deployment failures. Treat each as a non-negotiable gate.</span>

### <span data-proof="authored" data-by="ai:claude">1. CDATA-wrap the formula when it contains XML special characters</span>

<span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`errorConditionFormula`</span> <span data-proof="authored" data-by="ai:claude">contains</span> <span data-proof="authored" data-by="ai:claude">`<`,</span> <span data-proof="authored" data-by="ai:claude">`>`,</span> <span data-proof="authored" data-by="ai:claude">`&`, or</span> <span data-proof="authored" data-by="ai:claude">`"`, wrap it:</span>

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTI1LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<errorConditionFormula><![CDATA[
  AND(
    ISBLANK(Industry__c),
    AnnualRevenue > 1000000
  )
]]></errorConditionFormula>
```

<span data-proof="authored" data-by="ai:claude">If the formula has no special characters, plain text works.</span> **<span data-proof="authored" data-by="ai:claude">When in doubt, CDATA-wrap</span>** <span data-proof="authored" data-by="ai:claude">— it's never wrong.</span>

### <span data-proof="authored" data-by="ai:claude">2. Function correctness (the high-frequency formula errors)</span>

| <span data-proof="authored" data-by="ai:claude">Function</span>      | <span data-proof="authored" data-by="ai:claude">Rule</span>                                                                                                                                                                                                                                                       | <span data-proof="authored" data-by="ai:claude">Common mistake</span>                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`TEXT()`</span>      | <span data-proof="authored" data-by="ai:claude">Not on Text fields. Use only on numbers, dates, picklists</span>                                                                                                                                                                                                  | <span data-proof="authored" data-by="ai:claude">`TEXT(Name)`</span> <span data-proof="authored" data-by="ai:claude">— drop the</span> <span data-proof="authored" data-by="ai:claude">`TEXT()`</span>                                                                       |
| <span data-proof="authored" data-by="ai:claude">`CASE()`</span>      | <span data-proof="authored" data-by="ai:claude">Last argument is the</span> **<span data-proof="authored" data-by="ai:claude">default value</span>** <span data-proof="authored" data-by="ai:claude">— always required. Total args must be</span> **<span data-proof="authored" data-by="ai:claude">even</span>** | <span data-proof="authored" data-by="ai:claude">Missing default → deploy fail</span>                                                                                                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">`VALUE()`</span>     | <span data-proof="authored" data-by="ai:claude">Only on Text fields parsed to number. Don't wrap a number</span>                                                                                                                                                                                                  | <span data-proof="authored" data-by="ai:claude">`VALUE(Amount)`</span> <span data-proof="authored" data-by="ai:claude">when</span> <span data-proof="authored" data-by="ai:claude">`Amount`</span> <span data-proof="authored" data-by="ai:claude">is already Number</span> |
| <span data-proof="authored" data-by="ai:claude">`DAY()`</span>       | <span data-proof="authored" data-by="ai:claude">Only on</span> **<span data-proof="authored" data-by="ai:claude">Date</span>** <span data-proof="authored" data-by="ai:claude">fields. Convert Datetime first</span>                                                                                              | <span data-proof="authored" data-by="ai:claude">`DAY(CreatedDate)`</span> <span data-proof="authored" data-by="ai:claude">— wrap with</span> <span data-proof="authored" data-by="ai:claude">`DATEVALUE(CreatedDate)`</span>                                                |
| <span data-proof="authored" data-by="ai:claude">`MONTH()`</span>     | <span data-proof="authored" data-by="ai:claude">Only on</span> **<span data-proof="authored" data-by="ai:claude">Date</span>** <span data-proof="authored" data-by="ai:claude">fields. Same Datetime fix</span>                                                                                                   | <span data-proof="authored" data-by="ai:claude">Same as</span> <span data-proof="authored" data-by="ai:claude">`DAY()`</span>                                                                                                                                               |
| <span data-proof="authored" data-by="ai:claude">`DATEVALUE()`</span> | <span data-proof="authored" data-by="ai:claude">Only on</span> **<span data-proof="authored" data-by="ai:claude">Datetime</span>** <span data-proof="authored" data-by="ai:claude">fields. Don't wrap a Date</span>                                                                                               | <span data-proof="authored" data-by="ai:claude">`DATEVALUE(CloseDate)`</span> <span data-proof="authored" data-by="ai:claude">— drop it</span>                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`ISPICKVAL()`</span> | **<span data-proof="authored" data-by="ai:claude">Required</span>** <span data-proof="authored" data-by="ai:claude">for picklist equality. Plain</span> <span data-proof="authored" data-by="ai:claude">`=`</span> <span data-proof="authored" data-by="ai:claude">does not work</span>                           | <span data-proof="authored" data-by="ai:claude">`Status = 'Open'`</span> <span data-proof="authored" data-by="ai:claude">→</span> <span data-proof="authored" data-by="ai:claude">`ISPICKVAL(Status, 'Open')`</span>                                                        |
| <span data-proof="authored" data-by="ai:claude">`ISCHANGED()`</span> | <span data-proof="authored" data-by="ai:claude">Use to detect field-value change between old and new</span>                                                                                                                                                                                                       | <br />                                                                                                                                                                                                                                                                      |

### <span data-proof="authored" data-by="ai:claude">3. Update-vs-replace semantics (Principle 5 — taste)</span>

<span data-proof="authored" data-by="ai:claude">When a user says "update the formula":</span>

* **<span data-proof="authored" data-by="ai:claude">"Update the formula to</span>** **<span data-proof="authored" data-by="ai:claude"><X>"</span>** <span data-proof="authored" data-by="ai:claude">→ completely replace the existing formula logic with</span> <span data-proof="authored" data-by="ai:claude">`<X>`.</span>

* **<span data-proof="authored" data-by="ai:claude">"Update the formula to also</span>** **<span data-proof="authored" data-by="ai:claude"><X>"</span>** <span data-proof="authored" data-by="ai:claude">→ keep existing logic, append with</span> <span data-proof="authored" data-by="ai:claude">`AND(<existing>, <X>)`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`OR(<existing>, <X>)`</span> <span data-proof="authored" data-by="ai:claude">— read carefully which one the user means.</span>

<span data-proof="authored" data-by="ai:claude">Never silently rewrite. Echo your interpretation in the report.</span>

### <span data-proof="authored" data-by="ai:claude">4. File path and extension</span>

```
force-app/main/default/objects/<ObjectApiName>/validationRules/<fullName>.validationRule-meta.xml
```

<span data-proof="authored" data-by="ai:claude">The</span> <span data-proof="authored" data-by="ai:claude">`.validationRule-meta.xml`</span> <span data-proof="authored" data-by="ai:claude">extension is mandatory. Anything else fails deploy.</span>

***

