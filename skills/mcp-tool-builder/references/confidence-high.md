# Confidence: High

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Confidence: High
3 similar cases found with identical root cause."

Keep the tone professional and actionable.</content>
        <inputs>
            <apiName>caseNumber</apiName>
            <definition>primitive://String</definition>
            <referenceName>Input:caseNumber</referenceName>
            <required>true</required>
        </inputs>
        <primaryModel>sfdc_ai__DefaultGPT4Omni</primaryModel>
        <status>Published</status>
        <!-- NO versionIdentifier -->
    </templateVersions>
    <type>einstein_gpt__global</type>
    <visibility>Global</visibility>
</GenAiPromptTemplate>
```

### Working Template — SObject Input

```xml
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPromptTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <developerName>Account_Review_Custom</developerName>
    <masterLabel>Account Review</masterLabel>
    <relatedEntity>Account</relatedEntity>
    <templateVersions>
        <content>Analyze this account:
- Name: {!$Input:Account.Name}
- Industry: {!$Input:Account.Industry}
- Revenue: {!$Input:Account.AnnualRevenue}

Provide a health assessment with risks and next actions.</content>
        <inputs>
            <apiName>myAccount</apiName>
            <definition>SOBJECT://Account</definition>
            <referenceName>Input:Account</referenceName>
            <required>true</required>
        </inputs>
        <primaryModel>sfdc_ai__DefaultGPT4Omni</primaryModel>
        <status>Published</status>
    </templateVersions>
    <type>einstein_gpt__flex</type>
    <visibility>Global</visibility>
</GenAiPromptTemplate>
```

### Template with Apex Data Provider

```xml
<templateDataProviders>
    <definition>apex://CaseResolutionContextProvider</definition>
    <description>Searches similar resolved cases</description>
    <label>Case Resolution Context</label>
    <parameters>
        <definition>primitive://String</definition>
        <isRequired>true</isRequired>
        <parameterName>caseId</parameterName>
        <valueExpression>{!$Input:caseNumber}</valueExpression>
    </parameters>
    <referenceName>Apex:CaseResolutionContextProvider</referenceName>
</templateDataProviders>
```

> **Merge field placement rule:** NEVER put `{!$Apex:...}` merge fields inside instruction sentences. Always put data in a dedicated section BEFORE instructions.

```
