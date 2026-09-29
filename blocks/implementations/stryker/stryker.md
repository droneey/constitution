---
id: stryker
summary: Stryker measures the tests by the mutants they kill.
requires: [typescript]
extends: null
abstract: false
checks: [mutation]
dictionary: [Stryker, stryker.config.mjs]
governs: ["stryker.config.mjs"]
---

# Stryker

> Mutation testing. Stryker has no `extends`: `stryker.config.mjs` spreads the parts of the constitution's release archive — `presets/stryker/foundation/self.mjs`, the runner, and `foundation/core.mjs`, which mutates the logic, `src/` without core's exclusions from coverage (`__tests__`, the entry file, generated files, declarations) and without stories, with `thresholds.break` at 100 — and joins the exclusions of `architecture/core.mjs`, the entry file of each artifact and the file that wires the program together. In the check, the archive's `tools/mutation-check/dist/main.js` mutates the lines a change touches, a new file whole and the file a changed spec proves whole; `mutation-check all` mutates everything. No incremental report is kept: with the command runner a cached result can hide a survivor. A survivor fails the run.
