# Step 6: Generate backing logic (Apex / Flow / Prompt Template stubs)

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 6: Generate backing logic (Apex / Flow / Prompt Template stubs)</span>
<span data-proof="authored" data-by="ai:claude">For each action marked</span> <span data-proof="authored" data-by="ai:claude">`NEEDS STUB`</span> <span data-proof="authored" data-by="ai:claude">in the spec:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6OTgsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf template generate apex class --name <ClassName> --output-dir <PACKAGE_DIR>/main/default/classes
```

<span data-proof="authored" data-by="ai:claude">Replace the class body with the invocable pattern (`@InvocableMethod`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`@InvocableVariable`</span> <span data-proof="authored" data-by="ai:claude">inputs and outputs). Then deploy:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjMsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf project deploy start --json --metadata ApexClass:<ClassName>
```

<span data-proof="authored" data-by="ai:claude">Fix deploy errors before generating the next stub. One stub at a time, deploy and verify, then move on.</span>

<span data-proof="authored" data-by="ai:claude">For Flow and Prompt Template stubs, follow the same one-at-a-time discipline.</span>

> **⚠️ API Version must match your org.** Before deploying, always verify the org's current API version:
> ```bash
> sf org display --json -o <org> | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'].get('apiVersion','check sfdx-project.json'))"
> ```
> Set **all** `.cls-meta.xml` files to the org's actual API version (e.g. `66.0` for Spring '26, `67.0` for Summer '26). A mismatch causes `Invalid api version` deploy errors.

> **⚠️ Targeted deploy — use Package XML, not `--metadata` with multiple types.** When deploying an agent bundle alongside Apex classes and a permission set, `--metadata ApexClass:<Name>` only works for a single component type. Use a Package XML manifest instead:
> ```xml
> <!-- manifest/package.xml -->
> <Package xmlns="http://soap.sforce.com/2006/04/metadata">
>   <types><members>MyClass</members><name>ApexClass</name></types>
>   <types><members>MyPermSet</members><name>PermissionSet</name></types>
>   <types><members>MyBundle</members><name>AiAuthoringBundle</name></types>
>   <version>66.0</version>
> </Package>
> ```
> Deploy with: `sf project deploy start --json --manifest manifest/package.xml -o <org>`
> This also prevents pre-existing test failures in unrelated components from blocking your deploy.
>
> Note: `--source-file` is NOT a valid flag for `sf project deploy start`. Use `--manifest` or `--metadata`.

***

