# Unreliable network

## every-request-has-a-timeout → io-has-timeout-and-cancellation · MUST
Every request over the network has a timeout and can be cancelled.

| Why | Check | Tags |
|---|---|---|
| on an unreliable network a request without a timeout eventually hangs, and the user waits for nothing. | review | [] |

## connection-loss-is-an-expected-failure → expected-failures-typed-with-codes · MUST
A timeout or a lost connection is an expected, typed failure the user sees and can retry, never a hang or a silent loss.

| Why | Check | Tags |
|---|---|---|
| on this network it will happen; a program that treats it as a defect fails its users every day. | review | [ux] |

## user-input-survives-connection-loss · SHOULD
Input the user entered survives a failed request and is sent again without being typed again.

| Why | Check | Tags |
|---|---|---|
| a user who loses their input to a dropped connection does not type it twice. | review | [ux] |

## network-failures-have-cases → every-declared-failure-has-a-case
A request's timeout and its lost connection each have a test case.

| Why | Check | Tags |
|---|---|---|
| these failures are rare on a developer's machine and common in the field, so only a test exercises them before a user does. | test | [] |
