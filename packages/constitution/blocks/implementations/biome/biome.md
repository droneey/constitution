---
id: biome
summary: Formats and lints code, styles, JSON and YAML, with our GritQL rules.
requires: [task-runner]
languages: [typescript, css, json, yaml]
governs: ["biome.jsonc", "**/*.grit"]
---

# Biome

> Biome formats and lints, by its settings in `biome.jsonc`, with rules of our own in GritQL.

`constitution` writes the settings of every block into `biome.jsonc`; a rule they cannot hold is reported, and needs another tool, a review or an override.
