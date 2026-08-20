# Inspiration

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Inspiration</span>
<span data-proof="authored" data-by="ai:claude">This skill consolidates six upstream skills from</span> <span data-proof="authored" data-by="ai:claude">`forcedotcom/afv-library`</span> <span data-proof="authored" data-by="ai:claude">(Apache-2.0):</span>

* [<span data-proof="authored" data-by="ai:claude">`generating-custom-object`</span>](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-custom-object)

* [<span data-proof="authored" data-by="ai:claude">`generating-custom-field`</span>](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-custom-field)

* [<span data-proof="authored" data-by="ai:claude">`generating-custom-application`</span>](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-custom-application)

* [<span data-proof="authored" data-by="ai:claude">`generating-custom-tab`</span>](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-custom-tab)

* [<span data-proof="authored" data-by="ai:claude">`generating-list-view`</span>](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-list-view)

* [<span data-proof="authored" data-by="ai:claude">`generating-custom-lightning-type`</span>](https://github.com/forcedotcom/afv-library/tree/main/skills/generating-custom-lightning-type)

<span data-proof="authored" data-by="ai:claude">The upstream split is one-skill-per-metadata-type — useful for narrow, surgical work, but high friction when a feature needs multiple metadata types together (which is most features). This plugin's adaptation collapses the six into one</span> <span data-proof="authored" data-by="ai:claude">`--type`-dispatched skill, citing each upstream for the deep tables (Roll-up Summary edge cases, CLT metaschema validation rules, action override patterns). When upstream is a better reference for a specific edge case, link out from this skill rather than vendoring.</span>