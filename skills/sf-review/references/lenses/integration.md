---
name: integration
description: "Runs on callouts, Apex REST, Platform Events/CDC, credentials, connected/external client apps, and Hosted MCP config."
---

# Integration lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `**/classes/*.cls` using `HttpRequest|@RestResource|EventBus`, `*.{namedCredential,externalCredential,remoteSite,connectedApp}-meta.xml`, `*.eca*-meta.xml`, `objects/*__e/**`, MCP config

## Tools first
- `sf code-analyzer run --rule-selector pmd:Security`
- Hardcoded endpoint: `setEndpoint\(\s*'https?://`
- Secrets: `(?i)(authorization|bearer|api_?key|secret|password)\s*['":=]` in `.cls` and `<password>` in credential metadata
- Callout after DML: `(insert|update|upsert|delete)\s` before `\.send\(` in one path

## Checklist
- **INT-1** Hardcoded endpoint, token, or password (Apex, legacy NC `<password>`, `http://`) instead of Named + External Credential — default severity CRITICAL.
- **INT-2** Auth headers, tokens, or unmasked bodies written to `System.debug`, logs, or error records — default severity CRITICAL.
- **INT-3** Callout after uncommitted DML in one transaction — default severity HIGH.
- **INT-4** Sync callout in a trigger, callout in a loop, or can exceed 100 callouts per transaction — default severity HIGH.
- **INT-5** Async callout class missing `Database.AllowsCallouts` or `@future(callout=true)` — default severity HIGH.
- **INT-6** Body parsed without status check; `CalloutException` uncaught — default severity HIGH.
- **INT-7** Breaking contract change: renamed `urlMapping`, removed/renamed request or response field, changed `global`/`@AuraEnabled` signature, renamed field/picklist API names callers use; no versioned path (`/v1/`) — default severity HIGH.
- **INT-8** Wrong PE `publishBehavior`: `PublishImmediately` when subscribers need committed data, `PublishAfterCommit` when the event must survive rollback — default severity HIGH.
- **INT-9** Subscriber not idempotent, swallows failures, or lacks `setResumeCheckpoint`/bounded `EventBus.RetryableException` — default severity HIGH.
- **INT-10** Hosted MCP: Apex exposed as a tool is not `global`; prompt template not `einstein_gpt__global` (e.g. `FlexTemplate`); Flow tool uses `templateDataProviders` — default severity HIGH.
- **INT-11** MCP auth via Connected App instead of External Client App; scopes lack `mcp_api`+`refresh_token` or keep beta scopes; PKCE off; one ECA shared across clients; `mcp-remote` bridge — default severity HIGH.
- **INT-12** Test path with no `HttpCalloutMock` or only happy-path mocks (no 4xx/5xx/timeout) — default severity MEDIUM.
- **INT-13** No `setTimeout`, relying on the 10s default; total wait may pass the 120s per-transaction max — default severity MEDIUM.
- **INT-14** Retry with no cap/backoff, retried non-idempotent POSTs, or final failures dropped unrecorded — default severity MEDIUM.
- **INT-15** Apex REST returns 200 on error (no `RestContext.response.statusCode`), returns `e.getMessage()`/stack traces, or has unpaginated lists — default severity MEDIUM.
- **INT-16** `EventBus.publish` SaveResults ignored, or publish called per record in a loop — default severity MEDIUM.
- **INT-17** External PE/CDC subscriber drops replay ID or assumes replay past 72h retention — default severity MEDIUM.
- **INT-18** Connected/External Client App: `Full`/over-broad scopes, "all users may self-authorize", or no refresh-token expiry — default severity MEDIUM.
