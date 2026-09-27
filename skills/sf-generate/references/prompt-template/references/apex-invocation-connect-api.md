# Apex Invocation (Connect API)

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Apex Invocation (Connect API)</span>
### <span data-proof="authored" data-by="ai:claude">Core Pattern</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTM2MSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
public with sharing class PromptTemplateController {

    @AuraEnabled
    public static String invokeTemplate(String recordId) {
        // 1. Build input parameters
        Map<String, String> recordMap = new Map<String, String>();
        recordMap.put('id', recordId);

        ConnectApi.WrappedValue wrappedRecord = new ConnectApi.WrappedValue();
        wrappedRecord.value = recordMap;

        Map<String, ConnectApi.WrappedValue> inputParams =
            new Map<String, ConnectApi.WrappedValue>();
        inputParams.put('Input:Case', wrappedRecord);

        // 2. Configure execution
        ConnectApi.EinsteinPromptTemplateGenerationsInput templateInput =
            new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        templateInput.additionalConfig =
            new ConnectApi.EinsteinLlmAdditionalConfigInput();
        templateInput.additionalConfig.applicationName = 'PromptBuilderPreview';
        templateInput.isPreview = false;
        templateInput.inputParams = inputParams;

        // 3. Execute and return
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
                'My_Template_Api_Name',  // Template developer name
                templateInput
            );

        return result.generations[0].text;
    }
}
```

### <span data-proof="authored" data-by="ai:claude">Key Method</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTQ3LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
    String templateApiName,
    ConnectApi.EinsteinPromptTemplateGenerationsInput input
)
```

### <span data-proof="authored" data-by="ai:claude">Input Configuration Parameters</span>

| <span data-proof="authored" data-by="ai:claude">Parameter</span>                          | <span data-proof="authored" data-by="ai:claude">Type</span>    | <span data-proof="authored" data-by="ai:claude">Description</span>                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`isPreview`</span>                        | <span data-proof="authored" data-by="ai:claude">Boolean</span> | <span data-proof="authored" data-by="ai:claude">`true`</span> <span data-proof="authored" data-by="ai:claude">= resolved prompt only (no LLM call),</span> <span data-proof="authored" data-by="ai:claude">`false`</span> <span data-proof="authored" data-by="ai:claude">= full generation</span> |
| <span data-proof="authored" data-by="ai:claude">`numGenerations`</span>                   | <span data-proof="authored" data-by="ai:claude">Integer</span> | <span data-proof="authored" data-by="ai:claude">Number of responses (default: 1)</span>                                                                                                                                                                                                            |
| <span data-proof="authored" data-by="ai:claude">`temperature`</span>                      | <span data-proof="authored" data-by="ai:claude">Decimal</span> | <span data-proof="authored" data-by="ai:claude">0.0–1.0 randomness (0 = deterministic)</span>                                                                                                                                                                                                      |
| <span data-proof="authored" data-by="ai:claude">`frequencyPenalty`</span>                 | <span data-proof="authored" data-by="ai:claude">Decimal</span> | <span data-proof="authored" data-by="ai:claude">Controls token repetition</span>                                                                                                                                                                                                                   |
| <span data-proof="authored" data-by="ai:claude">`inputParams`</span>                      | <span data-proof="authored" data-by="ai:claude">Map</span>     | <span data-proof="authored" data-by="ai:claude">Objects keyed as</span> <span data-proof="authored" data-by="ai:claude">`Input:ResourceApiName`</span>                                                                                                                                             |
| <span data-proof="authored" data-by="ai:claude">`additionalConfig.applicationName`</span> | <span data-proof="authored" data-by="ai:claude">String</span>  | <span data-proof="authored" data-by="ai:claude">Application context identifier</span>                                                                                                                                                                                                              |

### <span data-proof="authored" data-by="ai:claude">Response Structure</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzcyLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
// Response object
ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result;

// Access generated text
String generatedText = result.generations[0].text;

// Access safety scores (Einstein Trust Layer)
ConnectApi.SafetyScoreRepresentation safety = result.safetyScoreRepresentation;

// Access resolved prompt (for debugging)
String resolvedPrompt = result.prompt;
```

### <span data-proof="authored" data-by="ai:claude">Multiple Input Objects (Flex Template)</span>

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjYyLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
// For Flex templates with multiple inputs
Map<String, ConnectApi.WrappedValue> inputParams =
    new Map<String, ConnectApi.WrappedValue>();

// First input
Map<String, String> contactMap = new Map<String, String>();
contactMap.put('id', contactId);
ConnectApi.WrappedValue contactValue = new ConnectApi.WrappedValue();
contactValue.value = contactMap;
inputParams.put('Input:Contact', contactValue);

// Second input
Map<String, String> accountMap = new Map<String, String>();
accountMap.put('id', accountId);
ConnectApi.WrappedValue accountValue = new ConnectApi.WrappedValue();
accountValue.value = accountMap;
inputParams.put('Input:Account', accountValue);
```

***

