# Merge Fields

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Merge Fields</span>
### <span data-proof="authored" data-by="ai:claude">Syntax Reference</span>

| <span data-proof="authored" data-by="ai:claude">Merge Field Type</span> | <span data-proof="authored" data-by="ai:claude">Syntax</span>                                        | <span data-proof="authored" data-by="ai:claude">Example</span>                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **<span data-proof="authored" data-by="ai:claude">Record field</span>** | <span data-proof="authored" data-by="ai:claude">`{!$Input:Object.FieldName}`</span>                  | <span data-proof="authored" data-by="ai:claude">`{!$Input:Case.Subject}`</span>                    |
| **<span data-proof="authored" data-by="ai:claude">Related list</span>** | <span data-proof="authored" data-by="ai:claude">`{!$RelatedList:Object.Relationship.Records}`</span> | <span data-proof="authored" data-by="ai:claude">`{!$RelatedList:Case.CaseComments.Records}`</span> |
| **<span data-proof="authored" data-by="ai:claude">Flow output</span>**  | <span data-proof="authored" data-by="ai:claude">`{!$Flow:FlowName.OutputVariable}`</span>            | <span data-proof="authored" data-by="ai:claude">`{!$Flow:GetExperiences.experienceList}`</span>    |
| **<span data-proof="authored" data-by="ai:claude">Apex output</span>**  | <span data-proof="authored" data-by="ai:claude">Referenced via data provider</span>                  | <span data-proof="authored" data-by="ai:claude">See Apex Grounding section</span>                  |
| **<span data-proof="authored" data-by="ai:claude">Organization</span>** | <span data-proof="authored" data-by="ai:claude">`{!$Organization.Name}`</span>                       | <span data-proof="authored" data-by="ai:claude">`{!$Organization.Name}`</span>                     |

### <span data-proof="authored" data-by="ai:claude">Merge Field Examples in Prompt Content</span>

```
You are a customer service representative at {!$Organization.Name}.

Summarize the following case:
- Subject: {!$Input:Case.Subject}
- Description: {!$Input:Case.Description}
- Priority: {!$Input:Case.Priority}
- Status: {!$Input:Case.Status}

Related comments:
{!$RelatedList:Case.CaseComments.Records}

Additional context from analysis:
{!$Flow:AnalyzeCase.caseContext}

Return your response as JSON with keys: summary, sentiment, suggestedAction.
```

***

