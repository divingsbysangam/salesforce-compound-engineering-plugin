# Prompt Templates for MCP

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Prompt Templates for MCP
### Critical Gotchas (From Real-World Testing)

#### 1. Template Type Values — DO NOT Trust Documentation

The `<type>` field must use exact API picklist values. **Documentation says `FlexTemplate` but the API rejects it.**

| UI Label | Correct API Value | Custom Allowed? | MCP Compatible? |
|----------|-------------------|-----------------|-----------------|
| Global | `einstein_gpt__global` | Yes | **Yes — use this for MCP** |
| Flex | `einstein_gpt__flex` | Yes | Yes (but `global` matches standard pattern) |
| Record Summary | `einstein_gpt__recordSummary` | Yes | Copilot sidebar only |
| Field Generation | `einstein_gpt__fieldCompletion` | Yes | No |
| Sales Email | `einstein_gpt__salesEmail` | Yes | No |
| Global Standard | `einstein_gpt__globalStandard` | **No — Salesforce-managed only** | N/A |

**For MCP: use `einstein_gpt__global`**
**For Agentforce: use `einstein_gpt__flex`**

#### 2. Metadata Fields — API 66.0 Changes

- **`activeVersion`** — **REMOVED in API 66.0.** Do not include.
- **`versionIdentifier`** — **Omit.** Let the platform auto-generate.
- **`FlexTemplate`** — **INVALID.** Use `einstein_gpt__flex` or `einstein_gpt__global`.

#### 3. Input Definitions — Undocumented Syntax

| Input Type | Definition Value | Example |
|------------|-----------------|---------|
| **Free text string** | `primitive://String` | Company name, case number, search query |
| **SObject record** | `SOBJECT://Case` | Case record, Account record |

> **`primitive://String`** is not documented. It was discovered by retrieving the standard `einstein_gpt__accountReviewBriefing` template via REST API.

**To discover valid values from standard templates:**
```bash
sf api request rest "/services/data/v66.0/einstein/prompt-templates/<template_developer_name>" --target-org <org> --method GET
```

#### 4. Flow Data Providers DO NOT Work in MCP

> **Real-world error:** "Failed to attach prompt" in Claude Desktop, or `{"code": -32602, "message": "Unknown tool: invalid_tool_name"}` when MCP tries to resolve `flow://` references.

**Never use `templateDataProviders` with `flow://` in MCP templates.** Instead, instruct the AI to call tools in the template content.

If you need both MCP and Agentforce:
- **Agentforce template:** `einstein_gpt__flex` with Flow data provider
- **MCP template:** `einstein_gpt__global` without data providers — instructions tell AI which tools to call

#### 5. Claude Does NOT Enforce Prompt Template Format

> **Real-world issue:** Template specifies a 5-section output format. Claude ignores it and formats its own way.

**Solutions:**
1. **Pre-format output server-side** (recommended) — Apex tool returns formatted text
2. **Embed format in tool description** — less reliable but helps
3. **Include EXAMPLE OUTPUT in template** — single most effective control

#### 6. ChatGPT Does NOT Support MCP Prompts

Only Claude and Cursor support MCP prompt templates. ChatGPT does not.

### Working Template — String Input (API 66.0)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPromptTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <!-- NO activeVersion -->
    <developerName>Case_Resolution_MCP</developerName>
    <masterLabel>Case Resolution Briefing</masterLabel>
    <!-- NO relatedEntity for global templates with string inputs -->
    <templateVersions>
        <content>You are a senior support engineer creating a resolution briefing.

STEP 1: Use the "Search Similar Resolved Cases" tool
- Pass {!$Input:caseNumber} as the caseId parameter
- Review the returned resolution data

STEP 2: Create Resolution Briefing

**Root Cause Analysis**
- Primary root cause identified from similar cases
- Contributing factors

**Recommended Resolution**
- Step-by-step resolution procedure
- Expected resolution time

**Similar Resolved Cases**
- List matching cases with resolution summaries

**Confidence Assessment**
- High/Medium/Low based on match quality

EXAMPLE OUTPUT:
"## Root Cause Analysis
The SSL certificate expired on the integration endpoint...

