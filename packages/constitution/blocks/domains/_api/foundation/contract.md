# Contract

> Governs what the API offers, how it changes, and what it accepts.

## General

### contract-published-machine-readable → format-others-read-declared-in-a-schema · MUST

The API's contract is a document a machine reads, covering every operation. It declares each operation with its parameters, its answers and its failures, and the server's answers are checked against it.

| Why |
|---|
| an operation, a parameter or a failure the contract leaves out is one no generated client offers and no spec checks, so a caller learns of it, or of the server's drift from it, only by calling it in production. |

## Shapes

### request-binds-only-declared-fields · MUST

A request sets only the fields its operation's declared shape lets a caller set. What the program decides — an identifier, save one the caller makes for what it creates, checked for its form; an owner, a role, a status — is never read from it.

| Why |
|---|
| a caller who adds a field the program decides to a body otherwise sets it, granting itself a role or taking over another's record. |

### answer-enumeration-extensible-in-the-contract → enumeration-others-read-declared-extensible · MUST

An enumeration in an answer is declared open in the contract. Its known values are listed, and its readers are told to expect others.

| Why |
|---|
| a client generated from the contract, or one that checks answers by it, fails on a value outside a closed set, so the first value added breaks every client built before it. |

### upload-accepted-by-its-content · MUST

An uploaded file is accepted by the kind its content shows. It is accepted only when that kind is one the operation allows; its name and its declared type decide nothing.

| Why |
|---|
| a caller gives a script an image's name and declared type, and a check that trusts either stores and serves the script as an image. |

### field-names-in-one-case · SHOULD

The fields of every shape the API exchanges are named in one case across the whole API.

| Why |
|---|
| fields named in two cases make a caller guess each field's spelling and fail on a wrong guess, and a generated client mixes two conventions in one type. |

## Effects

### write-takes-an-idempotency-key → operation-idempotent-by-design · SHOULD

A write that a repeat would perform twice takes an idempotency key. For a creation the key is the identifier the caller makes for what it creates, which the record keeps as long as it lives; for a write that creates nothing of its own — a payment captured, a message sent — it is a key the server keeps, bound to the caller, for a time the contract declares. A repeat with a key already seen gets the first answer without running again, and the key reused with other input is refused as a conflict.

| Why |
|---|
| a caller retries a write whose answer it lost, and without the key the retry creates a second order; a creation's own identifier guards it for as long as the record lives, a key bound to its caller never hands one caller's stored answer to another, and a declared lifetime tells the caller how long a retry stays safe. |

## Change

### published-contract-changed-only-by-addition → format-changed-in-steps · MUST

A published contract changes only by addition. An addition is a new operation, a new optional field of a request or a new field of an answer, and the one removal allowed is of what was retired and is past its announced date. A removal or a change of meaning ships beside the old one, as a new version, or under a new name in a style that has no versions; a check against the last released contract fails on any other change.

| Why |
|---|
| a caller the program does not deploy breaks the day a field it reads disappears or changes meaning — the expand–contract pattern. |

### retired-operation-announced-before-removal · MUST

An operation or a field a published contract retires is announced before it is removed, and removed no earlier than its announced date.

| Why |
|---|
| a caller learns of a removal from the answers it already reads, in time to move, instead of from the failure on the day it happens. |

## Requirements for implementation

### framework-parses-a-request-before-its-handler · MUST

The server framework parses a request before its operation runs. It parses the request's parameters and body against a declared shape, and its refusal names the path of each field it refused.

| Why |
|---|
| without it, each operation parses its own input, and the edge the program trusts is wherever each one remembered to parse — parse, don't validate. |
