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

> Mutation testing. Stryker has no `extends`: `stryker.config.mjs` spreads devkit's configuration and the constitution's `presets/stryker/base.mjs`, which mutates the logic — `src/` without core's exclusions from coverage (`__tests__`, the entry file of each artifact, the file that wires the program together, generated files, declarations) and without stories — with `thresholds.break` at 100. In the check, devkit's `mutation-check` mutates the lines a change touches, a new file whole and the file a changed spec proves whole; `mutation-check all` mutates everything. No incremental report is kept: with the command runner a cached result can hide a survivor. A survivor fails the run.
