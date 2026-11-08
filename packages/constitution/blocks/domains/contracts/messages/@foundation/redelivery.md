# Redelivery

> Governs a message whose handling fails: its settlement, its retries and its dead letters, and the specs that redeliver and reorder messages.

## Settlement

### refused-message-acknowledged-as-handled → last-resort-handler-one-per-interface · MUST

Every message refused by a rule of the business is acknowledged as handled by its message consumer's handler of last resort. Its outcome is recorded or published. Exempt: a message that hands the program's own event to what reacts to it within the program.

| Why |
|---|
| a refusal dead-lettered pages someone for an outcome of the business, and one released is refused again on every delivery. |

### failed-message-settled-by-its-failure → last-resort-handler-one-per-interface · MUST

Every message whose handling can never succeed goes to its dead letters at once, by its message consumer's handler of last resort. Such a message fails its parse, has a type or a version its message consumer does not know, or met a defect in its handling.

| Why |
|---|
| a poison message retried returns for ever and blocks those behind it. |

### transient-failure-releases-its-message → last-resort-handler-one-per-interface · MUST

Every message whose handling failed transiently is released for a later delivery by its message consumer's handler of last resort. A message that names what has not arrived yet failed transiently.

| Why |
|---|
| across ordering keys a message often arrives before the one that creates what it names, so a dead letter for it loses work that a later delivery would have done. |

## Retries

### redelivery-waits-a-growing-delay → retry-waits-by-backoff-or-the-asked-delay · MUST

Every message released after a transient failure waits a growing, randomly spread delay before its next delivery. The delay is set on the message broker or the message consumer, never left at the message broker's default of redelivering at once.

| Why |
|---|
| a message broker often redelivers a released message at once, into the same outage, so every message consumer's retries land on the system that is down together. |

### redelivery-limited-then-dead-lettered → failure-retried-only-when-transient · MUST

Every released message goes to its dead letters once delivered as often as the project's limit allows. The message broker counts the deliveries, and whatever takes the message reads its count there, keeping no count of its own.

| Why |
|---|
| a message retried without a limit never leaves the queue, and a count the message consumer keeps on top of the message broker's multiplies the attempts the project meant to allow. |

## Dead letters

### dead-letter-keeps-what-a-replay-needs · MUST

Every dead letter keeps its message whole, with the cause of its last failure. That is the message's body, its headers and its count of attempts, and the code and the cause of the failure.

| Why |
|---|
| a dead letter without its cause cannot be diagnosed, and one without its body or headers cannot be replayed. |

### dead-letter-leaves-only-by-its-operators-command · MUST

Every dead letter leaves its dead letters only by its operator's command. The command hands it on again once the fault is fixed, or gives it up. Exempt: a dead letter of another program's message whose data a retention the project sets forbids keeping longer, which leaves as abandoned once that retention ends.

| Why |
|---|
| a dead letter sent back automatically fails again for the same reason, and one dropped by a purge or by the message broker's default retention loses work nobody decided to give up. |

### abandoned-dead-letter-reported-to-its-operator · MUST

Every dead letter of another program's message that leaves once its data's retention ends is reported to its operator as abandoned.

| Why |
|---|
| a dead letter that leaves unreported is work abandoned with nobody aware, so its operator learns of it only from the effect that never came. |

### key-held-while-its-message-is-dead-lettered · MUST

Where their order matters to its message consumer, each later message of a key is held while an earlier one is dead-lettered. Exempt: a message that hands the program's own event to what reacts to it within the program.

| Why |
|---|
| a later change applied on top of one that never took effect leaves the object in a state no sequence of its changes produces. |

### dead-letter-holds-back-only-its-key · MUST

Where it holds back later messages, every dead letter holds back only those of its own ordering key, never another key's.

| Why |
|---|
| a dead letter that stops its whole partition or queue holds every other object's changes for as long as its operator takes, though none of them depends on the one that failed. |

## Specs

### redelivery-has-a-case → edge-cases-chosen-by-risk · SHOULD

Every message consumer's specs deliver one message twice and check that its effect happened once.

| Why |
|---|
| redelivery is rare on a developer's machine and certain in production, so only a case exercises it before a customer is charged twice. |

### reordering-has-a-case → edge-cases-chosen-by-risk · SHOULD

Every message consumer to which order matters has a case that delivers two messages of one ordering key out of order.

| Why |
|---|
| reordering is rare on a developer's machine and certain under competing message consumers, so only a case shows what the message consumer does with an older state that arrives last. |
