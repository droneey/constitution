---
id: bun-test
summary: Bun's test runner, its coverage gate and its specs.
requires: [bun]
extends: null
abstract: false
checks: [tests, coverage]
languages: [typescript]
roles: []
dictionary: [bun:test]
governs: ["**/__tests__/**"]
---

# Bun test

> Runs the specs and holds the coverage gate. In `bunfig.toml`, `[test]` sets no `retry`, and sets `coverage = true`, `coverageReporter = ["text"]` — outside `--parallel`, the threshold is enforced only with the text reporter — `coverageSkipTestFiles = true`, `coverageThreshold = { lines = 1.0, functions = 1.0 }`, and `coveragePathIgnorePatterns` with core's exclusions and those each active block names. Bun measures no branches, and counts only the files a spec loads: a source file no spec imports is outside the gate and is reviewed. The configuration starts from the template `templates/project/bun/bunfig.toml` of the constitution's release archive; a rule it cannot hold is reported.
