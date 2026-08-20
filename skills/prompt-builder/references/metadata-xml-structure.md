# Metadata XML Structure

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Metadata XML Structure</span>
### <span data-proof="authored" data-by="ai:claude">GenAiPromptTemplate</span>

<span data-proof="authored" data-by="ai:claude">File location:</span> <span data-proof="authored" data-by="ai:claude">`force-app/main/default/genAiPromptTemplates/<TemplateName>.genAiPromptTemplate-meta.xml`</span>

### <span data-proof="authored" data-by="ai:claude">Complete XML Schema</span>

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTYzMSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPromptTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <activeVersion>{hash}_1</activeVersion>
    <createdInVersion>63.0</createdInVersion>
    <developerName>Template_Api_Name</developerName>
    <masterLabel>Template Display Label</masterLabel>
    <relatedEntity>ObjectApiName</relatedEntity>
    <templateVersions>
        <content>Your prompt instructions go here.
Use merge fields like {!$Input:Case.Subject} for dynamic data.
Use {!$Flow:FlowName.OutputVariable} for Flow-grounded data.
Use {!$RelatedList:Case.CaseComments.Records} for related records.</content>
        <inputs>
            <apiName>inputApiName</apiName>
            <definition>SOBJECT://ObjectApiName</definition>
            <referenceName>Input:ObjectApiName</referenceName>
            <required>true</required>
        </inputs>
        <primaryModel>sfdc_ai__DefaultGPT4Omni</primaryModel>
        <status>Published</status>
        <templateDataProviders>
            <definition>flow://FlowApiName</definition>
            <parameters>
                <definition>SOBJECT://ObjectApiName</definition>
                <isRequired>true</isRequired>
                <parameterName>inputApiName</parameterName>
                <valueExpression>{!$Input:ObjectApiName}</valueExpression>
            </parameters>
            <referenceName>Flow:FlowApiName</referenceName>
        </templateDataProviders>
        <versionIdentifier>{hash}_1</versionIdentifier>
    </templateVersions>
    <type>einstein_gpt__fieldCompletion</type>
    <visibility>Global</visibility>
</GenAiPromptTemplate>
```

### <span data-proof="authored" data-by="ai:claude">Metadata Field Reference</span>

| <span data-proof="authored" data-by="ai:claude">Element</span>                                  | <span data-proof="authored" data-by="ai:claude">Required</span> | <span data-proof="authored" data-by="ai:claude">Description</span>                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">`developerName`</span>                          | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">API name (underscores, no spaces)</span>                                                                                                                                                                                                   |
| <span data-proof="authored" data-by="ai:claude">`masterLabel`</span>                            | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">Display label</span>                                                                                                                                                                                                                       |
| <span data-proof="authored" data-by="ai:claude">`relatedEntity`</span>                          | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">Primary Salesforce object (e.g.,</span> <span data-proof="authored" data-by="ai:claude">`Case`,</span> <span data-proof="authored" data-by="ai:claude">`Account`,</span> <span data-proof="authored" data-by="ai:claude">`Contact`)</span> |
| <span data-proof="authored" data-by="ai:claude">`type`</span>                                   | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">Template type enum (see Template Types table above)</span>                                                                                                                                                                                 |
| <span data-proof="authored" data-by="ai:claude">`visibility`</span>                             | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">`Global`</span> <span data-proof="authored" data-by="ai:claude">or scoped</span>                                                                                                                                                           |
| <span data-proof="authored" data-by="ai:claude">`createdInVersion`</span>                       | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">Minimum API version (use</span> <span data-proof="authored" data-by="ai:claude">`63.0`</span> <span data-proof="authored" data-by="ai:claude">or higher)</span>                                                                            |
| <span data-proof="authored" data-by="ai:claude">`activeVersion`</span>                          | <span data-proof="authored" data-by="ai:claude">Auto</span>     | <span data-proof="authored" data-by="ai:claude">Hash-based version ID (Salesforce-generated)</span>                                                                                                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">`templateVersions`</span>                       | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">Container for version-specific content</span>                                                                                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`templateVersions.content`</span>               | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">The prompt text with merge fields</span>                                                                                                                                                                                                   |
| <span data-proof="authored" data-by="ai:claude">`templateVersions.inputs`</span>                | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">Input object definitions</span>                                                                                                                                                                                                            |
| <span data-proof="authored" data-by="ai:claude">`templateVersions.primaryModel`</span>          | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">LLM model identifier</span>                                                                                                                                                                                                                |
| <span data-proof="authored" data-by="ai:claude">`templateVersions.status`</span>                | <span data-proof="authored" data-by="ai:claude">Yes</span>      | <span data-proof="authored" data-by="ai:claude">`Published`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`Draft`</span>                                                                                                |
| <span data-proof="authored" data-by="ai:claude">`templateVersions.templateDataProviders`</span> | <span data-proof="authored" data-by="ai:claude">No</span>       | <span data-proof="authored" data-by="ai:claude">Flow/Apex grounding definitions</span>                                                                                                                                                                                                     |
| <span data-proof="authored" data-by="ai:claude">`templateVersions.versionIdentifier`</span>     | <span data-proof="authored" data-by="ai:claude">Auto</span>     | <span data-proof="authored" data-by="ai:claude">Hash-based version ID (Salesforce-generated)</span>                                                                                                                                                                                        |

### <span data-proof="authored" data-by="ai:claude">Available Models</span>

| <span data-proof="authored" data-by="ai:claude">Model ID</span>                           | <span data-proof="authored" data-by="ai:claude">Description</span>          |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`sfdc_ai__DefaultGPT4Omni`</span>         | <span data-proof="authored" data-by="ai:claude">GPT-4o (default)</span>     |
| <span data-proof="authored" data-by="ai:claude">`sfdc_ai__DefaultGPT4OmniMini`</span>     | <span data-proof="authored" data-by="ai:claude">GPT-4o Mini</span>          |
| <span data-proof="authored" data-by="ai:claude">`sfdc_ai__DefaultGPT35Turbo`</span>       | <span data-proof="authored" data-by="ai:claude">GPT-3.5 Turbo</span>        |
| <span data-proof="authored" data-by="ai:claude">`sfdc_ai__DefaultBedrockAnthropic`</span> | <span data-proof="authored" data-by="ai:claude">Claude (via Bedrock)</span> |

### <span data-proof="authored" data-by="ai:claude">Input Definition Patterns</span>

| <span data-proof="authored" data-by="ai:claude">Pattern</span>                  | <span data-proof="authored" data-by="ai:claude">Use For</span>                 |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">`SOBJECT://Case`</span>         | <span data-proof="authored" data-by="ai:claude">Salesforce object input</span> |
| <span data-proof="authored" data-by="ai:claude">`flow://MyFlowApiName`</span>   | <span data-proof="authored" data-by="ai:claude">Flow data provider</span>      |
| <span data-proof="authored" data-by="ai:claude">`apex://MyApexClassName`</span> | <span data-proof="authored" data-by="ai:claude">Apex data provider</span>      |

### <span data-proof="authored" data-by="ai:claude">package.xml</span>

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<types>
    <members>*</members>
    <name>GenAiPromptTemplate</name>
</types>
<types>
    <members>*</members>
    <name>GenAiPromptTemplateActv</name>
</types>
```

***

