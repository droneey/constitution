---
id: stryker
summary: Stryker measures the tests by the mutants they kill.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
dictionary: [Stryker, stryker.config.mjs]
governs: ["stryker.config.mjs"]
---

# Stryker

> Mutation testing.

Stryker has no `extends`, so `stryker.config.mjs` joins the parts, each list after the lists of the parts before it.

`self.mjs` leaves `incremental` at Stryker's default, off: with no spec reported per mutant a cached result can hide a survivor.
