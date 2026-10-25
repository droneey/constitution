---
id: biome
summary: Formats and lints code, stylesheets and JSON, with our GritQL rules.
requires: [json]
extends: null
abstract: false
languages: [typescript, css, json]
governs: ["biome.json", "**/*.grit"]
---

# Biome

> **Biome** formats and lints, by its settings in **`biome.json`**, with rules of our own in **GritQL**.

The limits are errors, with both line limits off under `**/__tests__/**`; `useMaxParams` counts positional parameters, while whether values make one whole is reviewed.

On the architecture axis, the parts read every file under `src/` outside the edge — adapters, those of a feature and of a composition module among them, `libs/`, `root/`, the entry files, `entrypoints/` and `integrations/` — for the effects reached through a global, and every such file outside the binding units of `app/` for a timer. They also narrow three GritQL rules of `foundation/`: the ones against `null` and against a closed set outside an enum to code outside adapters and wire models, and the one against empty names to code outside `libs/`, a source's or a workspace's. `noConsole` stays on everywhere: the logging facade `root/` implements, and a command's binding unit, write through the streams of the run that the root or the command's framework hands them.

A rule it cannot hold is reported, and needs another tool, a review or an override.
