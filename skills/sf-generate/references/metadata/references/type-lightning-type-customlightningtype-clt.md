# Type: `lightning-type` — CustomLightningType (CLT)

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Type:</span> <span data-proof="authored" data-by="ai:claude">`lightning-type`</span> <span data-proof="authored" data-by="ai:claude">— CustomLightningType (CLT)</span>
<span data-proof="authored" data-by="ai:claude">CLTs are JSON-Schema-based type definitions for Einstein Agent actions and structured I/O.</span>

### <span data-proof="authored" data-by="ai:claude">Critical rules (Principle 1 — non-negotiable)</span>

**<span data-proof="authored" data-by="ai:claude">Root object schemas MUST include:</span>**

* <span data-proof="authored" data-by="ai:claude">`"type": "object"`</span>

* <span data-proof="authored" data-by="ai:claude">`"title"`</span> <span data-proof="authored" data-by="ai:claude">(the human-readable title)</span>

* <span data-proof="authored" data-by="ai:claude">`"lightning:type": "lightning__objectType"`</span>

* <span data-proof="authored" data-by="ai:claude">`"unevaluatedProperties": false`</span>

**<span data-proof="authored" data-by="ai:claude">Root object schemas MUST NOT include:</span>**

* <span data-proof="authored" data-by="ai:claude">`"examples"`</span> <span data-proof="authored" data-by="ai:claude">when</span> <span data-proof="authored" data-by="ai:claude">`"unevaluatedProperties": false`</span> <span data-proof="authored" data-by="ai:claude">is set (they conflict)</span>

**<span data-proof="authored" data-by="ai:claude">Nested objects (inside</span>** **<span data-proof="authored" data-by="ai:claude">`properties`) MUST NOT set:</span>**

* <span data-proof="authored" data-by="ai:claude">`"lightning:type": "lightning__objectType"`</span> <span data-proof="authored" data-by="ai:claude">(it's only allowed at the root)</span>

### <span data-proof="authored" data-by="ai:claude">Reference vs inline</span>

<span data-proof="authored" data-by="ai:claude">For nested objects:</span>

* **<span data-proof="authored" data-by="ai:claude">Referenced CLT</span>** <span data-proof="authored" data-by="ai:claude">(reusable / separately deployed):</span> <span data-proof="authored" data-by="ai:claude">`"lightning:type": "c__<CLTName>"`</span> <span data-proof="authored" data-by="ai:claude">— note this is the FQN, not the JSON-Schema title.</span>

* **<span data-proof="authored" data-by="ai:claude">Standard Lightning types</span>** <span data-proof="authored" data-by="ai:claude">when the structure is simple (primitives only).</span>

* **<span data-proof="authored" data-by="ai:claude">Apex class types</span>** <span data-proof="authored" data-by="ai:claude">(`@apexClassType/...`) when the structure already lives server-side.</span>

### <span data-proof="authored" data-by="ai:claude">Lists / arrays — heavily restricted</span>

<span data-proof="authored" data-by="ai:claude">The CLT metaschema rejects the</span> <span data-proof="authored" data-by="ai:claude">`items`</span> <span data-proof="authored" data-by="ai:claude">keyword by default. Treat</span> <span data-proof="authored" data-by="ai:claude">`items`</span> <span data-proof="authored" data-by="ai:claude">as</span> **<span data-proof="authored" data-by="ai:claude">disallowed</span>**<span data-proof="authored" data-by="ai:claude">.</span>

* **<span data-proof="authored" data-by="ai:claude">Root-level arrays</span>**<span data-proof="authored" data-by="ai:claude">: include</span> <span data-proof="authored" data-by="ai:claude">`"lightning:type": "lightning__listType"`, MUST NOT include</span> <span data-proof="authored" data-by="ai:claude">`"items"`. Optional</span> <span data-proof="authored" data-by="ai:claude">`"type": "array"`.</span>

* **<span data-proof="authored" data-by="ai:claude">Nested arrays</span>**<span data-proof="authored" data-by="ai:claude">: include</span> <span data-proof="authored" data-by="ai:claude">`"type": "array"`, MUST NOT include</span> <span data-proof="authored" data-by="ai:claude">`"lightning:type": "lightning__listType"`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`"items"`.</span>

### <span data-proof="authored" data-by="ai:claude">File</span>

```
force-app/main/default/lightningTypes/<TypeApiName>.lightningType-meta.xml
```

***

