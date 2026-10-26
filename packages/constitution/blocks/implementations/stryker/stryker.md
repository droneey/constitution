---
id: stryker
summary: Stryker measures the tests by the mutants they kill.
requires: [typescript, json, _js-runtime]
extends: null
abstract: false
languages: [typescript]
governs: ["stryker.config.json"]
---

# Stryker

> Mutation testing.

**Stryker** reads **`stryker.config.json`**, into which the program writes the settings of every block.

`incremental` stays at Stryker's default, off: with no spec reported per mutant a cached result can hide a survivor.
