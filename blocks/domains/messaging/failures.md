# Failures

> Governs a message whose handling fails: its settlement, its retries and its dead letters.

## Settlement

### failed-message-settled-by-its-failure → last-resort-handler-one-per-entry · MUST
A consumer's handler of last resort settles every failed message by its failure: an expected failure of the domain — a refusal its rules make — is acknowledged as handled, its outcome recorded or published; one that can never succeed — it fails its parse, its type or version is unknown, or a defect broke its handling — goes to its dead letters at once; and a transient one, a message naming what has not arrived yet among them, is released for a later delivery.

| Why | Tags |
|---|---|
| a refusal is an outcome of the business and no fault to page anyone for, a poison message retried returns for ever and blocks those behind it, and across ordering keys a message often arrives before the one that creates what it names. | [errors] |

## Retries

### redelivery-delayed-and-limited → failure-retried-only-when-transient · MUST
A message released after a transient failure is delivered again after a growing, randomly spread delay, and past a number of attempts the project sets it goes to its dead letters.

| Why | Tags |
|---|---|
| an immediate redelivery hits the same outage and deepens it, and a message retried without a limit never leaves the queue. | [errors, performance] |

## Dead letters

### dead-letter-keeps-the-message-and-its-cause · MUST
A dead-lettered message keeps its body, its headers, its count of attempts and the code and cause of its last failure, and goes back to its queue only by a command run once the fault is fixed.

| Why | Tags |
|---|---|
| a dead letter without its cause cannot be diagnosed, one without its body cannot be replayed, and one sent back automatically fails again for the same reason. | [errors, data] |
