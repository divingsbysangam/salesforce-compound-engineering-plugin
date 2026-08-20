# Testing MCP Tools

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Testing MCP Tools
### Unit Testing

```apex
@IsTest
private class AccountReviewToolTest {

    @TestSetup
    static void setupTestData() {
        Account testAccount = new Account(Name = 'Test Corp', Industry = 'Technology');
        insert testAccount;

        insert new Opportunity(
            Name = 'Test Opp', AccountId = testAccount.Id,
            StageName = 'Prospecting', CloseDate = Date.today().addDays(30), Amount = 100000
        );
    }

    @IsTest
    static void testReviewAccount_success() {
        Account acc = [SELECT Id FROM Account LIMIT 1];

        AccountReviewTool.AccountReviewRequest req = new AccountReviewTool.AccountReviewRequest();
        req.accountId = acc.Id;

        System.Test.startTest();
        List<AccountReviewTool.AccountReview> results = AccountReviewTool.reviewAccount(
            new List<AccountReviewTool.AccountReviewRequest>{ req }
        );
        System.Test.stopTest();

        System.assertEquals(1, results.size());
        System.assert(results[0].success);
        System.assertEquals('Test Corp', results[0].accountName);
    }
}
```

> **Use `System.Test`** not `Test` — orgs with a custom `Test` class shadow the system class.

### Postman Testing (Raw JSON)

```json
{"method": "tools/call", "params": {"name": "Review Account", "arguments": {"accountId": "001xx000003DGbYAAW"}}}
```

### Integration Testing with AI Clients

After Postman validation:
1. Connect Claude/Cursor to the custom MCP server
2. Ask natural language questions that should trigger each tool
3. Verify AI correctly selects and invokes tools
4. Check that responses are useful and well-structured

---

