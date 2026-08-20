# Flow Integration

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Flow Integration</span>
### <span data-proof="authored" data-by="ai:claude">Invoking Templates from Flow</span>

1. <span data-proof="authored" data-by="ai:claude">Templates auto-expose as</span> **<span data-proof="authored" data-by="ai:claude">invocable actions</span>** <span data-proof="authored" data-by="ai:claude">once activated</span>
2. <span data-proof="authored" data-by="ai:claude">In Flow Builder, add an</span> **<span data-proof="authored" data-by="ai:claude">Action</span>** <span data-proof="authored" data-by="ai:claude">element</span>
3. <span data-proof="authored" data-by="ai:claude">Filter by category:</span> **<span data-proof="authored" data-by="ai:claude">Prompt Template</span>**
4. <span data-proof="authored" data-by="ai:claude">Select your template</span>
5. <span data-proof="authored" data-by="ai:claude">Pass the record as the related entity input</span>

### <span data-proof="authored" data-by="ai:claude">Record-Triggered Flow Pattern (Case Summarization)</span>

**<span data-proof="authored" data-by="ai:claude">Architecture:</span>**

1. <span data-proof="authored" data-by="ai:claude">Record-Triggered Flow fires on Case create/update</span>
2. <span data-proof="authored" data-by="ai:claude">Entry conditions:</span> <span data-proof="authored" data-by="ai:claude">`Type IS NULL`</span> <span data-proof="authored" data-by="ai:claude">OR</span> <span data-proof="authored" data-by="ai:claude">`Reason IS NULL`</span> <span data-proof="authored" data-by="ai:claude">OR</span> <span data-proof="authored" data-by="ai:claude">`Quick_Summary__c IS NULL`</span>
3. <span data-proof="authored" data-by="ai:claude">Action: Invoke prompt template → returns JSON</span>
4. <span data-proof="authored" data-by="ai:claude">Action: Call Apex</span> <span data-proof="authored" data-by="ai:claude">`@InvocableMethod`</span> <span data-proof="authored" data-by="ai:claude">to parse JSON</span>
5. <span data-proof="authored" data-by="ai:claude">Update Record: Set fields from parsed values</span>

**<span data-proof="authored" data-by="ai:claude">Apex JSON Parser for Flow:</span>**

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTAwMSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
public with sharing class CaseSummarizationParser {

    @InvocableMethod(label='Parse Case Summary JSON')
    public static List<CaseSummary> parseSummary(List<String> jsonInputs) {
        List<CaseSummary> results = new List<CaseSummary>();

        for (String jsonInput : jsonInputs) {
            Map<String, Object> parsed =
                (Map<String, Object>) JSON.deserializeUntyped(jsonInput);

            CaseSummary summary = new CaseSummary();
            summary.caseType = (String) parsed.get('caseType');
            summary.reason = (String) parsed.get('reason');
            summary.summaryText = (String) parsed.get('summary');
            results.add(summary);
        }

        return results;
    }

    public class CaseSummary {
        @InvocableVariable(label='Case Type')
        public String caseType;

        @InvocableVariable(label='Reason')
        public String reason;

        @InvocableVariable(label='Summary Text')
        public String summaryText;
    }
}
```

***

