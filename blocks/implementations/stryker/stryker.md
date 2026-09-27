---
id: stryker
kind: implementation
summary: Stryker measures the tests by the mutants they kill.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [mutation]
owns: [Stryker, stryker.config.json]
governs: ["stryker.config.json"]
status: stable
---

# Stryker

> Mutation testing. `stryker.config.json` mutates the logic — `src/**/*.ts` without `__tests__`, test helpers, entrypoints and `root/` — with `thresholds.break` at 100 and `incremental` with its report in an ignored folder. In the check it runs with `--mutate` over the files a change touches and the files whose specs it touches. A survivor fails the run.

## equivalent-mutant-marked-on-its-line · MUST
An equivalent mutant is marked on its line — `// Stryker disable next-line <mutator>: <reason>` — one mutator and its reason; never `all`, and never a disable for a whole file.
**Why:** a mark on one line for one mutator is an argument a reviewer can check; a broad one hides real survivors.
**Check:** review
**Tags:** testing
**Implements:** `mutants-all-killed`
