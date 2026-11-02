# Redelivery

> Governs a message whose handling fails — its settlement, its retries and its dead letters — and the specs that redeliver and reorder messages.

## Settlement

### failed-message-settled-by-its-failure → last-resort-handler-one-per-entry · MUST

A failed message is settled by its failure, in the consumer's handler of last resort. An expected failure of the domain — a refusal its rules make — is acknowledged as handled, its outcome recorded or published; one that can never succeed — it fails its parse, its type or version is unknown, or a defect broke its handling — goes to its dead letters at once; and a transient one, a message naming what has not arrived yet among them, is released for a later delivery.

| Why |
|---|
| a refusal dead-lettered pages someone for an outcome of the business, a poison message retried returns for ever and blocks those behind it, and across ordering keys a message often arrives before the one that creates what it names, so dead-lettering it loses work that would have succeeded. |

## Retries

### redelivery-delayed-and-limited → failure-retried-only-when-transient · MUST

A released message is redelivered after a delay, a limited number of times. After a transient failure it waits a growing, randomly spread delay before its next delivery, set on the broker or the consumer, never the broker's default of redelivering at once, and past a number of attempts the project sets it goes to its dead letters.

| Why |
|---|
| a broker often redelivers a released message at once, into the same outage, and a message retried without a limit never leaves the queue. |

## Dead letters

### dead-letter-keeps-the-message-and-its-cause · MUST

A dead letter keeps the message and the cause of its failure, and returns to its queue only by a command. It keeps the message's body, its headers and its count of attempts, and the code and cause of its last failure, and the command that sends it back is run once the fault is fixed.

| Why |
|---|
| a dead letter without its cause cannot be diagnosed, one without its body cannot be replayed, and one sent back automatically fails again for the same reason. |

### key-held-while-its-message-is-dead-lettered · SHOULD

A key's later messages are held while one of its messages is dead-lettered. A consumer for which the order of a key's messages matters holds them, or states why a gap in that key is safe.

| Why |
|---|
| a later change applied on top of one that never landed leaves the object in a state no sequence of its changes produces. |

## Specs

### redelivery-and-reordering-have-cases → edge-cases-chosen-by-risk · SHOULD

A consumer's specs redeliver and reorder its messages. It has a case that delivers one message twice and checks that its effect happened once, and, where order matters, a case that delivers two messages of one key out of order.

| Why |
|---|
| redelivery and reordering are rare on a developer's machine and certain in production, so only a case exercises them before a customer is charged twice. |
