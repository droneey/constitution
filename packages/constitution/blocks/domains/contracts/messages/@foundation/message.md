# Message

> Governs a message: its identity, its contract and what it carries.

## Vocabulary

A message, in this block, is a record a program hands, through a message broker, to another program or to itself: an event, which announces what happened, or a **command message**, which asks its receiver to act.

A **message broker** is the system that keeps messages between those that publish and consume them, such as a broker service, an event log or a queue the program keeps in its own store.

A **message consumer** is the part of a program that takes messages from a message broker and runs the work each asks for.

A message consumer **settles** a message by acknowledging it as done, releasing it to the message broker for a later delivery, or moving it to its **dead letters**, where it waits for its operator. A **dead letter** is a message that waits in its dead letters.

A **message channel** is where a message broker keeps messages for the message consumers that read them, such as a topic, a queue or a stream.

An **ordering key** is the value by which a message broker keeps messages in order: it keeps the order only among the messages of one key, such as a partition key, a message group or a session.

## Identity

### message-identifier-kept-across-retries → idempotency-key-minted-once-per-intent · MUST

Every message carries an identifier its publisher mints once per occurrence and keeps across every retry. No message broker or publishing step mints it anew on a send.

| Why |
|---|
| a message consumer tells a redelivery from a new message only by an identifier that survives every retry, and one minted anew on each send defeats every check of duplicates — the idempotent receiver. |

### message-carries-its-context-attributes · MUST

Every message carries its type, its source and its time. Where the message broker leaves the choice of names, they carry CloudEvents' names. The time is that of what the message records, never that of its send. Exempt: a message whose source gives no time for what it records, which carries the time of its send.

| Why |
|---|
| a message without its type, source and time cannot be routed, traced to its sender or placed among the others, and names each program chooses its own way make every message consumer map them again, while a source that never learns when its fact happened has only its send to give, as CloudEvents allows — CloudEvents. |

### message-carries-its-correlation · SHOULD

Every message carries the correlation identifier of the work that began its chain.

| Why |
|---|
| a chain of messages crosses programs, queues and days, so once its traces are sampled away a message without its correlation leaves a reply that matches no request. |

### message-carries-its-causation · SHOULD

Every message carries the causation identifier of the message or request that caused it.

| Why |
|---|
| a late effect whose message names no cause cannot be traced to the step that set it off once the traces of its chain are sampled away. |

## Contract

### message-contract-published-machine-readable → shared-format-declared-in-a-schema · MUST

Every message another program sends or reads is declared in a contract a machine reads, a message the program only consumes included. The contract, a document such as AsyncAPI, declares its message channel, its type and the schema of each of its versions.

| Why |
|---|
| publishers and message consumers deploy apart, so a message whose message channel or version no contract names, or one the program consumes undeclared, breaks a message consumer in production instead of a spec before the merge — a published language. |

### message-type-changed-only-by-addition → format-changed-in-steps · MUST

Every message type another program reads changes in place only by addition. An addition is a new optional field; a removal, a rename or a change of meaning is a new version of the type, published beside the old one until no message consumer reads it or the date announced for its end has passed.

| Why |
|---|
| a queue and a log keep messages written before the change, and message consumers deployed before it read them and the new ones alike, so a type changed in place breaks every message consumer that still reads its old form — the expand–contract pattern. |

## Content

### message-carries-no-stored-state → format-written-with-only-its-declared-fields · MUST

Every message holds only its identifiers and what it says, never the publisher's stored state beyond that. What it says is what happened, for an event, or what is asked, for a command message. Exempt: the new state of the object an event announces, in fields its contract declares.

| Why |
|---|
| a message that carries the publisher's stored state ties each message consumer to the publisher's storage, so a change to that storage breaks message consumers that only needed what the message says, while a new state in declared fields is a contract the publisher keeps whatever its storage, which spares each consumer a call back — event-carried state transfer (Fowler). |

### message-carries-no-secret → secret-kept-out-of-output · MUST

No message carries a secret, one handed to its owner included.

| Why |
|---|
| a message broker keeps a message, its copies in dead letters and its replays where no rotation or erasure reaches them, and every message consumer reads them, so a secret a message carried leaks to all of them. |
