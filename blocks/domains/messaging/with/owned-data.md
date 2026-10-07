# Messaging with owned data

> Governs a change and its message written together, a message recorded with its effect, and a queue kept in the store.

## Outbox

### change-and-its-message-written-through-an-outbox → write-lands-whole · MUST
A message about a change to owned data is written to an outbox in the store, in the transaction of the change, and sent by a relay after the commit — never published inside the transaction or from a hook after it.

| Why | Tags |
|---|---|
| a message published inside the transaction announces a change that may roll back, and one published after the commit is lost when the process stops between the two. | [data] |

### outbox-relayed-in-commit-order-per-key · MUST
The relay of an outbox sends the messages of one ordering key in the order they were committed, marks a message sent only once the broker confirmed it, and resumes from the first unsent after a stop.

| Why | Tags |
|---|---|
| a relay that skips ahead or marks a message before its confirmation reorders or loses exactly what the outbox was written to keep. | [data] |

## Inbox

### processed-message-recorded-with-its-effect → write-lands-whole · MUST
A consumer whose effect is a change to owned data records the message's identifier in the transaction of that change, under a constraint unique per consumer and identifier, so a redelivery finds it and a concurrent copy fails on it.

| Why | Tags |
|---|---|
| an identifier recorded apart from its effect leaves a window where a crash repeats the effect, and a check without a constraint lets two concurrent copies both pass. | [data] |

## Queues in the store

### stored-queue-claims-in-one-conditional-write → write-on-read-data-is-conditional · MUST
A queue kept in the program's own store claims each message in one conditional write — a row lock that skips claimed rows, or an update conditional on its state — with a lease that returns it when it expires, never by a read and a later write of its status.

| Why | Tags |
|---|---|
| two workers that read the same status both claim the message, and a claim written after the work was handed out races the worker and strands the row. | [data] |
