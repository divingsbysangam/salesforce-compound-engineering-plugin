# Mode B: Testing Center batch testing

Read with `agentforce-test/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Mode B: Testing Center batch testing</span>
### <span data-proof="authored" data-by="ai:claude">Test spec YAML (`AiEvaluationDefinition`)</span>

```yaml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTMxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
name: "OrderService Smoke Tests"
subjectType: AGENT
subjectName: OrderService          # BotDefinition DeveloperName

testCases:
  - utterance: "Where is my order #12345?"
    expectedTopic: order_status
    expectedActions:
      - lookup_order              # Level 2 INVOCATION names, NOT Level 1 definitions
    expectedOutcome: "Agent checks order status and returns the latest known state."

  - utterance: "What's the best recipe for chocolate cake?"
    expectedOutcome: "Agent politely declines and redirects to its scope."
```

<span data-proof="authored" data-by="ai:claude">Key rules:</span>

* <span data-proof="authored" data-by="ai:claude">`expectedActions`</span> <span data-proof="authored" data-by="ai:claude">is a flat string array of</span> **<span data-proof="authored" data-by="ai:claude">Level 2 invocation names</span>** <span data-proof="authored" data-by="ai:claude">(from</span> <span data-proof="authored" data-by="ai:claude">`reasoning: actions:`), not Level 1 definitions (from</span> <span data-proof="authored" data-by="ai:claude">`subagent: actions:`).</span>

* <span data-proof="authored" data-by="ai:claude">Action assertion uses</span> **<span data-proof="authored" data-by="ai:claude">superset matching</span>** <span data-proof="authored" data-by="ai:claude">— the test passes if the actual actions include all expected.</span>

* **<span data-proof="authored" data-by="ai:claude">Always include</span>** **<span data-proof="authored" data-by="ai:claude">`expectedOutcome`</span>** <span data-proof="authored" data-by="ai:claude">— it's the most reliable assertion (LLM-as-judge).</span> <span data-proof="authored" data-by="ai:claude">`expectedTopic`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`expectedActions`</span> <span data-proof="authored" data-by="ai:claude">are brittle to topic-hash drift.</span>

* <span data-proof="authored" data-by="ai:claude">For guardrail tests, omit</span> <span data-proof="authored" data-by="ai:claude">`expectedTopic`. Filter out</span> <span data-proof="authored" data-by="ai:claude">`topic_assertion: FAILURE`</span> <span data-proof="authored" data-by="ai:claude">for these (false negatives from empty assertion XML).</span>

### <span data-proof="authored" data-by="ai:claude">Deploy and run</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mzc5LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent test create --json --spec /tmp/spec.yaml --api-name MySuite -o <org>
sf agent test run --json --api-name MySuite --wait 10 --result-format json -o <org> | tee /tmp/run.json

JOB_ID=$(python3 -c "import json; print(json.load(open('/tmp/run.json'))['result']['runId'])")
sf agent test results --json --job-id "$JOB_ID" --result-format json -o <org> | tee /tmp/results.json
```

<span data-proof="authored" data-by="ai:claude">Always use</span> <span data-proof="authored" data-by="ai:claude">`--job-id`, NOT</span> <span data-proof="authored" data-by="ai:claude">`--use-most-recent`. The latter is racy under parallel CI runs.</span>

### <span data-proof="authored" data-by="ai:claude">Parse and present</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NDcwLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
python3 -c "
import json
data = json.load(open('/tmp/results.json'))
for tc in data['result']['testCases']:
    utterance = tc['inputs']['utterance'][:50]
    results = {r['name']: r['result'] for r in tc.get('testResults', [])}
    topic = results.get('topic_assertion', 'N/A')
    action = results.get('action_assertion', 'N/A')
    outcome = results.get('output_validation', 'N/A')
    print(f'{utterance:<50} topic={topic:<6} action={action:<6} outcome={outcome}')
"
```

### <span data-proof="authored" data-by="ai:claude">Topic name resolution and hash drift</span>

<span data-proof="authored" data-by="ai:claude">Topic names in Testing Center can drift after each</span> <span data-proof="authored" data-by="ai:claude">`sf agent publish`</span> <span data-proof="authored" data-by="ai:claude">because the runtime appends a hash suffix to the topic name. Re-run name discovery after each publish, then re-deploy the spec with</span> <span data-proof="authored" data-by="ai:claude">`--force-overwrite`.</span>

***

