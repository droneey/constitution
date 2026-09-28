---
id: bun-test
kind: implementation
summary: Bun's test runner, its coverage gate and its specs.
chapters: []
requires: []
extends: bun
abstract: false
checks: [tests, coverage]
owns: [bun:test]
governs: ["**/__tests__/**"]
status: stable
---

# Bun test

> Runs the specs and holds the coverage gate. `bun test` in the check fails on any failing case. In `bunfig.toml`, `[test]` sets `root = "./src"`, `coverage = true`, `coverageReporter = ["text"]` — the threshold is enforced only with the text reporter — `coverageSkipTestFiles = true`, `coverageThreshold = { lines = 1.0, functions = 1.0 }`, and `coveragePathIgnorePatterns` with exactly core's exclusions: `**/__tests__/**`, `**/main.ts`, `**/entrypoints/*/main.ts`, `**/root/wiring.ts`, `**/*.gen.*`. Bun measures no branches. The configuration starts from devkit's template; a rule it cannot hold is reported.

## strict-matcher-only · SHOULD
A case compares with `toStrictEqual`, never `toEqual`.
**Why:** `toEqual` ignores undefined fields and class types, so a case passes on an outcome that differs.
**Check:** tool — lint
**Tags:** testing
**Implements:** `one-intent-per-case`

## no-module-mocks · SHOULD
No `mock.module` and no `spyOn` over a real module: effects are faked through their ports.
**Why:** a mocked module replaces code the spec claims to test, and breaks when the module moves.
**Check:** tool — lint
**Tags:** testing
**Implements:** `effects-faked-through-ports`

## integration-specs-run-apart · SHOULD
The unit run leaves out `*.integration.test.ts`; integration specs run as their own script of the check.
**Why:** the fast run stays fast, and the slower integration run fails on its own.
**Check:** review
**Tags:** testing
**Implements:** `adapter-integration-tested-in-sandbox`
