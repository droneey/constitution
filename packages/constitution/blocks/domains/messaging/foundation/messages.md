# Messages

> Governs a message: its identity, its contract and what it carries.

A **command message** is a request to act sent to another part, where an event announces what happened.

## Identity

### message-carries-a-stable-id-type-source-and-time · MUST

A message carries a stable identifier, its type, its source and its time. Its publisher mints the identifier once per occurrence and keeps it across every retry, the time is that of what the message records, and each is written in CloudEvents' names where the broker leaves the choice.

| Why |
|---|
| a consumer tells a redelivery from a new message only by an identifier that survives every retry, and one the broker mints anew on each send defeats every check of duplicates, while a message without its type, source and time cannot be routed, traced to its sender or placed among the others — CloudEvents. |

### message-carries-its-correlation-and-causation · SHOULD

A message carries its correlation and its causation. Its correlation identifier is that of the work that began its chain, and its causation identifier that of the message or request that caused it.

| Why |
|---|
| a chain of messages crosses programs, queues and days, so once its traces are sampled away a message without these two identifiers leaves a reply that matches no request and a late effect nobody can trace to its cause. |

## Contract

### message-contract-published-machine-readable → format-others-read-declared-in-a-schema · MUST

A message another program sends or reads is declared with its channel in a contract a machine reads. The contract, a document such as AsyncAPI, declares the message's channel, its type and the schema of each of its versions, a message the program only consumes included.

| Why |
|---|
| publishers and consumers deploy apart, so a message whose channel or version no contract names, or one the program consumes undeclared, breaks a consumer in production instead of a spec before the merge — a published language. |

### message-type-changed-only-by-addition → format-changed-in-steps · MUST

A message type another program reads changes only by addition. An addition is a new optional field; a removal, a rename or a change of meaning is a new version of the type, published beside the old one until no consumer reads it, and a check against the last released schema fails on any other change.

| Why |
|---|
| a queue and a log keep messages written before the change, and consumers deployed before it read them and the new ones alike, so a type changed in place breaks every consumer that still reads its old form — the expand–contract pattern. |

## Content

### message-carries-only-its-declared-fields → format-others-read-declared-in-a-schema · MUST

A message carries only its declared fields. They are its identifiers and what the message says — what happened, for an event, or what is asked, for a command message — and hold nothing of a domain object's or a stored record's state beyond that.

| Why |
|---|
| a message that carries the publisher's stored state ties each subscriber to the publisher's storage, so a change to that storage breaks subscribers that only needed what the message says. |

### message-carries-no-secret → secret-kept-out-of-output · MUST

A message carries no secret. No password, token, key or other secret travels in one.

| Why |
|---|
| a broker keeps a message, its copies in dead letters and its replays where no rotation or erasure reaches them, and every subscriber reads them, so a secret a message carried leaks to all of them. |
