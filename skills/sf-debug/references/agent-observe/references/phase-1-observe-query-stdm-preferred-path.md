# Phase 1: Observe — query STDM (preferred path)

Read with `agentforce-observe/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Phase 1: Observe — query STDM (preferred path)</span>
### <span data-proof="authored" data-by="ai:claude">1.1 Find sessions</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`findSessions()`</span> <span data-proof="authored" data-by="ai:claude">(in the helper Apex class). Parse</span> <span data-proof="authored" data-by="ai:claude">`DEBUG|STDM_RESULT:`</span> <span data-proof="authored" data-by="ai:claude">from the Apex debug log. Returns session IDs and basic metadata.</span>

<span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`findSessions()`</span> <span data-proof="authored" data-by="ai:claude">returns empty, the agent has no production traffic in the window. Switch to Phase 1-ALT (the fallback is also useful when there is no live traffic to observe).</span>

### <span data-proof="authored" data-by="ai:claude">1.2 Get conversation details</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`getMultipleConversationDetails()`</span> <span data-proof="authored" data-by="ai:claude">for up to 5 sessions, most recent first. Returns turn-by-turn data with messages, steps, topics, and action results.</span>

### <span data-proof="authored" data-by="ai:claude">1.2b LLM prompt + response (for LOW adherence cases)</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`getLlmStepDetails()`</span> <span data-proof="authored" data-by="ai:claude">to get the actual LLM prompt and response when grounding is low.</span>

### <span data-proof="authored" data-by="ai:claude">1.2c Aggregated metrics (start here for a health dashboard)</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`getAggregatedMetrics()`</span> <span data-proof="authored" data-by="ai:claude">for: session rates, top intents, quality distribution, RAG averages.</span>

### <span data-proof="authored" data-by="ai:claude">1.2d Moment insights (per-session)</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`getMomentInsights()`</span> <span data-proof="authored" data-by="ai:claude">for: intent summaries, quality scores (1-5), retriever metrics.</span>

### <span data-proof="authored" data-by="ai:claude">1.2e Targeted observability queries (RAG)</span>

<span data-proof="authored" data-by="ai:claude">Use</span> <span data-proof="authored" data-by="ai:claude">`runObservabilityQuery()`</span> <span data-proof="authored" data-by="ai:claude">for</span> <span data-proof="authored" data-by="ai:claude">`KnowledgeGap`,</span> <span data-proof="authored" data-by="ai:claude">`Hallucination`,</span> <span data-proof="authored" data-by="ai:claude">`RetrievalQuality`,</span> <span data-proof="authored" data-by="ai:claude">`AnswerRelevancy`, or</span> <span data-proof="authored" data-by="ai:claude">`Leaderboard`.</span>

### <span data-proof="authored" data-by="ai:claude">1.3 Reconstruct and classify</span>

<span data-proof="authored" data-by="ai:claude">Render a turn-by-turn timeline from</span> <span data-proof="authored" data-by="ai:claude">`ConversationData`</span> <span data-proof="authored" data-by="ai:claude">JSON. Then classify each session against the issue patterns:</span>

* <span data-proof="authored" data-by="ai:claude">Action errors</span>

* <span data-proof="authored" data-by="ai:claude">Subagent misroutes</span>

* <span data-proof="authored" data-by="ai:claude">Missing actions / wrong inputs</span>

* <span data-proof="authored" data-by="ai:claude">Variable capture failures</span>

* <span data-proof="authored" data-by="ai:claude">No transitions (dead-hub anti-pattern)</span>

* <span data-proof="authored" data-by="ai:claude">LOW adherence</span>

* <span data-proof="authored" data-by="ai:claude">Abandoned sessions</span>

* <span data-proof="authored" data-by="ai:claude">Publish drift (live behavior diverges from current</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">source)</span>

* <span data-proof="authored" data-by="ai:claude">Entry agent answering directly (SMALL_TALK pattern)</span>

* <span data-proof="authored" data-by="ai:claude">Safety regressions</span>

<span data-proof="authored" data-by="ai:claude">Priority:</span>

* **<span data-proof="authored" data-by="ai:claude">P1</span>** <span data-proof="authored" data-by="ai:claude">— action errors, misroutes, LOW adherence</span>

* **<span data-proof="authored" data-by="ai:claude">P2</span>** <span data-proof="authored" data-by="ai:claude">— missing actions, variable bugs, knowledge gaps</span>

* **<span data-proof="authored" data-by="ai:claude">P3</span>** <span data-proof="authored" data-by="ai:claude">— performance, abandoned sessions</span>

### <span data-proof="authored" data-by="ai:claude">1.4 Cross-reference against the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file</span>

<span data-proof="authored" data-by="ai:claude">After classifying, retrieve the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file (Phase 0) and run automated checks:</span>

* <span data-proof="authored" data-by="ai:claude">Subagent count vs. action blocks count</span>

* <span data-proof="authored" data-by="ai:claude">Dead-hub detection (subagent defined, never reached)</span>

* <span data-proof="authored" data-by="ai:claude">Orphan actions (Level 1 listed, never invoked at Level 2)</span>

* <span data-proof="authored" data-by="ai:claude">Cross-subagent variable dependencies (writes vs reads)</span>

<span data-proof="authored" data-by="ai:claude">Cross-reference STDM symptoms against</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">structure to identify root causes vs surface symptoms.</span>

### <span data-proof="authored" data-by="ai:claude">1.5 Present findings</span>

<span data-proof="authored" data-by="ai:claude">Show: sessions analyzed, issues grouped by root-cause category, and an estimated uplift if fixed. Then automatically proceed to Phase 2 unless the user wants to stop.</span>

***

