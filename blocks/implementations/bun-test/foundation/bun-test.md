# Bun test

## strict-matcher-only → one-intent-per-case
A case compares with `toStrictEqual`, never `toEqual`.

| Why | Check | Tags |
|---|---|---|
| `toEqual` ignores undefined fields and class types, so a case passes on an outcome that differs. | tool/lint | [] |

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
