# Agent Script Integration

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Agent Script Integration</span>
<span data-proof="authored" data-by="ai:claude">Prompt templates can be invoked as actions within Agent Script agents.</span>

### <span data-proof="authored" data-by="ai:claude">Action Definition</span>

```
action get_personalized_schedule:
  target: generatePromptResponse://Generate_Personalized_Schedule
  inputs:
    "Input:email": string
      description: "User's email address"
      is_required: True
  outputs:
    promptResponse: string
      is_used_by_planner: True
      is_displayable: True
```

### <span data-proof="authored" data-by="ai:claude">Topic Usage</span>

```
topic schedule_generation:
  description: Generates a personalized schedule for guests
  reasoning:
    | Ask the customer for their email address.
    -> @utils.set variable @variables.email
       description: The email address the customer provided
       ...
    -> if @variables.email is not None
      -> run @actions.get_personalized_schedule
         with "Input:email": @variables.email
         set @variables.schedule = @outputs.promptResponse
    | Here is your personalized schedule: {!@variables.schedule}
```

***

