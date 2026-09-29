---
id: biome
summary: Formats and lints TypeScript, with GritQL rules of our own.
requires: [typescript]
extends: null
abstract: false
checks: [format, lint, names]
dictionary: [Biome, biome.json, biome-ignore, GritQL, .grit]
governs: ["biome.json", "**/*.grit"]
---

# Biome

> Formats and lints. `biome.json` extends the parts of the constitution's release archive: `presets/biome/foundation/self.jsonc`, Biome's own settings, then `core.jsonc`, `typescript.jsonc` and a part named after each other active block that has rules of its own, such as `react-dom.jsonc`, and on the architecture axis `architecture/core.jsonc` and its peers. `presets/biome/bindings.yaml` says which setting holds which rule. The limits are errors, with both line limits off under `**/__tests__/**`; `useMaxParams` counts positional parameters, while whether values make one whole is reviewed.
>
> A rule it cannot hold is reported, and needs another tool, a review or an override.
