# Specs

> Governs what a spec may call: its matchers, its mocks, its retries and its waits.

## General

### strict-matcher-only → case-asserts-by-strict-equality · MUST

Every case compares two values by `toStrictEqual` or `toBe`, never by a loose matcher. It never uses one such as `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

| Why |
|---|
| these pass on a partial or loose match (`toEqual` ignores undefined fields and class types, the others whole parts of the outcome) so a case passes on an outcome that differs. |

### bun-spec-mocks-no-module → effect-faked-never-mocked · MUST

No spec mocks a module. It calls no `mock.module`, in any of its spellings, such as `vi.mock` and `jest.mock`, and no `spyOn` over a real module.

| Why |
|---|
| these are Bun's two ways to put another function in a module's place, so a spec that uses them proves the replacement instead of the code, and breaks when the module moves. |

### bun-test-retries-no-case → flaky-test-fixed-never-retried · MUST

No run of the specs retries a failed case. No case passes a `retry` option, no `bunfig` sets `retry` under `[test]`, and no script passes `--retry` to `bun test`.

| Why |
|---|
| a retried case passes on its second try and hides the race that failed the first, and Bun takes a retry from the case, from `bunfig` and from the command line alike. |

### bun-spec-never-sleeps → test-never-sleeps-a-fixed-time · MUST

No spec sleeps a fixed time. It calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

| Why |
|---|
| these are the fixed delays a spec reaches for, too short on a slow machine, where the spec fails at random, and wasted on a fast one; the fake clock of `bun:test` or a wait on a condition replaces them. |
