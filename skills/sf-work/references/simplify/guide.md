# /sf-work mode:simplify

> **Principles enforced:** especially 5 (taste over typing — simpler, more native code is the higher bar) and 1 (preserve the quality ceiling — behavior must not regress). See `PRINCIPLES.md`.

You are a Salesforce engineer expert at simplifying Apex, LWC, and automation while **preserving exact behavior** — same outputs, same DML/side effects and ordering, same governor profile, same sharing outcomes. You prioritize readable, native-first code over clever or compact code. Fewer lines is not the goal; faster comprehension and less custom surface area are.

This is a quality pass, not a bug hunt. For correctness, governor, security, and sharing review, use `/sf-review`.

## Step 1: Identify scope

Resolve the simplification scope in this order:

1. **User-named scope** (a class, an LWC bundle, a trigger, "the handler I just wrote") — authoritative. Do not widen it.
2. **In a git repo, no scope given** — default to the branch diff against its base (`git diff origin/main...`, or the configured upstream). Falls back to staged + unstaged (`git diff HEAD`) if there's no base ref. This is the "clean up everything on this feature branch before the PR" case.
3. **No diff available** — the most recently modified files mentioned by the user or edited earlier in this conversation.

If none produces a non-empty scope, stop and ask what to simplify rather than guessing.

## Step 2: Dispatch three SF reviewers in parallel

Spawn these existing agents in a single message via the platform's subagent primitive (`Task`/`Agent` in Claude Code, `spawn_agent` in Codex). Pass each the full diff / resolved file set. **Permission mode:** omit the `mode` parameter so the user's settings apply.

- **`architecture lens`** — YAGNI, over-engineering, and **platform-native alternatives**: custom Apex where a Flow/formula/standard component would do, premature frameworks (fflib, hand-rolled Selector/UoW layers, custom permission engines) with one caller, abstract types with one implementation, dead code, unnecessary null checks the platform guarantees.
- **`apex lens`** — efficiency that is *also* a simplification: redundant SOQL/DML that collapses into one query, verbose field-by-field loops that a relationship query or `SObject.clone()` replaces, repeated work that hoists out of a loop. (Flag only where the simpler form is also clearer; leave deeper performance work to `/sf-review`.)

## Step 3: Apply behavior-preserving fixes

Aggregate findings and fix each directly. Skip false positives without arguing them. Before applying each fix, confirm it preserves behavior — and for Salesforce that specifically means:

- **Bulk safety unchanged** — a simplification must not move SOQL/DML into a loop or change collection handling for 200+ records.
- **Governor profile unchanged or better** — never trade a query reduction for more CPU/heap in a way that changes limit behavior.
- **Sharing/CRUD/FLS unchanged** — do not drop `with sharing`, `WITH USER_MODE`, `Security.stripInaccessible`, or `WITH SECURITY_ENFORCED` in the name of brevity. If "simplifying" would remove an enforcement, that is a correctness change — skip it and flag for `/sf-review`.
- **Trigger order of execution unchanged** — folding handlers must not reorder before/after logic or recursion control.

Do not remove an abstraction that exists for testability or that you cannot confirm is obsolete — check `git blame` for original intent. If a change would be longer or harder to follow, don't make it.

## Step 4: Verify behavior is preserved

The premise is that simplification preserves exact functionality. After fixes:

1. **Static analysis** — run Salesforce Code Analyzer over the changed files (`run_code_analyzer` via the salesforce-dx MCP, or `sf code-analyzer run`). No new violations.
2. **Apex tests** — run tests covering the changed classes, scoped to blast radius:
   ```bash
   sf apex run test --tests <AffectedTestClasses> --code-coverage --synchronous
   ```
   Broaden to `--test-level RunLocalTests` when a heavily-referenced class or shared utility was touched. Coverage must not drop.
3. **LWC** — if an LWC bundle changed, run its Jest tests (`npm run test:unit -- <component>`).

If a test fails, the simplification changed behavior — revert that specific fix.

## Output

Summarize: files touched, simplifications applied (with one-line rationale each), platform-native swaps made, findings skipped (and why), and the verification result (analyzer + tests). Note any finding deferred to `/sf-review` because it crossed from "simplify" into "behavior change".
