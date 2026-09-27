# LWC Integration

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">LWC Integration</span>
### <span data-proof="authored" data-by="ai:claude">Controller + Component Pattern</span>

**<span data-proof="authored" data-by="ai:claude">Apex Controller:</span>**

```apex proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTI2NiwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
public with sharing class SocialMediaPostsController {

    @AuraEnabled
    public static String generateSocialMediaPosts(String experienceSessionId) {
        Map<String, String> session = new Map<String, String>();
        session.put('id', experienceSessionId);
        ConnectApi.WrappedValue sessionValue = new ConnectApi.WrappedValue();
        sessionValue.value = session;
        Map<String, ConnectApi.WrappedValue> inputParams =
            new Map<String, ConnectApi.WrappedValue>();
        inputParams.put('Input:experienceSession', sessionValue);

        ConnectApi.EinsteinPromptTemplateGenerationsInput executeInput =
            new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        executeInput.additionalConfig =
            new ConnectApi.EinsteinLlmAdditionalConfigInput();
        executeInput.additionalConfig.applicationName = 'PromptBuilderPreview';
        executeInput.isPreview = false;
        executeInput.inputParams = inputParams;

        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation output =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
                'Generate_Social_Media_Posts',
                executeInput
            );

        return output.generations[0].text;
    }
}
```

**<span data-proof="authored" data-by="ai:claude">LWC JavaScript:</span>**

```javascript proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTEzMCwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
import { api, LightningElement } from "lwc";
import generatePosts from "@salesforce/apex/SocialMediaPostsController.generateSocialMediaPosts";

export default class GenerateSocialMediaPosts extends LightningElement {
    @api recordId;
    twitterPost;
    linkedinPost;
    slackPost;
    error;
    showSpinner = false;

    get hasResult() {
        return this.twitterPost || this.linkedinPost;
    }

    async handleGenerate() {
        this.showSpinner = true;
        this.error = undefined;
        try {
            const response = await generatePosts({
                experienceSessionId: this.recordId
            });
            const parsed = JSON.parse(response);
            this.twitterPost = parsed.twitter;
            this.linkedinPost = parsed.linkedin;
            this.slackPost = JSON.stringify(parsed.blockkit);
        } catch (err) {
            this.error = err.body?.message || 'An error occurred';
            this.twitterPost = undefined;
            this.linkedinPost = undefined;
            this.slackPost = undefined;
        } finally {
            this.showSpinner = false;
        }
    }
}
```

**<span data-proof="authored" data-by="ai:claude">LWC HTML:</span>**

```html proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTc4MSwiYXR0cnMiOnsiYnkiOiJhaTpjbGF1ZGUifX1d
<template>
    <lightning-card title="Generate Social Media Posts"
                    icon-name="utility:socialshare">
        <div class="slds-var-p-around_small">
            <lightning-button onclick={handleGenerate}
                              label="Generate Posts"
                              variant="brand">
            </lightning-button>

            <template lwc:if={showSpinner}>
                <lightning-spinner alternative-text="Generating..."
                                   size="small">
                </lightning-spinner>
            </template>

            <template lwc:if={error}>
                <div class="slds-var-p-top_small slds-text-color_error">
                    {error}
                </div>
            </template>

            <template lwc:if={hasResult}>
                <div class="slds-var-p-top_small">
                    <lightning-textarea name="twitter" readonly
                                        value={twitterPost}
                                        label="Twitter Post">
                    </lightning-textarea>
                </div>
                <div class="slds-var-p-top_small">
                    <lightning-textarea name="linkedin" readonly
                                        value={linkedinPost}
                                        label="LinkedIn Post">
                    </lightning-textarea>
                </div>
                <div class="slds-var-p-top_small">
                    <lightning-textarea name="slack" readonly
                                        value={slackPost}
                                        label="Slack Post">
                    </lightning-textarea>
                </div>
            </template>
        </div>
    </lightning-card>
</template>
```

**<span data-proof="authored" data-by="ai:claude">LWC Meta XML:</span>**

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTUxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>60.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Generate Social Media Posts</masterLabel>
    <targets>
        <target>lightning__RecordPage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <objects>
                <object>Session__c</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

***

