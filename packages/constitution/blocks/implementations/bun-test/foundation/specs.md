# Specs

> Governs what a spec may call: its matchers, its mocks, its retries and its waits.

## General

### strict-matcher-only → case-proves-one-intent · SHOULD

A case compares with `toStrictEqual`. It never uses `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

| Why |
|---|
| these pass on a partial or loose match (`toEqual` ignores undefined fields and class types, the others whole parts of the outcome) so a case passes on an outcome that differs. |

### module-never-mocked-in-a-spec → effect-faked-never-mocked · SHOULD

No spec mocks a module. It calls no `mock.module`, in any of its spellings — `vi.mock`, `jest.mock` — and no `spyOn` over a real module.

| Why |
|---|
| these are Bun's two ways to put another function in a module's place, so a spec that uses them proves the replacement instead of the code, and breaks when the module moves. |

### failed-test-never-retried → flaky-test-fixed-never-retried · SHOULD

No case passes a `retry` or `repeats` option.

| Why |
|---|
| a retried case passes on its second try and hides the race that failed the first. |

### spec-never-sleeps → test-never-sleeps-a-fixed-time · SHOULD

A spec never sleeps a fixed time. It calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

| Why |
|---|
| these are the fixed delays a spec reaches for, too short on a slow machine, where the spec fails at random, and wasted on a fast one; the fake clock of `bun:test` or a wait on a condition replaces them. |
