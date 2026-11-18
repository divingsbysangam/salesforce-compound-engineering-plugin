# Different-model pass

Read this only when the user asked for a second model, or comprehensive depth is running an independent pass. Do not start one because a config file names a model.

Request one model. Do not inherit the session model or its effort.

| Route | Request | Effort |
|---|---|---|
| Claude | Claude Opus 5.5 | high |
| Codex | GPT-6 Sol | extra-high |
| Grok | Grok 4.7 | extra-high |

Name the peer by that requested model in the summary. Do not write "unknown model". When the route cannot show which model actually served, write `requested <model>; serving model unverified on this route`.

The peer's prompt is the review brief: the file list, the depth, and the question. That includes an OpenCode peer. An invocation that does not include the brief did not review. Do not treat it as a finished pass.

A local lens that covers the same question after the peer does not run is a completed review. The summary says `different-model pass not run: <reason>; local lenses covered the diff`. Do not write `Code review skipped` for that case. `Code review skipped` means `sf-review` itself did not run.

When the Codex route does not offer GPT-6 Sol on the signed-in account, fall back once to the next listed Codex model before any prompt is sent. When it refuses the extra-high effort, retry once at the account's default effort and write `effort unverified` in the summary. A model or effort the user named runs exactly or the pass is skipped with the reason.
