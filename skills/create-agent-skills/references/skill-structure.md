# <span data-proof="authored" data-by="ai:claude">Skill Structure</span>

<span data-proof="authored" data-by="ai:claude">Read with</span> <span data-proof="authored" data-by="ai:claude">`create-agent-skills/SKILL.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Skill Structure</span>

<span data-proof="authored" data-by="ai:claude">Skills live in</span> <span data-proof="authored" data-by="ai:claude">`skills/{skill-name}/`</span> <span data-proof="authored" data-by="ai:claude">with a</span> <span data-proof="authored" data-by="ai:claude">`SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">file carrying</span> <span data-proof="authored" data-by="ai:claude">`name`,</span> <span data-proof="authored" data-by="ai:claude">`description`, and (optionally)</span> <span data-proof="authored" data-by="ai:claude">`argument-hint`</span> <span data-proof="authored" data-by="ai:claude">frontmatter. The</span> <span data-proof="authored" data-by="ai:claude">`description`</span> <span data-proof="authored" data-by="ai:claude">field powers auto-routing — enumerate Salesforce-flavored trigger phrases there, not in the body.</span>

```markdown proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzI4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
---
name: {skill-name}
description: "{What this does + trigger phrases users would say}"
argument-hint: "[optional argument hint]"
---

# {Skill Name}

{Description of what knowledge this skill provides, or what workflow it runs}

## {Section 1}
{Content — patterns, reference, examples, or steps}

## {Section 2}
{More content}
```

<span data-proof="authored" data-by="ai:claude">A skill that dispatches personas should carry a</span> **<span data-proof="authored" data-by="ai:claude">"Persona dispatch"</span>** <span data-proof="authored" data-by="ai:claude">note after its H1 — a one-line pointer to the</span> <span data-proof="authored" data-by="ai:claude">`dispatching-parallel-personas`</span> <span data-proof="authored" data-by="ai:claude">skill for the shared mechanics (isolated subagents, same-response parallelism, same-file-conflict check) plus this skill's own pointer to where its personas live (see any workflow skill for the wording) — and a dispatch list naming the personas it runs.</span>

### <span data-proof="authored" data-by="ai:claude">Skill Design Principles</span>

1. **<span data-proof="authored" data-by="ai:claude">Reference, not instructions</span>**<span data-proof="authored" data-by="ai:claude">: domain skills provide knowledge; workflow skills + personas use it.</span>
2. **<span data-proof="authored" data-by="ai:claude">Scoped</span>**<span data-proof="authored" data-by="ai:claude">: each skill has a clear scope (APEX_ONLY, UNIVERSAL, etc.) stated in prose.</span>
3. **<span data-proof="authored" data-by="ai:claude">Searchable</span>**<span data-proof="authored" data-by="ai:claude">: clear headings and code examples.</span>
4. **<span data-proof="authored" data-by="ai:claude">Concise</span>**<span data-proof="authored" data-by="ai:claude">: include only what's needed for decision-making.</span>
5. **<span data-proof="authored" data-by="ai:claude">Substance over sycophancy</span>**<span data-proof="authored" data-by="ai:claude">: agent-facing skill and persona prose should avoid gratitude-performance language ("You're absolutely right!", "Thanks for catching that!") in favor of verified substance — this keeps the pattern from creeping into future skills.</span>

### <span data-proof="authored" data-by="ai:claude">Generate and deploy-shaped skills</span>

<span data-proof="authored" data-by="ai:claude">Skills that</span> **<span data-proof="authored" data-by="ai:claude">write metadata or run org-mutating CLI</span>** <span data-proof="authored" data-by="ai:claude">(anything</span> <span data-proof="authored" data-by="ai:claude">`*-generate`,</span> <span data-proof="authored" data-by="ai:claude">`*-refactor`,</span> <span data-proof="authored" data-by="ai:claude">`*-uplift`,</span> <span data-proof="authored" data-by="ai:claude">`sf-cli`, Agentforce develop/test/observe,</span> <span data-proof="authored" data-by="ai:claude">`sf-setup`) additionally carry:</span>

1. **<span data-proof="authored" data-by="ai:claude">Ownership in</span>** **<span data-proof="authored" data-by="ai:claude">`description`.</span>** <span data-proof="authored" data-by="ai:claude">After trigger phrases, add</span> <span data-proof="authored" data-by="ai:claude">`Do NOT trigger for …`</span> <span data-proof="authored" data-by="ai:claude">naming the sibling skill that owns the adjacent job. Routing collisions are a description bug.</span>
2. **<span data-proof="authored" data-by="ai:claude">A Cross-skill integration table</span>** <span data-proof="authored" data-by="ai:claude">in</span> <span data-proof="authored" data-by="ai:claude">`SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">with columns Need / Delegate to / Reason. The next verb belongs to a named skill, not improvisation.</span>
3. **<span data-proof="authored" data-by="ai:claude">Fail-closed validation</span>** <span data-proof="authored" data-by="ai:claude">in the validate/report reference (not only in copy-paste text). Each named check lists preferred command, fallback, and report line. Skipped, timed-out, empty, or missing tools become</span> <span data-proof="authored" data-by="ai:claude">`<check>=unavailable: <reason>`. Empty success output is not a pass.</span>

<span data-proof="authored" data-by="ai:claude">Domain/reference skills (`apex-patterns`,</span> <span data-proof="authored" data-by="ai:claude">`governor-limits`, and similar) skip this trio. Do not bolt deploy gates onto a lookup skill.</span>

***