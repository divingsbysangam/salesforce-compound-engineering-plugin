# Complete Examples

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Complete Examples</span>
### <span data-proof="authored" data-by="ai:claude">Example 1: Field Generation Template (XML)</span>

<span data-proof="authored" data-by="ai:claude">Generate a marketing description for a custom Experience object.</span>

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTQ0OCwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPromptTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <createdInVersion>63.0</createdInVersion>
    <developerName>Generate_Experience_Description</developerName>
    <masterLabel>Generate Experience Description</masterLabel>
    <relatedEntity>Experience__c</relatedEntity>
    <templateVersions>
        <content>You are a marketing copywriter for {!$Organization.Name}.

Write an 80-100 word marketing description for this experience:
- Name: {!$Input:Experience__c.Name}
- Type: {!$Input:Experience__c.Type__c}
- Location: {!$Input:Experience__c.Location__c}
- Duration: {!$Input:Experience__c.Duration_Hours__c} hours
- Activity Level: {!$Input:Experience__c.Activity_Level__c}
- Capacity: {!$Input:Experience__c.Capacity__c} guests

Write in an engaging, benefit-focused tone. Highlight what makes this
experience unique. Do not use generic filler phrases.</content>
        <inputs>
            <apiName>myExperience</apiName>
            <definition>SOBJECT://Experience__c</definition>
            <referenceName>Input:Experience__c</referenceName>
            <required>true</required>
        </inputs>
        <primaryModel>sfdc_ai__DefaultGPT4Omni</primaryModel>
        <status>Published</status>
        <versionIdentifier>1</versionIdentifier>
    </templateVersions>
    <type>einstein_gpt__fieldCompletion</type>
    <visibility>Global</visibility>
</GenAiPromptTemplate>
```

### <span data-proof="authored" data-by="ai:claude">Example 2: Flex Template with Apex Grounding (XML + Apex)</span>

<span data-proof="authored" data-by="ai:claude">Summarize and classify cases with structured JSON output.</span>

**<span data-proof="authored" data-by="ai:claude">Template XML:</span>**

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTg5OSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPromptTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <createdInVersion>63.0</createdInVersion>
    <developerName>Summarize_Classify_Case</developerName>
    <masterLabel>Summarize and Classify Case</masterLabel>
    <relatedEntity>Case</relatedEntity>
    <templateVersions>
        <content>Analyze the following case and return a JSON response.

Case Details:
- Subject: {!$Input:Case.Subject}
- Description: {!$Input:Case.Description}
- Priority: {!$Input:Case.Priority}

Related Comments:
{!$RelatedList:Case.CaseComments.Records}

Additional Context:
{!$Flow:AnalyzeCaseContext.analysisResult}

Return ONLY valid JSON with these exact keys:
{
  "caseType": "one of: Mechanical, Electrical, Electronic, Structural, Other",
  "reason": "one of: Installation, Equipment Complexity, Equipment Design, Performance, Breakdown, Safety",
  "summary": "2-3 sentence summary of the case"
}</content>
        <inputs>
            <apiName>myCase</apiName>
            <definition>SOBJECT://Case</definition>
            <referenceName>Input:Case</referenceName>
            <required>true</required>
        </inputs>
        <primaryModel>sfdc_ai__DefaultGPT4Omni</primaryModel>
        <status>Published</status>
        <templateDataProviders>
            <definition>flow://AnalyzeCaseContext</definition>
            <parameters>
                <definition>SOBJECT://Case</definition>
                <isRequired>true</isRequired>
                <parameterName>myCase</parameterName>
                <valueExpression>{!$Input:Case}</valueExpression>
            </parameters>
            <referenceName>Flow:AnalyzeCaseContext</referenceName>
        </templateDataProviders>
        <versionIdentifier>1</versionIdentifier>
    </templateVersions>
    <type>FlexTemplate</type>
    <visibility>Global</visibility>
</GenAiPromptTemplate>
```

### <span data-proof="authored" data-by="ai:claude">Example 3: Sales Email Template (XML)</span>

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTgyMCwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPromptTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <createdInVersion>63.0</createdInVersion>
    <developerName>Welcome_Email_Upcoming_Trip</developerName>
    <masterLabel>Welcome Email for Upcoming Trip</masterLabel>
    <relatedEntity>Contact</relatedEntity>
    <templateVersions>
        <content>Craft a warm, personalized welcome email for an upcoming resort visit.

Sender: {!$Input:Sender.Name} from {!$Organization.Name}
Guest: {!$Input:Contact.Name}
Check-in Date: {!$Input:Contact.Next_Check_In_Date__c}

Recommended experiences based on guest interests:
{!$Flow:GetGuestExperiences.experienceList}

Tone: Warm, professional, excited. Keep under 200 words.
Include a personal touch based on their interests.
End with contact information for concierge services.</content>
        <inputs>
            <apiName>recipient</apiName>
            <definition>SOBJECT://Contact</definition>
            <referenceName>Input:Contact</referenceName>
            <required>true</required>
        </inputs>
        <primaryModel>sfdc_ai__DefaultGPT4Omni</primaryModel>
        <status>Published</status>
        <templateDataProviders>
            <definition>flow://GetGuestExperiences</definition>
            <parameters>
                <definition>SOBJECT://Contact</definition>
                <isRequired>true</isRequired>
                <parameterName>recipient</parameterName>
                <valueExpression>{!$Input:Contact}</valueExpression>
            </parameters>
            <referenceName>Flow:GetGuestExperiences</referenceName>
        </templateDataProviders>
        <versionIdentifier>1</versionIdentifier>
    </templateVersions>
    <type>einstein_gpt__salesEmail</type>
    <visibility>Global</visibility>
</GenAiPromptTemplate>
```

### <span data-proof="authored" data-by="ai:claude">Example 4: Full Apex + LWC Integration</span>

**<span data-proof="authored" data-by="ai:claude">Apex Controller for any template:</span>**

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTI1MSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
public with sharing class PromptTemplateInvoker {

    @AuraEnabled
    public static String invoke(String templateApiName, String recordId, String objectType) {
        Map<String, String> record = new Map<String, String>();
        record.put('id', recordId);

        ConnectApi.WrappedValue wrappedValue = new ConnectApi.WrappedValue();
        wrappedValue.value = record;

        Map<String, ConnectApi.WrappedValue> inputParams =
            new Map<String, ConnectApi.WrappedValue>();
        inputParams.put('Input:' + objectType, wrappedValue);

        ConnectApi.EinsteinPromptTemplateGenerationsInput templateInput =
            new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        templateInput.additionalConfig =
            new ConnectApi.EinsteinLlmAdditionalConfigInput();
        templateInput.additionalConfig.applicationName = 'PromptBuilderPreview';
        templateInput.isPreview = false;
        templateInput.inputParams = inputParams;

        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
                templateApiName,
                templateInput
            );

        return result.generations[0].text;
    }
}
```

***

