# Failures

> Governs a message whose handling fails: its settlement, its retries, its dead letters and the compensation of a process.

## Settlement

### failed-message-settled-by-its-failure → last-resort-handler-one-per-entry · MUST
A consumer's handler of last resort settles every failed message by its failure: one that cannot succeed — it fails its parse, names what does not exist, breaks a rule of the domain — goes to its dead letters at once, a transient one is released for a later delivery, and none is acknowledged as done.

| Why | Tags |
|---|---|
| a poison message retried returns for ever and blocks those behind it, a transient failure dead-lettered loses work a retry would have done, and a failure acknowledged is lost. | [errors] |

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

## Processes

### multi-step-process-compensated · SHOULD
A business process that spans several programs or transactions keeps its state in a store, runs each step in a transaction of its own, and runs a compensating step for each step already done when a later one fails for good or a wait for a reply passes its deadline.

| Why | Tags |
|---|---|
| no transaction spans programs, so a process that fails midway is either undone step by step or left half done, and one whose state lives only in memory is lost with the process that held it. | [data, errors] |
