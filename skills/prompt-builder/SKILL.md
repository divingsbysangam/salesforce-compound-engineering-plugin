---
name: prompt-builder
description: Salesforce Prompt Builder reference — template types, metadata XML generation, Apex/LWC/Flow/REST API integration, merge fields, grounding, and deployment
scope: AGENTFORCE_PROMPT_BUILDER
---

# <span data-proof="authored" data-by="ai:claude">Salesforce Prompt Builder Reference</span>

**<span data-proof="authored" data-by="ai:claude">SCOPE: AGENTFORCE_PROMPT_BUILDER</span>** <span data-proof="authored" data-by="ai:claude">- This skill applies to building and integrating Prompt Builder templates.
**Use when:**</span> <span data-proof="authored" data-by="ai:claude">Creating prompt template metadata XML, writing Apex invocation/grounding classes, building LWC integrations, or deploying templates between orgs.</span>

***

<span data-proof="authored" data-by="ai:claude">Prompt Builder creates reusable prompt templates that merge CRM data with LLM calls. Templates are deployable metadata (`GenAiPromptTemplate`) that can be authored as XML, version-controlled, and deployed via</span> <span data-proof="authored" data-by="ai:claude">`sf`</span> <span data-proof="authored" data-by="ai:claude">CLI.</span>

***

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Template Types** — read `references/template-types.md` before acting on this section.
- **Metadata XML Structure** — read `references/metadata-xml-structure.md` before acting on this section.
- **Merge Fields** — read `references/merge-fields.md` before acting on this section.
- **Grounding with Data Providers** — read `references/grounding-with-data-providers.md` before acting on this section.
- **Apex Invocation (Connect API)** — read `references/apex-invocation-connect-api.md` before acting on this section.
- **LWC Integration** — read `references/lwc-integration.md` before acting on this section.
- **REST API Invocation** — read `references/rest-api-invocation.md` before acting on this section.
- **Flow Integration** — read `references/flow-integration.md` before acting on this section.
- **Batch Processing** — read `references/batch-processing.md` before acting on this section.
- **Agent Script Integration** — read `references/agent-script-integration.md` before acting on this section.
- **Complete Examples** — read `references/complete-examples.md` before acting on this section.
- **Deployment Guide** — read `references/deployment-guide.md` before acting on this section.
- **Tips & Gotchas** — read `references/tips-gotchas.md` before acting on this section.
