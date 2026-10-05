# Bun test

## strict-matcher-only → one-intent-per-case
A case compares with `toStrictEqual`, never `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

| Why | Check | Tags |
|---|---|---|
| these pass on a partial or loose match — `toEqual` ignores undefined fields and class types, the others whole parts of the outcome — so a case passes on an outcome that differs. | tool/lint | [] |

## no-module-mocks → effects-faked-never-mocked
No `mock.module` and no `spyOn` over a real module.

| Why | Check | Tags |
|---|---|---|
| these are Bun's two ways to put another function in a module's place. | tool/lint | [] |

## integration-specs-run-apart → integration-specs-in-their-own-run
The unit run leaves out `*.integration.test.ts` and `tests/` by `pathIgnorePatterns` in `bunfig.toml`; integration specs run as their own script of the check, `bun --config=./bunfig.integration.toml test .integration.test`.

| Why | Check | Tags |
|---|---|---|
| `bun test` runs every spec file under the folder it starts in, so only an ignored pattern keeps the integration specs out of the unit run. | review | [] |

## check-writes-no-snapshot → check-only-checks
The check runs `bun test` with `CI=1`, so a snapshot the specs lack fails the run instead of being written.

| Why | Check | Tags |
|---|---|---|
| outside CI, Bun writes a missing snapshot file and fills an inline snapshot into the spec, so a local check would change the files it checks. | review | [] |

## coverage-gate-on-loaded-files → coverage-holds-all-logic
`bun test` fails when the lines or functions of a file a spec loads fall below 100 percent, outside core's exclusions.

| Why | Check | Tags |
|---|---|---|
| a line no behaviour reaches fails the check where it appears, not in a later review. | tool/coverage | [testing] |

## no-test-retries → flaky-test-fixed-or-removed
No case passes a `retry` or `repeats` option.

| Why | Check | Tags |
|---|---|---|
| a retried case passes on its second try and hides the race that failed the first. | tool/lint | [] |

## test-order-randomized → case-order-shuffled-with-a-seed
`bunfig.toml` sets `randomize = true`.

| Why | Check | Tags |
|---|---|---|
| Bun runs the cases in the order they are written unless the setting shuffles them, and then prints the seed of each run. | review | [] |

## no-sleep-in-specs → no-fixed-sleeps-in-tests
A spec calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

| Why | Check | Tags |
|---|---|---|
| these are the fixed delays a spec reaches for; the fake clock of `bun:test` or a wait on a condition replaces them. | tool/lint | [] |

## network-refused-by-the-test-preload → network-refused-in-the-unit-run
`bunfig.toml` preloads a fixture that replaces `fetch`, `WebSocket` and `Bun.connect` with functions that throw; the integration run does not preload it.

| Why | Check | Tags |
|---|---|---|
| a preload runs before every spec file of the run, so the refusal holds for each of them with no line in the spec. | review | [] |
