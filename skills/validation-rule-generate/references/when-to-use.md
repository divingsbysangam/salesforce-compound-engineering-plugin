# When to use

Read with `validation-rule-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">When to use</span>
* <span data-proof="authored" data-by="ai:claude">Block invalid records at the data layer (preferred over Apex / Flow when the rule is purely declarative)</span>

* <span data-proof="authored" data-by="ai:claude">Enforce business rules with user-friendly error messages</span>

* <span data-proof="authored" data-by="ai:claude">Cross-field validation, picklist consistency, date sanity checks</span>

* <span data-proof="authored" data-by="ai:claude">Generate the matching</span> <span data-proof="authored" data-by="ai:claude">`.validationRule-meta.xml`</span> <span data-proof="authored" data-by="ai:claude">file</span>

<span data-proof="authored" data-by="ai:claude">If the validation needs to</span> *<span data-proof="authored" data-by="ai:claude">modify</span>* <span data-proof="authored" data-by="ai:claude">a record (not just block it), this is the wrong skill — use</span> <span data-proof="authored" data-by="ai:claude">`flow-generate`</span> <span data-proof="authored" data-by="ai:claude">(before-save flow) or</span> <span data-proof="authored" data-by="ai:claude">`apex-generate`</span> <span data-proof="authored" data-by="ai:claude">(before-update trigger).</span>

***

