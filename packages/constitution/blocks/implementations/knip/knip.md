---
id: knip
summary: Finds unused files, dependencies and exports.
requires: [js-runtime, task-runner]
languages: [typescript]
governs: ["knip.jsonc"]
---

# knip

> Finds what nothing uses.

knip reads `knip.jsonc`, into which `constitution` writes the settings of every block, and the project's own ignores beside them. knip's plugins add the configuration files, so an export offered through an entry is never reported, while an unused file, dependency, export, type or enum member is.
