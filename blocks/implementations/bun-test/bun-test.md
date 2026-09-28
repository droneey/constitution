---
id: bun-test
summary: Bun's test runner, its coverage gate and its specs.
requires: []
extends: bun
abstract: false
checks: [tests, coverage]
dictionary: [bun:test]
governs: ["**/__tests__/**"]
---

# Bun test

> Runs the specs and holds the coverage gate. `bun test` in the check fails on any failing case. In `bunfig.toml`, `[test]` sets `coverage = true`, `coverageReporter = ["text"]` — the threshold is enforced only with the text reporter — `coverageSkipTestFiles = true`, `coverageThreshold = { lines = 1.0, functions = 1.0 }`, and `coveragePathIgnorePatterns` with exactly core's exclusions: `**/__tests__/**`, `**/main.ts`, `**/entrypoints/*/main.ts`, `**/root/wiring.ts`, `**/*.gen.*`. Bun measures no branches, and counts only the files a spec loads: a source file no spec imports is outside the gate and is reviewed. The configuration starts from devkit's template; a rule it cannot hold is reported.
