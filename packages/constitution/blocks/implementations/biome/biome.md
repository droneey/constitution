---
id: biome
summary: Formats and lints TypeScript and CSS, with GritQL rules of our own.
requires: [typescript]
extends: null
abstract: false
languages: [typescript, css]
dictionary: [Biome, biome.json, biome-ignore, GritQL, .grit]
governs: ["biome.json", "**/*.grit"]
---

# Biome

> Formats and lints.

`biome.json` extends the parts of the Constitution's release archive: those of `presets/common/biome/`, which read any language, and those of the scope of each active language it covers, `presets/typescript/biome/` and `presets/css/biome/`. A scope holds Biome's own settings, `self.jsonc`, in `foundation/`, and in the folder of each axis it holds — `foundation/`, `architecture/`, `workflow/` — core's part where it has one, `core.jsonc`; the language's own, `typescript.jsonc` or `css.jsonc`; and the part of each other active block that has one, `<block>.jsonc`. The `bindings.yaml` beside the parts of each axis says which setting holds which rule. The limits are errors, with both line limits off under `**/__tests__/**`; `useMaxParams` counts positional parameters, while whether values make one whole is reviewed.

On the architecture axis, the parts read every file under `src/` outside the edge — adapters, those of a feature and of a composition module among them, `libs/`, `root/`, the entry files, `entrypoints/` and `integrations/` — for the effects reached through a global, and every such file outside the binding units of `app/` for a timer. They also narrow three GritQL rules of `foundation/`: the ones against `null` and against a closed set outside an enum to code outside adapters and wire models, and the one against empty names to code outside `libs/`, a source's or a workspace's. `noConsole` stays on everywhere: the logging facade `root/` implements, and a command's binding unit, write through the streams of the run that the root or the command's framework hands them.

A rule it cannot hold is reported, and needs another tool, a review or an override.
