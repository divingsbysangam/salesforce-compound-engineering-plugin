# Phase 2: Author the test class (mandatory, Principle 2)

Read with `apex-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 2: Author the test class (mandatory, Principle 2)</span>
<span data-proof="authored" data-by="ai:claude">A class without tests is not a deliverable. Generate</span> <span data-proof="authored" data-by="ai:claude">`{ClassName}Test.cls`</span> <span data-proof="authored" data-by="ai:claude">and its</span> <span data-proof="authored" data-by="ai:claude">`.cls-meta.xml`</span> <span data-proof="authored" data-by="ai:claude">immediately.</span>

<span data-proof="authored" data-by="ai:claude">Test discipline (every rule is enforced):</span>

| <span data-proof="authored" data-by="ai:claude">Rule</span>                                                                                                                                                                                                                                  | <span data-proof="authored" data-by="ai:claude">Application</span>                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **<span data-proof="authored" data-by="ai:claude">One behavior per method</span>**                                                                                                                                                                                                           | <span data-proof="authored" data-by="ai:claude">`shouldUpdateStatus_WhenValidInput`,</span> <span data-proof="authored" data-by="ai:claude">`shouldThrow_WhenNullInput`,</span> <span data-proof="authored" data-by="ai:claude">`shouldHandleBulk_When251Records`</span> <span data-proof="authored" data-by="ai:claude">— separate methods per scenario</span>           |
| **<span data-proof="authored" data-by="ai:claude">Bulkify with 251+ records</span>**                                                                                                                                                                                                         | <span data-proof="authored" data-by="ai:claude">Crosses the 200-trigger batch boundary. For batch Apex tests, set</span> <span data-proof="authored" data-by="ai:claude">`batchSize >= testRecordCount`</span>                                                                                                                                                            |
| **<span data-proof="authored" data-by="ai:claude">Isolate test data via</span>** **<span data-proof="authored" data-by="ai:claude">`TestDataFactory`</span>**                                                                                                                                | <span data-proof="authored" data-by="ai:claude">Never inline record building in</span> <span data-proof="authored" data-by="ai:claude">`@TestSetup`. If TDF doesn't exist, generate it first</span>                                                                                                                                                                       |
| **<span data-proof="authored" data-by="ai:claude">Use</span>** **<span data-proof="authored" data-by="ai:claude">`Assert`</span><span data-proof="authored" data-by="ai:claude">class only</span>**                                                                                          | <span data-proof="authored" data-by="ai:claude">`Assert.areEqual`,</span> <span data-proof="authored" data-by="ai:claude">`Assert.isTrue`,</span> <span data-proof="authored" data-by="ai:claude">`Assert.fail`</span> <span data-proof="authored" data-by="ai:claude">— never legacy</span> <span data-proof="authored" data-by="ai:claude">`System.assertEquals`</span> |
| **<span data-proof="authored" data-by="ai:claude">Wrap with</span>** **<span data-proof="authored" data-by="ai:claude">`Test.startTest()`</span>** **<span data-proof="authored" data-by="ai:claude">/</span>** **<span data-proof="authored" data-by="ai:claude">`Test.stopTest()`</span>** | <span data-proof="authored" data-by="ai:claude">Resets governor limits, fires async synchronously</span>                                                                                                                                                                                                                                                                  |
| **<span data-proof="authored" data-by="ai:claude">Mock external boundaries</span>**                                                                                                                                                                                                          | <span data-proof="authored" data-by="ai:claude">`HttpCalloutMock`</span> <span data-proof="authored" data-by="ai:claude">for callouts,</span> <span data-proof="authored" data-by="ai:claude">`Test.setFixedSearchResults`</span> <span data-proof="authored" data-by="ai:claude">for SOSL, DML mocks via dependency injection</span>                                     |
| **<span data-proof="authored" data-by="ai:claude">Test negative paths</span>**                                                                                                                                                                                                               | <span data-proof="authored" data-by="ai:claude">Validate exceptions and error handling, not just happy paths</span>                                                                                                                                                                                                                                                       |
| **<span data-proof="authored" data-by="ai:claude">No</span>** **<span data-proof="authored" data-by="ai:claude">`SeeAllData=true`</span>**                                                                                                                                                   | <span data-proof="authored" data-by="ai:claude">Org data dependency = flaky tests</span>                                                                                                                                                                                                                                                                                  |
| **<span data-proof="authored" data-by="ai:claude">No magic numbers in assertions</span>**                                                                                                                                                                                                    | <span data-proof="authored" data-by="ai:claude">Derive expected values from setup constants</span>                                                                                                                                                                                                                                                                        |

<span data-proof="authored" data-by="ai:claude">Given/When/Then structure inside every test method:</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mzc1LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
@isTest
static void shouldUpdateStatus_WhenValidInput() {
    // Given
    List<Account> accounts = [SELECT Id FROM Account];

    // When
    Test.startTest();
    MyService.processAccounts(accounts);
    Test.stopTest();

    // Then
    Assert.areEqual(251, [SELECT COUNT() FROM Account WHERE Status__c = 'Processed'],
        'All accounts should be marked Processed');
}
```

<span data-proof="authored" data-by="ai:claude">Coverage targets:</span> **<span data-proof="authored" data-by="ai:claude">75% minimum to deploy, 90%+ recommended</span>** <span data-proof="authored" data-by="ai:claude">per class.</span>

***

