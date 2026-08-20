# Grounding with Data Providers

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Grounding with Data Providers</span>
### <span data-proof="authored" data-by="ai:claude">Flow Grounding</span>

<span data-proof="authored" data-by="ai:claude">Create a</span> **<span data-proof="authored" data-by="ai:claude">Template-Triggered Prompt Flow</span>** <span data-proof="authored" data-by="ai:claude">bound to the template capability.</span>

**<span data-proof="authored" data-by="ai:claude">Flow elements:</span>**

1. **<span data-proof="authored" data-by="ai:claude">Start Element</span>** <span data-proof="authored" data-by="ai:claude">— configure with Prompt Template Type and input object</span>
2. **<span data-proof="authored" data-by="ai:claude">Get Records</span>** <span data-proof="authored" data-by="ai:claude">— query related data</span>
3. **<span data-proof="authored" data-by="ai:claude">Loop</span>** <span data-proof="authored" data-by="ai:claude">— iterate through records</span>
4. **<span data-proof="authored" data-by="ai:claude">Add Prompt Instructions</span>** <span data-proof="authored" data-by="ai:claude">— append text to the prompt (can be used multiple times)</span>

**<span data-proof="authored" data-by="ai:claude">XML data provider definition:</span>**

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzgxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<templateDataProviders>
    <definition>flow://GetCaseAnalysis</definition>
    <parameters>
        <definition>SOBJECT://Case</definition>
        <isRequired>true</isRequired>
        <parameterName>myCase</parameterName>
        <valueExpression>{!$Input:Case}</valueExpression>
    </parameters>
    <referenceName>Flow:GetCaseAnalysis</referenceName>
</templateDataProviders>
```

### <span data-proof="authored" data-by="ai:claude">Apex Grounding</span>

<span data-proof="authored" data-by="ai:claude">Implement an</span> <span data-proof="authored" data-by="ai:claude">`@InvocableMethod`</span> <span data-proof="authored" data-by="ai:claude">annotated to a capability type.</span>

**<span data-proof="authored" data-by="ai:claude">Capability types:</span>**

| <span data-proof="authored" data-by="ai:claude">Template Type</span>    | <span data-proof="authored" data-by="ai:claude">Capability</span>                                           |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">Sales Email</span>      | <span data-proof="authored" data-by="ai:claude">`PromptTemplateType://einstein_gpt__salesEmail`</span>      |
| <span data-proof="authored" data-by="ai:claude">Field Generation</span> | <span data-proof="authored" data-by="ai:claude">`PromptTemplateType://einstein_gpt__fieldCompletion`</span> |
| <span data-proof="authored" data-by="ai:claude">Flex</span>             | <span data-proof="authored" data-by="ai:claude">`FlexTemplate://Template_Api_Name`</span>                   |
| <span data-proof="authored" data-by="ai:claude">Record Summary</span>   | <span data-proof="authored" data-by="ai:claude">`PromptTemplateType://einstein_gpt__recordSummary`</span>   |

**<span data-proof="authored" data-by="ai:claude">Apex grounding class:</span>**

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTMwNywiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
public with sharing class CaseContextProvider {

    @InvocableMethod(
        label='Get Case Context'
        capabilityType='PromptTemplateType://einstein_gpt__fieldCompletion'
    )
    public static List<Response> getCaseContext(List<Request> requests) {
        List<Response> responses = new List<Response>();

        for (Request req : requests) {
            Case c = req.myCase;

            // Query related data
            List<CaseComment> comments = [
                SELECT CommentBody, CreatedDate, CreatedBy.Name
                FROM CaseComment
                WHERE ParentId = :c.Id
                WITH SECURITY_ENFORCED
                ORDER BY CreatedDate DESC
                LIMIT 10
            ];

            // Build context string
            String context = 'Recent comments:\n';
            for (CaseComment cc : comments) {
                context += '- ' + cc.CreatedBy.Name + ': ' + cc.CommentBody + '\n';
            }

            Response res = new Response();
            res.prompt = context;
            responses.add(res);
        }

        return responses;
    }

    public class Request {
        @InvocableVariable(required=true)
        public Case myCase;
    }

    public class Response {
        @InvocableVariable
        public String prompt;
    }
}
```

**<span data-proof="authored" data-by="ai:claude">XML data provider for Apex:</span>**

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mzg5LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<templateDataProviders>
    <definition>apex://CaseContextProvider</definition>
    <parameters>
        <definition>SOBJECT://Case</definition>
        <isRequired>true</isRequired>
        <parameterName>myCase</parameterName>
        <valueExpression>{!$Input:Case}</valueExpression>
    </parameters>
    <referenceName>Apex:CaseContextProvider</referenceName>
</templateDataProviders>
```

***

