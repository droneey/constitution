---
id: biome
summary: Formats and lints code, styles, JSON and YAML, with our GritQL rules.
requires: [json, _task-runner]
extends: null
abstract: false
languages: [typescript, css, json, yaml]
governs: ["biome.jsonc", "**/*.grit"]
---

# Biome

> **Biome** formats and lints, by its settings in **`biome.jsonc`**, with rules of our own in **GritQL**.

The limits are errors, with both line limits off under `**/__tests__/**`; `useMaxParams` counts positional parameters, while whether values make one whole is reviewed.

On the architecture axis, the settings read every file under `src/` outside the edge — `infrastructure/`, a feature's and a composition module's among them, `libs/`, `root/`, the entry files, `entrypoints/` and `integrations/` — for the effects reached through a global, and every such file outside a binding unit for a timer. They also declare three GritQL rules of `foundation/`, which no other part declares: the ones against `null` and against a closed set outside an enum, for code outside adapters and wire models, and the one against empty names, for code outside `libs/`, a source's or a workspace's. `noConsole` stays on everywhere: the logging facade `root/` implements, and a command's binding unit, write through the streams of the run that the root or the command's framework hands them.

A rule it cannot hold is reported, and needs another tool, a review or an override.
