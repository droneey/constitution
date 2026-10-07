# Contract

> Governs what the API offers, how it changes, and what it accepts.

## Contract

### contract-published-machine-readable · MUST
The API's contract — every operation, its parameters, its answers and its failures — is a document a machine reads, kept in the repository, and a spec checks the server's answers against it.

| Why | Tags |
|---|---|
| callers, generated clients and checks read one contract, and a server that drifts from it fails a spec, not a caller. | [] |

### breaking-change-refused-by-a-contract-diff · MUST
A check compares the contract with the one last released and fails on a breaking change that ships without a new major version.

| Why | Tags |
|---|---|
| an incompatibility a tool finds before the merge costs nothing, and one a caller finds in production costs an outage. | [] |

## Shapes

### answer-built-from-a-declared-shape · MUST
An answer carries only the fields of the shape declared for it, never an entity or a stored record serialised whole.

| Why | Tags |
|---|---|
| an entity sent whole sends every field later added to it — a hash, an internal flag, another caller's data — to every caller. | [security, data] |

### request-binds-only-declared-fields · MUST
A request sets only the fields its operation's declared shape lets a caller set; what the program decides — an identifier, an owner, a role, a status — is never read from it.

| Why | Tags |
|---|---|
| a caller who adds `role: admin` to a body otherwise grants it to themselves. | [security] |

## Effects

### write-takes-an-idempotency-key → operation-idempotent-by-design · SHOULD
A write that a repeat would perform twice — a creation, a payment, a message sent — takes an idempotency key: a repeat with a key already seen gets the first answer without running again, and the key reused with another request is refused.

| Why | Tags |
|---|---|
| a caller retries a write whose answer it lost, and without the key the retry creates a second order. | [data] |

## Change

### published-contract-changed-only-by-addition · MUST
A published contract changes only by addition — a new operation, a new optional field of a request, a new field of an answer; a removal or a change of meaning ships as a new version beside the old one.

| Why | Tags |
|---|---|
| a caller the program does not deploy breaks the day a field it reads disappears or changes meaning. | [] |

### retired-operation-announced-before-removal · MUST
An operation or a field a published contract retires is announced before it is removed, and removed no earlier than its announced date.

| Why | Tags |
|---|---|
| a caller learns of a removal from the answers it already reads, in time to move, instead of from the failure on the day it happens. | [] |

### answer-enumeration-declared-open · MUST
An enumeration in an answer is declared open: a caller is told to handle a value it does not know.

| Why | Tags |
|---|---|
| a client generated from a closed enumeration fails on its first new value, so adding one would break it. | [] |

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
