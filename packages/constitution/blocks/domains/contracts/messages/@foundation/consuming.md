# Consuming

> Governs how a message is received, parsed, processed once in effect and acknowledged.

## Processing once

### message-processed-once-per-consumer → receiver-gives-a-repeat-the-first-effect · MUST

Every message consumer acts once on each message identifier it receives, whatever another message consumer has done with that message.

| Why |
|---|
| a message broker delivers at least once (after a lost acknowledgement, an expired lease, a producer's retry), so an effect run for each copy repeats a payment or a message, and a record shared between message consumers lets the first that acts silence the others — the idempotent receiver. |

### stale-message-refused-by-its-version · MUST

Every message that says what an object became is applied only over an older version of that object. It carries that object's version, and its message consumer applies it only when that version is newer than the one it holds.

| Why |
|---|
| redeliveries and competing message consumers bring messages out of order, and an older state applied after a newer one undoes it. |

## Receiving

### message-parsed-against-its-types-schema → outside-value-untyped-until-parsed · MUST

Every message consumer parses each message by the schema that the message's own type and version declare.

| Why |
|---|
| a message is outside input written by another release of another program, so one parsed by the schema of another version reads its fields wrong and fails halfway through its work — parse, don't validate. |

### messages-in-flight-bounded → kept-collection-bounded · MUST

Every message consumer holds at most a set number of messages at once. Its prefetch, its batch and its concurrency are each set explicitly, never left at the client's default, and it takes no more until one is settled.

| Why |
|---|
| a client's default is often unbounded, so a backlog floods one instance's memory and starves the others, while a bound is how the queue pushes back — backpressure. |

## Acknowledgement

### message-acknowledged-after-its-work · MUST

Every message is acknowledged only once its handling has committed, never on receipt or ahead of it. Its handling has committed once the work it asks for has, or, for a message refused by a rule of the business, once its outcome is recorded or published. Acknowledging it is whatever its message broker takes as done, such as an acknowledgement its protocol defines, a deletion or a committed offset.

| Why |
|---|
| a message acknowledged before its work is lost when the message consumer stops midway, and at-least-once delivery holds only while the acknowledgement comes last. |

### taken-message-returns-when-its-lease-expires · MUST

Every message a message consumer takes returns to its message broker for a later delivery once its lease expires unsettled. Such a message broker includes a queue the program keeps in its own store.

| Why |
|---|
| a message taken with no lease is stranded for good when the message consumer that took it stops before it settles it. |

### message-lease-outlasts-its-handler · MUST

Every message's lease, such as a visibility timeout, a lock or an acknowledgement deadline, outlasts its handler. The message is never delivered again while its first delivery is still at work: the handler runs under a timeout shorter than the lease, or extends the lease while it works.

| Why |
|---|
| a lease that expires mid-work hands the message to a second message consumer, and two copies then run at once, past every check made before either committed. |

### stopping-consumer-releases-what-it-holds → program-stops-cleanly · MUST

Every stopping message consumer settles each message it holds before it exits, those it prefetched included.

| Why |
|---|
| a message taken and then dropped by a stopping message consumer waits out its lease before any other copy may handle it. |

### batch-settled-message-by-message · SHOULD

Every message consumer that takes messages in a batch settles each of them on its own. One failure neither repeats the messages already done nor acknowledges the one that failed.

| Why |
|---|
| a batch settled whole either redelivers its successes on one failure or drops the failure with them. |
