# Messages

> Governs a message: its identity, its contract and what it carries.

## Identity

### message-carries-a-stable-id-type-source-and-time → operation-idempotent-by-design · MUST
A message carries an identifier its publisher mints once per occurrence and keeps across every retry, its type, its source and the time of what it records — in CloudEvents' names where the broker leaves the choice.

| Why | Tags |
|---|---|
| a consumer tells a redelivery from a new message only by an identifier that survives every retry, and one the broker mints anew on each send defeats every check of duplicates. | [data] |

### message-carries-its-correlation-and-causation · SHOULD
A message carries the correlation identifier of the work that began its chain and, as its causation identifier, the identifier of the message or request that caused it.

| Why | Tags |
|---|---|
| a chain of messages crosses programs, queues and days, and only these two identifiers tie a reply to its request and a late effect to its cause after the traces are sampled away. | [] |

## Contract

### message-contract-published-machine-readable · MUST
A message another program sends or reads — its channel, its type and the schema of each version — is declared in a document a machine reads, such as AsyncAPI, kept in the repository, and a spec checks every message the program sends against it.

| Why | Tags |
|---|---|
| publishers and consumers deploy apart and read one contract, and a publisher that drifts from it fails a spec, not a consumer in production. | [] |

### message-type-changed-only-by-addition → format-changed-in-steps · MUST
A message type another program reads changes only by addition — a new optional field; a removal, a rename or a change of meaning is a new version of the type, published beside the old one until no consumer reads it.

| Why | Tags |
|---|---|
| a queue and a log keep messages written before the change, and consumers deployed before it read them and the new ones alike. | [data] |

### message-contract-change-refused-by-a-diff · MUST
A check compares the schema of every message type another program reads with the one last released, and fails on a change that is not an addition.

| Why | Tags |
|---|---|
| a queue keeps messages of the old shape and consumers deployed before the change read the new one, so an incompatibility a tool finds before the merge is one no consumer meets. | [data] |

## Content

### message-carries-only-its-declared-fields · MUST
A message carries only the fields its type declares — the identifiers and the facts of what happened — never an entity or a stored record serialised whole.

| Why | Tags |
|---|---|
| a record sent whole sends every field later added to it to every subscriber, and ties each of them to the publisher's storage. | [data, security] |

### message-carries-no-secret → secret-and-personal-data-kept-out-of-output · MUST
A message carries no secret — a password, a token, a key — and no personal data its consumers do not need, which they otherwise reach by an identifier.

| Why | Tags |
|---|---|
| a broker keeps messages, their copies in dead letters and their replays beyond the reach of a rotation or an erasure, and every subscriber reads them. | [security, data] |
