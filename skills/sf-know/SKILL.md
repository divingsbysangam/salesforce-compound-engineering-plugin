---
name: sf-know
description: "Salesforce platform knowledge on demand: governor limits, Apex/LWC/Flow patterns, security (CRUD/FLS, sharing), integrations, GraphQL, Hosted MCP, agent-native design. Use when a question needs platform facts."
argument-hint: "[topic:limits|apex|lwc|flow|security|integration|graphql|hosted-mcp|agent-native|org-context] [question]"
---

# /sf-know

Reference skill. Other skills load one topic from here instead of carrying the knowledge themselves.

## Route

Pick the **one** topic that answers the question and read only its guide. Read a second topic only if the first does not answer it.

| Topic | Covers | Guide |
|---|---|---|
| `limits` | Governor limits and how to stay under them | `references/limits/guide.md` |
| `apex` | Selector, service, domain, trigger-handler patterns | `references/apex/guide.md` |
| `lwc` | LWC state, communication, architecture | `references/lwc/guide.md` |
| `flow` | Flow design and best practices | `references/flow/guide.md` |
| `security` | CRUD/FLS, sharing, injection, secure coding | `references/security/guide.md` |
| `integration` | REST, SOAP, Platform Events, callouts, Named Credentials | `references/integration/guide.md` |
| `graphql` | LWC GraphQL wire adapter; GraphQL vs Apex | `references/graphql/guide.md` |
| `hosted-mcp` | Salesforce Hosted MCP servers: setup, ECA, gotchas | `references/hosted-mcp/guide.md` |
| `agent-native` | Designing features agents can use as well as humans | `references/agent-native/guide.md` |
| `org-context` | Getting fields, metadata shapes, SOQL validity, compile errors from the org or tools | `references/org-context/guide.md` |

## Source order

1. These guides, and `docs/solutions/` learnings in the current repo.
2. The live org for anything org-specific (field names, sharing settings, installed packages), using the tools in `references/org-context/guide.md`.
3. Official docs (Context7, then web) for release-specific facts. State the release when it matters.
