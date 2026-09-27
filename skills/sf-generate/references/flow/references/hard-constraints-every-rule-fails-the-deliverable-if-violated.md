# Hard constraints (every rule fails the deliverable if violated)

Read with `flow-generate/SKILL.md`. Procedure lives here.

## Hard constraints (every rule fails the deliverable if violated)
| Rule                                       | Why                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Never hand-write Flow XML                  | Pipeline correctness is in the tool, not the LLM                                                                                                                                        |
| Bulkify — no DML/SOQL inside Loop elements | Governor limits multiply per record                                                                                                                                                     |
| Entry conditions on record-triggered flows | Skip records that don't need the flow; scale safety                                                                                                                                     |
| Fault path on every DML / callout          | Errors must surface, never silently swallow                                                                                                                                             |
| Element naming follows project convention  | E.g., `Get_<Object>_Details`, `Decision_Check_<Field>`                    |
| API name follows project convention        | `<Object>_<Trigger>_<Action>` (e.g., `Lead_BeforeSave_PopulateTerritory`) |

***

