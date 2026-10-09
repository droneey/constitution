---
id: biome
summary: Formats and lints TypeScript and CSS, with GritQL rules of our own.
requires: [typescript]
extends: null
abstract: false
languages: [typescript, css]
dictionary: [Biome, biome.json, biome-ignore, GritQL, .grit]
governs: ["biome.json", "biome.*.jsonc", "**/*.grit"]
---

# Biome

> Formats and lints. `biome.json` extends the parts of the constitution's release archive: those of `presets/common/biome/`, which read any language, and those of the scope of each active language it covers, `presets/typescript/biome/` and `presets/css/biome/`. On each axis — the base at the scope's root, an optional axis in its folder — a scope holds Biome's own settings, `self.jsonc`; core's, `core.jsonc`; the language's own, `typescript.jsonc` or `css.jsonc`; and the part of each other active block that has one, `<block>.jsonc`. The `bindings.yaml` beside the parts of each axis says which setting holds which rule. The limits are errors, with both line limits off under `**/__tests__/**`; `useMaxParams` counts positional parameters, while whether values make one whole is reviewed.
>
> A rule it cannot hold is reported, and needs another tool, a review or an override.

### biome-formats-every-file-it-reads → one-formatter-per-language · MUST
Biome formats every TypeScript, CSS and JSON file: two spaces, lines of at most 100, single quotes in TypeScript.

| Why | Tags |
|---|---|
| one formatter for the languages Biome reads ends every argument about their layout. | [] |

### biome-suppression-states-its-reason → suppression-states-its-reason · MUST
A `biome-ignore` comment states its reason after the colon.

| Why | Tags |
|---|---|
| Biome refuses a suppression without a reason, so every silenced finding says why. | [] |

### biome-suppression-names-one-rule → suppression-silences-one-finding · MUST
A suppression names one rule, `// biome-ignore lint/<group>/<rule>`; never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why | Tags |
|---|---|
| Biome also takes a group, a whole file and a range, so only this form names one rule on one line. | [] |

### biome-rules-set-as-errors → rule-held-by-a-tool-where-one-can · MUST
Every rule the parts turn on is an error: no part sets a rule to `warn` or `info`, and a recommended rule whose default severity is lower is set to `error`.

| Why | Tags |
|---|---|
| Biome fails on errors alone, so a rule left at a warning is reported and passed, and the rule it stands for is not held. | [] |

### biome-refuses-empty-names → name-never-an-empty-word · SHOULD
A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails the lint wherever its part reaches.

| Why | Tags |
|---|---|
| a list of words is what a lint can hold of the rule; whether a word is truly generic stays the reviewer's. | [] |

### biome-refuses-empty-verbs → function-name-has-a-concrete-verb · SHOULD
A function or a method named only `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` or `update` fails the lint. A proxy's handler passes, and another name an interface imposes takes a suppression that says so.

| Why | Tags |
|---|---|
| a list of verbs is what a lint can hold of the rule; the lint sees a proxy's handler, and no other interface that imposes a name. | [] |

### project-grit-rules-scoped · SHOULD
A project's own GritQL rule lives in `biome/<name>.grit`, scoped by an override, until the constitution's presets carry it.

| Why | Tags |
|---|---|
| a rule of the project's own is found in one place and moves to the preset as one file. | [] |
