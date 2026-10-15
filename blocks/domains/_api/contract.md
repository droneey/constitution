# Contract

> Governs what the API offers, how it changes, and what it accepts.

## Contract

### contract-published-machine-readable · MUST
The API's contract — every operation, its parameters, its answers and its failures — is a document a machine reads, kept in the repository, and a spec checks the server's answers against it.

| Why | Tags |
|---|---|
| callers, generated clients and checks read one contract, and a server that drifts from it fails a spec, not a caller. | [] |

## Shapes

### answer-built-from-a-declared-shape · MUST
An answer carries only the fields of the shape declared for it, never an entity or a stored record serialised whole.

| Why | Tags |
|---|---|
| an entity sent whole sends every field later added to it — a hash, an internal flag, another caller's data — to every caller. | [security, data] |

### request-binds-only-declared-fields · MUST
A request sets only the fields its operation's declared shape lets a caller set; what the program decides — an identifier, save one the caller makes for what it creates, checked for its form; an owner, a role, a status — is never read from it.

| Why | Tags |
|---|---|
| a caller who adds `role: admin` to a body otherwise grants it to themselves. | [security] |

### answer-enumeration-extensible-in-the-contract → enumeration-others-read-declared-extensible · MUST
An enumeration in an answer is declared in the contract as a string whose known values it lists, never a closed `enum`.

| Why | Tags |
|---|---|
| a generated or validating client fails on a value outside a closed `enum`, so the first value added breaks every client built before it. | [] |

## Effects

### write-takes-an-idempotency-key → operation-idempotent-by-design · SHOULD
A write that a repeat would perform twice takes an idempotency key: for a creation, the identifier the caller makes for what it creates, which the record keeps as long as it lives; for a write that creates nothing of its own — a payment captured, a message sent — a key the server keeps, bound to the caller, for a time the contract declares. A repeat with a key already seen gets the first answer without running again, and the key reused with other input is refused as a conflict.

| Why | Tags |
|---|---|
| a caller retries a write whose answer it lost, and without the key the retry creates a second order; a creation's own identifier guards it for as long as the record lives, a key bound to its caller never hands one caller's stored answer to another, and a declared lifetime tells the caller how long a retry stays safe. | [data, security] |

## Change

### published-contract-changed-only-by-addition · MUST
A published contract changes only by addition — a new operation, a new optional field of a request, a new field of an answer — save the removal of what was retired and is past its announced date; a removal or a change of meaning ships beside the old one, as a new version, or under a new name in a style that has no versions; a check against the last released contract fails on any other change.

| Why | Tags |
|---|---|
| a caller the program does not deploy breaks the day a field it reads disappears or changes meaning, and a check finds that before the merge, where it costs nothing. | [] |

### retired-operation-announced-before-removal · MUST
An operation or a field a published contract retires is announced before it is removed, and removed no earlier than its announced date.

| Why | Tags |
|---|---|
| a caller learns of a removal from the answers it already reads, in time to move, instead of from the failure on the day it happens. | [] |

## Uploads

### upload-accepted-by-its-content · MUST
An uploaded file is accepted only when its kind, read from its content, is one the operation allows; its name and its declared type decide nothing.

| Why | Tags |
|---|---|
| a caller names a script `photo.jpg` and declares it an image, and a check that trusts either stores and serves it as one. | [security] |

## Requirements for implementation

### framework-parses-a-request-before-its-handler · MUST
The server framework parses a request's parameters and body against a declared shape before the route or tool runs, and passes a refusal to the one handler with the path of each field it refused.

| Why | Tags |
|---|---|
| without it, each route parses its own input, and the edge the program trusts is wherever each one remembered to parse. | [security] |
