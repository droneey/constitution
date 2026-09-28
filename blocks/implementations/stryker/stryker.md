---
id: stryker
kind: implementation
summary: Stryker measures the tests by the mutants they kill.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [mutation]
owns: [Stryker, stryker.config.mjs]
governs: ["stryker.config.mjs"]
status: stable
---

# Stryker

> Mutation testing. Stryker has no `extends`: `stryker.config.mjs` spreads devkit's configuration and the constitution's `presets/stryker/base.mjs`, which mutates the logic — `src/` without `__tests__`, entrypoints, `root/` and the entry — with `thresholds.break` at 100. In the check, devkit's `mutation-check` mutates the lines a change touches, a new file whole and the file a changed spec proves whole; `mutation-check all` mutates everything. No incremental report is kept: with the command runner a cached result can hide a survivor. A survivor fails the run.

## equivalent-mutant-marked-on-its-line · MUST
An equivalent mutant is marked on its line — `// Stryker disable next-line <mutator>: <reason>` — one mutator and its reason; never `all`, and never a disable for a whole file.
**Why:** a mark on one line for one mutator is an argument a reviewer can check; a broad one hides real survivors.
**Check:** review
**Tags:** testing
**Implements:** `mutants-all-killed`
