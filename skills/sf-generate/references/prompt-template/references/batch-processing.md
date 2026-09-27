# Batch Processing

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Batch Processing</span>
<span data-proof="authored" data-by="ai:claude">For bulk generation using</span> <span data-proof="authored" data-by="ai:claude">`AiJobRun`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`AiJobRunItem`</span> <span data-proof="authored" data-by="ai:claude">objects.</span>

### <span data-proof="authored" data-by="ai:claude">Limits</span>

| <span data-proof="authored" data-by="ai:claude">Constraint</span>          | <span data-proof="authored" data-by="ai:claude">Limit</span>                                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">Standard batch size</span> | <span data-proof="authored" data-by="ai:claude">1,000 items per</span> <span data-proof="authored" data-by="ai:claude">`AiJobRun`</span>                                                               |
| <span data-proof="authored" data-by="ai:claude">Native batch models</span> | <span data-proof="authored" data-by="ai:claude">10,000 items per</span> <span data-proof="authored" data-by="ai:claude">`AiJobRun`</span>                                                              |
| <span data-proof="authored" data-by="ai:claude">Daily limit</span>         | <span data-proof="authored" data-by="ai:claude">5</span> <span data-proof="authored" data-by="ai:claude">`AiJobRun`</span> <span data-proof="authored" data-by="ai:claude">objects per 24 hours</span> |

### <span data-proof="authored" data-by="ai:claude">Batch Workflow</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Njc4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
// 1. Create the batch job
AiJobRun job = new AiJobRun();
job.PromptTemplateApiName = 'Summarize_Case';
job.JobType = 'PromptTemplate';
job.Status = 'New';
insert job;

// 2. Create batch items
List<AiJobRunItem> items = new List<AiJobRunItem>();
for (Case c : cases) {
    AiJobRunItem item = new AiJobRunItem();
    item.AiJobRunId = job.Id;
    item.Input = JSON.serialize(new Map<String, Object>{
        'Input:Case' => new Map<String, String>{ 'id' => c.Id }
    });
    items.add(item);
}
insert items;

// 3. Start the job
job.Status = 'ReadyToStart';
update job;

// 4. Monitor via AiJobRunStatusEvent platform event
// Query AiJobRunItem.Response for completed results
```

### <span data-proof="authored" data-by="ai:claude">Monitoring</span>

<span data-proof="authored" data-by="ai:claude">Subscribe to the</span> <span data-proof="authored" data-by="ai:claude">`AiJobRunStatusEvent`</span> <span data-proof="authored" data-by="ai:claude">platform event for status changes:</span>

* <span data-proof="authored" data-by="ai:claude">`InProgress`</span> <span data-proof="authored" data-by="ai:claude">— processing started</span>

* <span data-proof="authored" data-by="ai:claude">`Completed`</span> <span data-proof="authored" data-by="ai:claude">— all items processed</span>

* <span data-proof="authored" data-by="ai:claude">`Failed`</span> <span data-proof="authored" data-by="ai:claude">— job failed</span>

***

