---
id: stryker
summary: Stryker measures the tests by the mutants they kill.
requires: [js-runtime, task-runner]
languages: [typescript]
governs: ["stryker.config.json"]
---

# Stryker

> Mutation testing.

Stryker reads `stryker.config.json`, into which `constitution` writes the settings of every block. The `bun-specs` runner and the `diagnostics` ignorer it loads are the Constitution's own, `tools/mutation-check/dist/runner.js` and `tools/mutation-check/dist/ignorers.js` of its distribution.
