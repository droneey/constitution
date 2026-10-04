# Bun test

## strict-matcher-only → one-intent-per-case
A case compares with `toStrictEqual`, never `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

| Why | Check | Tags |
|---|---|---|
| these pass on a partial or loose match — `toEqual` ignores undefined fields and class types, the others whole parts of the outcome — so a case passes on an outcome that differs. | tool/lint | [] |

## no-module-mocks → one-fake-per-contract
No `mock.module` and no `spyOn` over a real module: an effect is replaced by the fake of its contract.

| Why | Check | Tags |
|---|---|---|
| a mocked module replaces code the spec claims to test, and breaks when the module moves. | tool/lint | [] |

## integration-specs-run-apart → integration-tested-against-the-real-engine
The unit run leaves out `*.integration.test.ts` and `tests/` by `pathIgnorePatterns` in `bunfig.toml`; integration specs run as their own script of the check, `bun --config=./bunfig.integration.toml test .integration.test`.

| Why | Check | Tags |
|---|---|---|
| the fast run stays fast, and the slower integration run fails on its own. | review | [] |

## check-writes-no-snapshot → check-only-checks
The check runs `bun test` with `CI=1`, so a snapshot the specs lack fails the run instead of being written.

| Why | Check | Tags |
|---|---|---|
| outside CI, Bun writes a missing snapshot file and fills an inline snapshot into the spec, so a local check would change tracked files. | review | [] |

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

## test-order-randomized → specs-independent-of-order
`bunfig.toml` sets `randomize = true`, so every run shuffles the cases and prints the seed that replays a failure.

| Why | Check | Tags |
|---|---|---|
| a case that leans on another fails in some order, and the seed lets anyone run that order again. | review | [] |

## no-sleep-in-specs → no-fixed-sleeps-in-tests
A spec calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

| Why | Check | Tags |
|---|---|---|
| these are the fixed delays a spec reaches for; the fake clock of `bun:test` or a wait on a condition replaces them. | tool/lint | [] |

## network-refused-by-the-test-preload → tests-run-in-a-sandbox
`bunfig.toml` preloads a fixture that replaces `fetch`, `WebSocket` and `Bun.connect` with functions that throw, so a unit spec that calls them fails; the integration run does not preload it.

| Why | Check | Tags |
|---|---|---|
| a spec that reaches a server by mistake passes while the server answers and fails at random when it does not; refused at once, it fails where the mistake is. | review | [] |
