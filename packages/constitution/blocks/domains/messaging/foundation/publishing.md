# Publishing

> Governs how a message is handed to the broker: its confirmation and its order.

## Confirmation

### publish-done-only-once-the-broker-confirms · MUST

A publish is done only once the broker confirms it. The confirmation — a publisher confirm, an acknowledgement of every in-sync replica — says the broker holds the message durably, and a publish not confirmed within its timeout fails, never passes as sent.

| Why |
|---|
| a broker that accepted a message into a buffer can lose it on a crash, and a publish counted as done before the confirmation loses it without a trace. |

## Order

### ordered-messages-share-an-ordering-key · MUST

Messages whose order matters share an ordering key. The changes of one object are published with that object's identifier as their ordering key — a partition key, a message group, a session — and no consumer counts on an order across keys.

| Why |
|---|
| a broker keeps order only within a key, and competing consumers otherwise apply a later change before an earlier one. |
