# Modes

Read with `agentforce-test/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Modes</span>
| <span data-proof="authored" data-by="ai:claude">Mode</span>                        | <span data-proof="authored" data-by="ai:claude">Use when</span>                                                                                                                       | <span data-proof="authored" data-by="ai:claude">Trade-off</span>                                                                                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **<span data-proof="authored" data-by="ai:claude">A. Ad-hoc preview</span>**       | <span data-proof="authored" data-by="ai:claude">Iterating during authoring; validating a fix from</span> <span data-proof="authored" data-by="ai:claude">`/agentforce-observe`</span> | <span data-proof="authored" data-by="ai:claude">Fast, local traces, no test deploy. Single-run only.</span>                                                                                                                                 |
| **<span data-proof="authored" data-by="ai:claude">B. Testing Center batch</span>** | <span data-proof="authored" data-by="ai:claude">Regression suite, CI/CD, share-with-team</span>                                                                                       | <span data-proof="authored" data-by="ai:claude">Persistent, scriptable. Requires test spec deploy.</span>                                                                                                                                   |
| **<span data-proof="authored" data-by="ai:claude">C. Action execution</span>**     | <span data-proof="authored" data-by="ai:claude">Test a single Flow or Apex action in isolation</span>                                                                                 | <span data-proof="authored" data-by="ai:claude">Bypasses the agent runtime — tests the</span> *<span data-proof="authored" data-by="ai:claude">backing logic</span>*<span data-proof="authored" data-by="ai:claude">, not the agent.</span> |

<span data-proof="authored" data-by="ai:claude">The two modes are NOT alternatives — both belong in a mature workflow. Mode A during dev iteration; Mode B in CI/CD.</span>

***

