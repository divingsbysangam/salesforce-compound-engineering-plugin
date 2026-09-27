# Limit Check Methods

Read with `governor-limits/SKILL.md`. Procedure lives here.

## Limit Check Methods
```apex
// Query current usage
System.debug('SOQL Queries: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
System.debug('DML Statements: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
System.debug('CPU Time: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime());
System.debug('Heap Size: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());

// All limit checks
System.debug('SOQL Rows: ' + Limits.getQueryRows() + '/' + Limits.getLimitQueryRows());
System.debug('DML Rows: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows());
System.debug('Callouts: ' + Limits.getCallouts() + '/' + Limits.getLimitCallouts());
System.debug('Future Calls: ' + Limits.getFutureCalls() + '/' + Limits.getLimitFutureCalls());
System.debug('Queueable Jobs: ' + Limits.getQueueableJobs() + '/' + Limits.getLimitQueueableJobs());
```

