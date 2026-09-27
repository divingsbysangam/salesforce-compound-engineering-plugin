# REST API Invocation

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">REST API Invocation</span>
### <span data-proof="authored" data-by="ai:claude">Endpoint</span>

```
POST /services/data/v60.0/einstein/prompt-templates/{templateApiName}/generations
```

### <span data-proof="authored" data-by="ai:claude">Request Body</span>

```json proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTY4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
{
    "isPreview": false,
    "inputParams": {
        "Input:Case": {
            "value": {
                "id": "5001x000001a2bCAAQ"
            }
        }
    }
}
```

### <span data-proof="authored" data-by="ai:claude">Response Body</span>

```json proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzE3LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
{
    "prompt": "Resolved prompt text with all merge fields replaced...",
    "generations": [
        {
            "id": "generation-id",
            "text": "The generated LLM response text...",
            "contentQuality": {
                "scanToxicity": { "isDetected": false }
            }
        }
    ]
}
```

### <span data-proof="authored" data-by="ai:claude">cURL Example</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mzk4LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
curl -X POST \
  "https://yourinstance.salesforce.com/services/data/v60.0/einstein/prompt-templates/My_Template_Name/generations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isPreview": false,
    "inputParams": {
        "Input:Case": {
            "value": {
                "id": "5001x000001a2bCAAQ"
            }
        }
    }
  }'
```

***

