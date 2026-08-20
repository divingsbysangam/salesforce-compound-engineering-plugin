# Rules that always apply

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Rules that always apply</span>
1. **<span data-proof="authored" data-by="ai:claude">`--json`</span>** **<span data-proof="authored" data-by="ai:claude">on every</span>** **<span data-proof="authored" data-by="ai:claude">`sf`</span><span data-proof="authored" data-by="ai:claude">command.</span>**  <span data-proof="authored" data-by="ai:claude">Always. Read the JSON directly; don't pipe through</span> <span data-proof="authored" data-by="ai:claude">`jq`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`2>/dev/null`</span> <span data-proof="authored" data-by="ai:claude">and don't strip the structured output. LLMs parse JSON natively — that's the agent-native default (Principle 6).</span>
2. **<span data-proof="authored" data-by="ai:claude">Verify target org first.</span>** <span data-proof="authored" data-by="ai:claude">Run</span> <span data-proof="authored" data-by="ai:claude">`sf config get target-org --json`. If none is set, ask the user before doing anything else.</span>
3. **<span data-proof="authored" data-by="ai:claude">Diagnose before you fix.</span>** <span data-proof="authored" data-by="ai:claude">When the agent misbehaves,</span> *<span data-proof="authored" data-by="ai:claude">always</span>* <span data-proof="authored" data-by="ai:claude">preview with</span> <span data-proof="authored" data-by="ai:claude">`--use-live-actions --authoring-bundle <Name>`, send a representative utterance, and read the resulting trace file</span> *<span data-proof="authored" data-by="ai:claude">before</span>* <span data-proof="authored" data-by="ai:claude">editing the</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file or backing logic. Modifying without trace evidence is the jagged-intelligence failure mode (Principle 3).</span>
4. **<span data-proof="authored" data-by="ai:claude">Spec approval is a hard gate (Principle 4).</span>** <span data-proof="authored" data-by="ai:claude">Never proceed past the Agent Spec without explicit user approval. The spec IS the contract.</span>

***

