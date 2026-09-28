# Bun test

## strict-matcher-only → one-intent-per-case
A case compares with `toStrictEqual`, never `toEqual`.

| Why | Check | Tags |
|---|---|---|
| `toEqual` ignores undefined fields and class types, so a case passes on an outcome that differs. | tool — lint | [] |

## no-module-mocks → one-fake-per-port
No `mock.module` and no `spyOn` over a real module: an effect is replaced by the fake of its interface.

| Why | Check | Tags |
|---|---|---|
| a mocked module replaces code the spec claims to test, and breaks when the module moves. | tool — lint | [] |

## integration-specs-run-apart → adapter-integration-tested-in-sandbox
The unit run leaves out `*.integration.test.ts`; integration specs run as their own script of the check.

| Why | Check | Tags |
|---|---|---|
| the fast run stays fast, and the slower integration run fails on its own. | review | [] |
