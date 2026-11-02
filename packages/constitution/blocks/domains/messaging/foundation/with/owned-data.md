# Owned data

> Governs a change and its message written together, a message recorded with its effect, and a queue kept in the store.

## Outbox

### change-and-its-message-written-through-an-outbox → events-reach-reactions-after-their-change-commits · MUST

A change's message is published only by the relay of an outbox. The outbox is kept in the store the change is saved in, and no message is published by the code that saves the change or by a hook after its commit.

| Why |
|---|
| a message published inside the transaction announces a change that may roll back, and one a hook publishes after the commit is lost when the process stops between the two — the transactional outbox. |

### outbox-relayed-in-commit-order-per-key → events-reach-reactions-after-their-change-commits · MUST

An outbox is relayed in commit order, key by key. Its relay sends the messages of one ordering key in the order they were committed, marks a message sent only once the broker confirmed it, and resumes from the first unsent after a stop.

| Why |
|---|
| a relay that skips ahead or marks a message before its confirmation reorders or loses exactly what the outbox was written to keep. |

## Inbox

### processed-message-recorded-with-its-effect → write-lands-whole · MUST

A processed message is recorded with its effect. A consumer whose effect is a change to owned data records the message's identifier in the transaction of that change, under a constraint unique per consumer and identifier, so a redelivery finds it and a concurrent copy fails on it.

| Why |
|---|
| an identifier recorded apart from its effect leaves a window where a crash repeats the effect, and a check without a constraint lets two concurrent copies both pass — the idempotent receiver. |

## Queues in the store

### stored-queue-claims-in-one-conditional-write → write-on-read-data-is-conditional · MUST

A queue kept in the program's own store claims each message in one conditional write. The write is a row lock that skips claimed rows, or an update conditional on the message's state, with a lease that returns the message when it expires; the claim is never a read and a later write of its status.

| Why |
|---|
| two workers that read the same status both claim the message, and a claim written after the work was handed out races the worker and strands the row — competing consumers. |
