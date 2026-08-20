# Mode: `--type page` — single FlexiPage

Read with `lightning-page-generate/SKILL.md`. Procedure lives here.

## Mode: `--type page` — single FlexiPage
### Step 0: Research (Principle 7)

- Task `sf-learnings-researcher("flexipage" + object_name)` — has someone built similar pages?
- Task `sf-repo-research-analyst(object_name)` — what flexipages already exist? Update existing rather than duplicate.

### Step 1: Bootstrap with the CLI (mandatory)

**Never hand-write FlexiPage XML.** Always start from the CLI template — it produces the right region IDs, component IDs, and metadata that prevents subtle deploy failures.

```bash
sf template generate flexipage \
  --name <PageName> \
  --template <RecordPage|AppPage|HomePage> \
  --sobject <SObject> \
  --primary-field <Field1> \
  --secondary-fields <Field2,Field3> \
  --detail-fields <Field4,Field5,Field6,Field7> \
  --output-dir force-app/main/default/flexipages
```

If the CLI template command fails:

1. Install the templates plugin: `sf plugins install templates`
2. Re-run.

If it still fails, **stop**. Do not fall back to hand-authored XML.

### Step 2: Add components

Edit the generated XML to add components inside `<flexiPageRegions>`. Each component has:

- `<itemType>` — usually `Component` for standard / custom LWCs, `Field` for field components
- `<componentName>` — the LWC API name (e.g., `c:myCustomComponent` for custom, `flexipage_recordHeader` for standard)
- `<componentInstanceProperties>` — props passed to the component
- `<componentVisibility>` — visibility filters (record type, field value, user permission)

### Step 3: Validate

```bash
sf code-analyzer run --target force-app/main/default/flexipages/<PageName>.flexipage-meta.xml --json
```

Dispatch `metadata-consistency-checker` — verifies referenced components exist, fields exist on the SObject, etc.

### Output

```
Generated:
- force-app/main/default/flexipages/<PageName>.flexipage-meta.xml

Template:    {RecordPage|AppPage|HomePage}
SObject:     <name>
Components:  {count}
Visibility filters: {count}

Analyzer:    {sev0=0, sev1=0, sev2=0}
Review:      metadata-consistency-checker — {findings count}
```

---

