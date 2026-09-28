---
id: vitest
kind: implementation
summary: Vitest runs the specs and measures their coverage.
chapters: []
requires: []
extends: vite
abstract: false
checks: [tests, coverage]
owns: [Vitest, vitest.config.ts, vi.mock]
governs: ["vitest.config.ts", "**/__tests__/**"]
status: stable
---

# Vitest

> Runs the specs of a Vite project and holds the coverage gate. Its configuration starts from devkit's preset and holds every active rule whose check is `tool — tests` or `tool — coverage`; the setup file registers the axe matcher. A rule it cannot hold is reported.

## runner-picks-only-named-specs · MUST
The runner picks up exactly `__tests__/**/<name>.test.*`; integration specs run as a step of their own, and a run that finds no spec fails.
**Why:** a spec named otherwise never runs, and a run that finds nothing passes silently.
**Check:** tool — tests
**Tags:** testing
**Implements:** `test-files-named-by-role`

## coverage-counts-every-source-file · MUST
Coverage counts every source file, tested or not, at 100 percent of lines, functions and branches, excluding exactly core's list and the stories.
**Why:** without counting all files, a file no spec imports is invisible to the gate.
**Check:** tool — coverage
**Tags:** testing
**Implements:** `coverage-holds-all-logic`

## ui-specs-in-a-simulated-dom · SHOULD
Interface specs run in a simulated DOM, which is their sandbox; a request no captured response answers fails the case, and time is faked where it matters.
**Why:** the simulated DOM gives every run the same page, and a stray request is a bug, not a flaky test.
**Check:** review
**Tags:** testing
**Implements:** `tests-run-in-a-sandbox`

## no-module-mocking-of-own-code · SHOULD
No `vi.mock` of the project's own modules: effects are faked through their ports, and a spy is asserted only when the call is the behaviour.
**Why:** a mocked module replaces the code the spec claims to test.
**Check:** tool — lint
**Tags:** testing
**Implements:** `assert-what-a-caller-observes`

## cases-isolated-by-configuration · SHOULD
Mocks, stubbed globals and the environment are restored after every case, and cases pass in any order.
**Why:** a case that depends on the one before it fails when run alone, and hides the real cause.
**Check:** tool — tests
**Tags:** testing
**Implements:** `tests-run-in-a-sandbox`
