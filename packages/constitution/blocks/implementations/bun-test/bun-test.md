---
id: bun-test
summary: Bun's test runner, its coverage gate and its specs.
requires: [bun]
extends: null
abstract: false
languages: [typescript]
dictionary: [bun:test]
governs: ["**/__tests__/**"]
---

# Bun test

> Runs the specs and holds the coverage gate.

`bunfig.toml` runs the unit specs, sets no `retry` and measures no coverage; `bunfig.integration.toml` runs the unit and the integration specs in one run and holds the gate: `coverage = true`, `coverageReporter = ["text"]` — outside `--parallel`, the threshold is enforced only with the text reporter — `coverageSkipTestFiles = true`, `coverageThreshold = { lines = 1.0, functions = 1.0 }`, and `coveragePathIgnorePatterns` with core's exclusions and those each active block names. Bun measures no branches, and counts only the files a spec loads: a source file no spec imports is outside the gate and is reviewed. The configurations start from the templates `templates/project/typescript/bun/bunfig.toml` and `bunfig.integration.toml` of the Constitution's release archive; a rule they cannot hold is reported.

Core's exclusions from coverage are the specs and their fixtures, `**/__tests__/**`, the entry file, `**/main.*`, and generated files, `**/*.gen.*`.

On the architecture axis, core's tree adds to core's exclusions from coverage the wiring file, `**/root/wiring.*`; their `**/main.*` already leaves out the entry file of each artefact.
