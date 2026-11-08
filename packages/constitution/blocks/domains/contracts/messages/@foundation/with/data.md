# Data

> Governs how a relay publishes an event outbox to a message broker, a message recorded with its effect, and how a queue kept in the store claims a message.

## Outbox

### outbox-relayed-in-commit-order-per-key → outbox-relay-misses-no-committed-entry · MUST

Every relay that publishes an event outbox to a message broker publishes each ordering key's entries in their order of commit.

| Why |
|---|
| an outbox commits one key's entries in the order of their changes, and a relay that publishes them in another order hands its message consumers a later change before an earlier one. |

## Inbox

### processed-message-recorded-with-its-effect → write-lands-whole · MUST

Every message consumer whose effect is a change to owned data records the message's identifier in the transaction of that change. The record is unique per message consumer and identifier, held by the store as `invariant-also-held-by-the-store` gives, so a redelivery finds it and a concurrent copy fails on it. Exempt: an effect whose repeat changes nothing by an identifier derived from the message that the store holds unique.

| Why |
|---|
| an identifier recorded apart from its effect leaves a window where a crash repeats the effect — the idempotent receiver. |

## Queues in the store

### stored-queue-claims-in-one-conditional-write → write-on-read-data-is-conditional · MUST

Every queue kept in the program's own store claims each message in one conditional write, committed before the work begins. The write is an update conditional on the message's state, or one that takes a row lock skipping claimed rows, never a read and a later write of its status.

| Why |
|---|
| two message consumers that read the same status both claim the message, and a claim kept open through the work holds its transaction across whatever the work calls — competing message consumers. |
