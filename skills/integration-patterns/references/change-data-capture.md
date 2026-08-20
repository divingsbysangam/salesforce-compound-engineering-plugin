# Change Data Capture

Read with `integration-patterns/SKILL.md`. Procedure lives here.

## Change Data Capture
```apex
trigger AccountChangeEventTrigger on AccountChangeEvent (after insert) {
    for (AccountChangeEvent event : Trigger.new) {
        EventBus.ChangeEventHeader header = event.ChangeEventHeader;
        
        String changeType = header.getChangeType();
        List<String> changedFields = header.getChangedFields();
        
        switch on changeType {
            when 'CREATE' {
                handleCreate(event);
            }
            when 'UPDATE' {
                handleUpdate(event, changedFields);
            }
            when 'DELETE' {
                handleDelete(event);
            }
        }
    }
}
```

