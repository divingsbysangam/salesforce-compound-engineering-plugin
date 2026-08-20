# Output report

Read with `flow-generate/SKILL.md`. Procedure lives here.

## Output report
```
Generated:
- force-app/main/default/flows/<FlowApiName>.flow-meta.xml

Pipeline:
- Step 1 (fetchGroundedObjectMetadata):  OK
- Step 2 (flowElementSelection):         OK (operationId=<id>)
- Step 3 (flowElementGeneration):        N iterations, isComplete=true

Analyzer:    {sev0=0, sev1=0, sev2=0, sev3=N}    or "unavailable: <reason>"
Reviews:
- flow-governor-monitor:        {findings count}
- flow-complexity-analyzer:     {findings count}
- process-automation-strategist:{verdict}

Verification Strategy: {how this flow will be tested — sf agent test, manual run, or recordTrigger fire}
```

***

