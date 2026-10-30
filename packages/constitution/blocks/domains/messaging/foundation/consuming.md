# Consuming

> Governs how a message is received, parsed, processed once in effect and acknowledged.

## Processing once

### message-processed-once-per-consumer → operation-idempotent-by-design · MUST

A consumer processes each message once in effect: a message whose identifier it has processed is acknowledged and not acted on again, the identifiers kept per consumer for as long as the broker can redeliver a message, and then dropped.

| Why |
|---|
| a broker delivers at least once — after a lost acknowledgement, an expired lease, a producer's retry — and an effect run for each copy repeats a payment or a message; a record dropped too early lets a late redelivery through. |

### stale-message-refused-by-its-version → write-on-read-data-is-conditional · MUST

A message that carries the state of an object carries that object's version, and a consumer applies it only when the version is newer than the one it holds.

| Why |
|---|
| redeliveries and competing consumers bring messages out of order, and an older state applied after a newer one undoes it. |

## Receiving

### message-parsed-against-its-types-schema → outside-value-untyped-until-parsed · MUST

A consumer parses each message against the schema its type and version declare before any of its work runs, and a message that fails the parse is a failure that cannot succeed.

| Why |
|---|
| a message is outside input written by another release of another program, and one acted on before its parse fails halfway through its work. |

### messages-in-flight-bounded → growing-collection-bounded · MUST

A consumer holds at most a set number of messages at once — its prefetch, its batch and its concurrency each set explicitly, never left at the client's default — and takes no more until one is settled.

| Why |
|---|
| a client's default is often unbounded, so a backlog floods one instance's memory and starves the others, while a bound is how the queue pushes back. |

## Acknowledgement

### message-acknowledged-after-its-work · MUST

A message is acknowledged — settled, deleted or its offset committed — only once the work it asks for has committed; no consumer acknowledges on receipt or commits an offset ahead of its work.

| Why |
|---|
| a message acknowledged before its work is lost when the consumer stops midway, and at-least-once delivery holds only while the acknowledgement comes last. |

### message-lease-outlasts-its-handler · MUST

A handler runs under a timeout shorter than its message's lease — the visibility timeout, the lock, the acknowledgement deadline — or extends the lease while it works, so a message is never delivered again while its first delivery is still at work.

| Why |
|---|
| a lease that expires mid-work hands the message to a second consumer, and two copies then run at once, past every check made before either committed. |

### stopping-consumer-releases-what-it-holds → program-stops-cleanly · MUST

A consumer told to stop takes no new message, and settles each message it holds, or releases it to the broker — those it prefetched included — before it exits.

| Why |
|---|
| a message taken and then dropped by a stopping consumer waits out its lease before any other copy may handle it. |

### batch-settled-message-by-message · SHOULD

A consumer that takes messages in a batch settles each message on its own, so one failure neither repeats the messages already done nor acknowledges the one that failed.

| Why |
|---|
| a batch settled whole either redelivers its successes on one failure or drops the failure with them. |
