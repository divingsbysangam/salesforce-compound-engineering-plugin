# Custom Server Registration

Read with `mcp-tool-builder/SKILL.md`. Procedure lives here.

## Custom Server Registration
### Step 1: Create Custom Server

Setup > Integration > Salesforce MCP Servers > New Custom MCP Server

### Step 2: Add Tools

Select backing type: Apex Action, Flow, AuraEnabled, Apex REST, Named Query, or API Catalog endpoint.

**Tool names and descriptions are critical** — AI clients use them to decide which tool to invoke.

### Step 3: Publish and Activate

Wait up to 2 minutes for propagation.

### ISV Note

Managed packages cannot directly include MCP server configurations. ISVs expose capabilities through annotated Apex classes or Autolaunched Flows for subscribers to configure.

---

