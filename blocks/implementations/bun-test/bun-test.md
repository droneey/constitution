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

> Runs the specs and holds the coverage gate. In `bunfig.toml`, `[test]` sets no `retry`, and sets `coverage = true`, `coverageReporter = ["text"]` — outside `--parallel`, the threshold is enforced only with the text reporter — `coverageSkipTestFiles = true`, `coverageThreshold = { lines = 1.0, functions = 1.0 }`, and `coveragePathIgnorePatterns` with core's exclusions and those each active block names. Bun measures no branches, and counts only the files a spec loads: a source file no spec imports is outside the gate and is reviewed. The configuration starts from the template `templates/project/bun/bunfig.toml` of the constitution's release archive; a rule it cannot hold is reported.

> Core's exclusions from coverage are the specs and their fixtures, `**/__tests__/**`, the entry file, `**/main.*`, and generated files, `**/*.gen.*`.

### strict-matcher-only → one-intent-per-case
A case compares with `toStrictEqual`, never `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

| Why | Tags |
|---|---|
| these pass on a partial or loose match — `toEqual` ignores undefined fields and class types, the others whole parts of the outcome — so a case passes on an outcome that differs. | [] |

### no-module-mocks → effects-faked-never-mocked
No `mock.module` and no `spyOn` over a real module.

| Why | Tags |
|---|---|
| these are Bun's two ways to put another function in a module's place. | [] |

### integration-specs-ignored-by-bunfig → integration-tested-against-the-real-engine
`pathIgnorePatterns` in `bunfig.toml` leaves out `*.integration.test.ts` and `tests/`.

| Why | Tags |
|---|---|
| `bun test` takes every spec file under the folder it starts in, so only an ignored pattern keeps the integration and end-to-end specs out of the unit specs, their sandbox and their coverage gate. | [] |

### coverage-gate-on-loaded-files → coverage-holds-all-logic
Bun's coverage gate fails when the lines or functions of a file a spec loads fall below 100 percent, outside core's exclusions.

| Why | Tags |
|---|---|
| a line no behaviour reaches fails the check where it appears, not in a later review. | [testing] |

### no-test-retries → flaky-test-fixed-or-removed
No case passes a `retry` or `repeats` option.

| Why | Tags |
|---|---|
| a retried case passes on its second try and hides the race that failed the first. | [] |

### test-order-randomized → case-order-shuffled-with-a-seed
`bunfig.toml` sets `randomize = true`.

| Why | Tags |
|---|---|
| Bun runs the cases in the order they are written unless the setting shuffles them, and then prints the seed of each run. | [] |

### no-sleep-in-specs → no-fixed-sleeps-in-tests
A spec calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

| Why | Tags |
|---|---|
| these are the fixed delays a spec reaches for; the fake clock of `bun:test` or a wait on a condition replaces them. | [] |

### network-refused-by-the-test-preload → network-refused-in-unit-specs
`bunfig.toml` preloads a fixture that replaces with functions that throw every way the runtime opens a connection: `fetch`, `WebSocket`, `Bun.connect` and `Bun.SQL`; `node:net`'s `Socket.prototype.connect`, `connect` and `createConnection`; `node:tls`'s `connect`; and `request` and `get` of `node:http` and `node:https`. A configuration for the integration specs does not preload it.

| Why | Tags |
|---|---|
| a preload runs before every spec file the configuration takes, so the refusal holds for each of them with no line in the spec. | [] |
