# Apex Invocable Action Tools

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Apex Invocable Action Tools
### Requirements — ALL of These Are Mandatory

- **Class** must be `global` (not `public`) — `public` classes are invisible to MCP
- **Method** must be `global` with `@InvocableMethod`
- **All inner classes** (Request/Result) must be `global`
- **All fields** in inner classes must be `global`
- Use `with sharing` for user-context enforcement
- Use `WITH SECURITY_ENFORCED` in all SOQL

> **Real-world issue:** `public` classes deploy fine but silently don't appear as MCP tools. There is no error — the tool just doesn't show up. Always use `global`.

### Basic Scaffold

```apex
global with sharing class AccountReviewTool {

    @InvocableMethod(
        label='Review Account'
        description='Retrieves a comprehensive account summary including open opportunities, recent cases, and key contacts for AI-assisted account review'
    )
    global static List<AccountReview> reviewAccount(List<AccountReviewRequest> requests) {
        List<AccountReview> results = new List<AccountReview>();

        Set<Id> accountIds = new Set<Id>();
        for (AccountReviewRequest req : requests) {
            accountIds.add(req.accountId);
        }

        Map<Id, Account> accounts = new Map<Id, Account>([
            SELECT Id, Name, Industry, AnnualRevenue,
                (SELECT Id, Name, Amount, StageName, CloseDate FROM Opportunities WHERE IsClosed = false),
                (SELECT Id, Subject, Status, Priority FROM Cases WHERE IsClosed = false ORDER BY CreatedDate DESC LIMIT 5),
                (SELECT Id, Name, Title, Email FROM Contacts ORDER BY CreatedDate DESC LIMIT 5)
            FROM Account
            WHERE Id IN :accountIds
            WITH SECURITY_ENFORCED
        ]);

        for (AccountReviewRequest req : requests) {
            Account acc = accounts.get(req.accountId);
            AccountReview review = new AccountReview();

            if (acc != null) {
                review.accountName = acc.Name;
                review.industry = acc.Industry;
                review.annualRevenue = acc.AnnualRevenue;
                review.openOpportunityCount = acc.Opportunities.size();
                review.openCaseCount = acc.Cases.size();
                review.contactCount = acc.Contacts.size();
                review.success = true;
            } else {
                review.success = false;
                review.errorMessage = 'Account not found: ' + req.accountId;
            }

            results.add(review);
        }

        return results;
    }

    global class AccountReviewRequest {
        @InvocableVariable(required=true description='The Salesforce Account record ID to review')
        global String accountId;
    }

    global class AccountReview {
        @InvocableVariable(description='Whether the review was successful')
        global Boolean success;

        @InvocableVariable(description='Account name')
        global String accountName;

        @InvocableVariable(description='Industry classification')
        global String industry;

        @InvocableVariable(description='Annual revenue in org currency')
        global Decimal annualRevenue;

        @InvocableVariable(description='Number of open (unclosed) opportunities')
        global Integer openOpportunityCount;

        @InvocableVariable(description='Number of open (unclosed) support cases')
        global Integer openCaseCount;

        @InvocableVariable(description='Total number of contacts on the account')
        global Integer contactCount;

        @InvocableVariable(description='Error message if the review failed')
        global String errorMessage;
    }
}
```

### Accept Both IDs and Human-Readable Identifiers

> **Real-world issue:** AI clients pass Case Numbers like `00001024`, not Salesforce IDs. Tools that only accept 18-char IDs break.

```apex
@InvocableVariable(required=true
    description='Case ID (18-char Salesforce record ID) or Case Number (e.g. 00001024). Accepts either format.')
global String caseId;

// Helper to detect format
private static Boolean isSalesforceId(String input) {
    if (input == null || (input.length() != 15 && input.length() != 18)) {
        return false;
    }
    try {
        Id.valueOf(input);
        return true;
    } catch (StringException e) {
        return false;
    }
}

// Usage:
if (isSalesforceId(req.caseId)) {
    cases = [SELECT Id FROM Case WHERE Id = :req.caseId WITH SECURITY_ENFORCED];
} else {
    cases = [SELECT Id FROM Case WHERE CaseNumber = :req.caseId WITH SECURITY_ENFORCED];
}
```

### Return Formatted Text, Not Raw JSON

> **Real-world issue:** Claude does not auto-apply prompt template formatting. Pre-format output server-side.

```apex
// BAD: Raw data — AI formats unpredictably
result.data = JSON.serialize(caseList);

// GOOD: Pre-formatted — AI presents directly
result.formattedOutput = '## Resolution Briefing\n\n' +
    '**Root Cause:** ' + rootCause + '\n\n' +
    '**Recommended Resolution:**\n' + resolution + '\n\n' +
    '**Similar Cases:** ' + similarCasesFormatted;
```

---

