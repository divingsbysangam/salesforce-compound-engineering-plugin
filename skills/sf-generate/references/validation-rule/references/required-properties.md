# Required properties

Read with `validation-rule-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Required properties</span>
<span data-proof="authored" data-by="ai:claude">Every validation rule needs all four:</span>

| <span data-proof="authored" data-by="ai:claude">Property</span>                  | <span data-proof="authored" data-by="ai:claude">Constraint</span>                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`<fullName>`</span>              | <span data-proof="authored" data-by="ai:claude">Unique API name. Starts with a letter, no consecutive underscores, no trailing underscore,</span> **<span data-proof="authored" data-by="ai:claude">max 40 characters</span>**                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`<active>`</span>                | <span data-proof="authored" data-by="ai:claude">`true`</span> <span data-proof="authored" data-by="ai:claude">to enforce,</span> <span data-proof="authored" data-by="ai:claude">`false`</span> <span data-proof="authored" data-by="ai:claude">to disable</span>                                                                                           |
| <span data-proof="authored" data-by="ai:claude">`<errorConditionFormula>`</span> | <span data-proof="authored" data-by="ai:claude">Logical formula returning</span> <span data-proof="authored" data-by="ai:claude">`TRUE`</span> <span data-proof="authored" data-by="ai:claude">to BLOCK the save (yes —</span> <span data-proof="authored" data-by="ai:claude">`TRUE`</span> <span data-proof="authored" data-by="ai:claude">blocks)</span> |
| <span data-proof="authored" data-by="ai:claude">`<errorMessage>`</span>          | <span data-proof="authored" data-by="ai:claude">User-facing message,</span> **<span data-proof="authored" data-by="ai:claude">max 255 characters</span>**<span data-proof="authored" data-by="ai:claude">. Speak to the user, not the developer</span>                                                                                                      |

***

