# Bun test

## strict-matcher-only · SHOULD
A case compares with `toStrictEqual`, never `toEqual`.
**Why:** `toEqual` ignores undefined fields and class types, so a case passes on an outcome that differs.
**Check:** tool — lint
**Tags:** testing
**Implements:** `one-intent-per-case`

## no-module-mocks · SHOULD
No `mock.module` and no `spyOn` over a real module: an effect is replaced by its port's fake.
**Why:** a mocked module replaces code the spec claims to test, and breaks when the module moves.
**Check:** tool — lint
**Tags:** testing
**Implements:** `one-fake-per-port`

## integration-specs-run-apart · SHOULD
The unit run leaves out `*.integration.test.ts`; integration specs run as their own script of the check.
**Why:** the fast run stays fast, and the slower integration run fails on its own.
**Check:** review
**Tags:** testing
**Implements:** `adapter-integration-tested-in-sandbox`
