# Specs

> Governs what a spec may call: its matchers, its mocks, its retries and its waits.

## General

### strict-matcher-only → case-proves-one-intent · SHOULD

A case compares with `toStrictEqual`, never `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

| Why | Tags |
|---|---|
| these pass on a partial or loose match — `toEqual` ignores undefined fields and class types, the others whole parts of the outcome — so a case passes on an outcome that differs. | [] |

### module-never-mocked-in-a-spec → effect-faked-never-mocked · SHOULD

No `mock.module`, in any of its spellings — `vi.mock`, `jest.mock` — and no `spyOn` over a real module.

| Why | Tags |
|---|---|
| these are Bun's two ways to put another function in a module's place. | [] |

### failed-test-never-retried → flaky-test-fixed-never-retried · SHOULD

No case passes a `retry` or `repeats` option.

| Why | Tags |
|---|---|
| a retried case passes on its second try and hides the race that failed the first. | [] |

### spec-never-sleeps → test-never-sleeps-a-fixed-time · SHOULD

A spec calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

| Why | Tags |
|---|---|
| these are the fixed delays a spec reaches for; the fake clock of `bun:test` or a wait on a condition replaces them. | [] |
