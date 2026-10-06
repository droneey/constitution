---
id: unreliable-network
summary: Code whose requests can time out, fail or lose the connection.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Unreliable network

> A property several platforms share: a request can be slow, fail, or never arrive. The program treats each of these as a normal outcome.

### every-request-has-a-timeout → io-has-timeout-and-cancellation · MUST
Every request over the network has a timeout and can be cancelled.

| Why | Tags |
|---|---|
| on an unreliable network a request without a timeout eventually hangs, and the user waits for nothing. | [] |

### connection-loss-is-an-expected-failure → expected-failures-typed-with-codes · MUST
A timeout or a lost connection is an expected, typed failure the user sees and can retry, never a hang or a silent loss.

| Why | Tags |
|---|---|
| on this network it will happen; a program that treats it as a defect fails its users every day. | [ux] |

### user-input-survives-connection-loss · SHOULD
Input the user entered survives a failed request and is sent again without being typed again.

| Why | Tags |
|---|---|
| a user who loses their input to a dropped connection does not type it twice. | [ux] |

### network-failures-have-cases → every-declared-failure-has-a-case
A request's timeout and its lost connection each have a test case.

| Why | Tags |
|---|---|
| these failures are rare on a developer's machine and common in the field, so only a test exercises them before a user does. | [] |
