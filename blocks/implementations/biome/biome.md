---
id: biome
summary: Formats and lints TypeScript and CSS, with GritQL rules of our own.
requires: [typescript]
extends: null
abstract: false
checks: [format, lint, names]
languages: [typescript, css]
roles: []
dictionary: [Biome, biome.json, biome-ignore, GritQL, .grit]
governs: ["biome.json", "**/*.grit"]
---

# Biome

> Formats and lints. `biome.json` extends the parts of the constitution's release archive: those of `presets/common/biome/`, which read any language, and those of the scope of each active language it covers, `presets/typescript/biome/` and `presets/css/biome/`. On each axis a scope holds Biome's own settings, `self.jsonc`; core's, `core.jsonc`; the language's own, `typescript.jsonc` or `css.jsonc`; and the part of each other active block that has one, `<block>.jsonc`. Each scope's `bindings.yaml` says which setting holds which rule. The limits are errors, with both line limits off under `**/__tests__/**`; `useMaxParams` counts positional parameters, while whether values make one whole is reviewed.
>
> A rule it cannot hold is reported, and needs another tool, a review or an override.
