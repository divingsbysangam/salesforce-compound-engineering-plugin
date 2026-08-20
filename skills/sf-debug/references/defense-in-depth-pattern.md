# Defense-in-depth pattern

Read with `sf-debug/SKILL.md`. Procedure lives here.

## Defense-in-depth pattern
A confirmed fix should be reinforced at four layers so the same class of bug cannot silently recur:

1. **Entry Point** — a guard clause in the trigger handler that rejects or short-circuits invalid invocations (recursion flags, context checks, null/empty collections).
2. **Business Logic** — validation in the service layer, independent of the entry point, so the invariant holds no matter who calls it.
3. **Environment Guards** — custom-metadata or feature-toggle checks that gate risky paths per org/environment, so a fix can be rolled out or rolled back without a deploy.
4. **Debug Instrumentation** — structured logging that captures a governor-limit snapshot at each boundary:

   ```apex
   System.debug(LoggingLevel.INFO, String.format(
       'boundary={0} soql={1}/{2} dml={3}/{4} cpu={5}ms',
       new List<Object>{
           boundaryName,
           Limits.getQueries(),      Limits.getLimitQueries(),
           Limits.getDmlStatements(), Limits.getLimitDmlStatements(),
           Limits.getCpuTime()
       }));
   ```

   Snapshotting `Limits.getQueries()`, `Limits.getDmlStatements()`, and `Limits.getCpuTime()` at each boundary turns an opaque `System.LimitException` into a traceable curve — you see which boundary the consumption spikes at.

